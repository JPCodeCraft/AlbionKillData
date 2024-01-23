import axios from "axios";
import fs from "fs";
import path from "path";
import { KillEvent } from "./event-models";
import { Data, KillType } from "./data-model";

const logStream = fs.createWriteStream(path.join(__dirname, "..", "log.txt"), {
  flags: "a",
});
console.log = function (...args: any[]) {
  const message = `${new Date().toISOString()} - ${args.join(" ")}`;
  logStream.write(message + "\n");
  process.stdout.write(message + "\n");
};

async function fetchData(): Promise<KillEvent[]> {
  try {
    const requests = Array.from({ length: 5 }, (_, i) =>
      axios.get(
        `https://gameinfo.albiononline.com/api/gameinfo/events?limit=51&offset=${
          i * 51
        }`
      )
    );

    const responses = await Promise.all(requests);

    const killEvents = responses.flatMap((response) =>
      response.data.map((event: any) => ({
        ...event,
        TimeStamp: new Date(event.TimeStamp),
      }))
    );

    console.log(`Downloaded ${killEvents.length} events`);

    const uniqueKillEvents: KillEvent[] = Array.from(
      killEvents
        .reduce((map, event) => map.set(event.EventId, event), new Map())
        .values()
    );

    console.log(
      `${uniqueKillEvents.length} events left after removing duplicates`
    );

    return uniqueKillEvents.sort((a, b) => b.EventId - a.EventId);
  } catch (error) {
    console.log("Error fetching data:", error);
    throw error;
  }
}

function processKillEvents(killEvents: KillEvent[], data: Data): void {
  killEvents.forEach((event) => {
    // Ignore events that have already been processed
    if (event.EventId <= data.latestEventId) {
      console.log(
        `Ignoring event with ID ${event.EventId} as it's Id is smaller than the latest event Id.`
      );
      return;
    }
    // Determine the KillType for the event
    let killType: KillType;
    const participantsCount = event.Participants.length;
    if (participantsCount <= 1) {
      killType = "solo";
    } else if (participantsCount <= 2) {
      killType = "duo";
    } else if (participantsCount <= 5) {
      killType = "3-5";
    } else if (participantsCount <= 10) {
      killType = "6-10";
    } else {
      killType = ">10";
    }

    // Find the KillTypeData for the KillType of the event
    let killTypeDataItem = data.killTypeData.find(
      (ktd) => ktd.type === killType
    );

    // If there's no KillTypeData for this KillType, create one
    if (!killTypeDataItem) {
      killTypeDataItem = { type: killType, dateData: [] };
      data.killTypeData.push(killTypeDataItem);
    }

    // Find the dateData for the date of the event
    let dateDataItem = killTypeDataItem.dateData.find(
      (dd) =>
        dd.date.toISOString().split("T")[0] ===
        event.TimeStamp.toISOString().split("T")[0]
    );

    // If there's no dateData for this date, create one
    if (!dateDataItem) {
      const dateWithZeroTime = new Date(event.TimeStamp.setHours(0, 0, 0, 0));
      dateDataItem = { date: dateWithZeroTime, eventsCount: 0, itemData: [] };
      killTypeDataItem.dateData.push(dateDataItem);
    }

    // Increment the eventsCount
    dateDataItem.eventsCount++;

    // Sum the amounts of items based on the Type
    [event.Killer, event.Victim, ...event.Participants].forEach((player) => {
      Object.values(player.Equipment).forEach((item) => {
        if (item && dateDataItem) {
          let itemDataItem = dateDataItem.itemData.find(
            (id) => id.Type === item.Type
          );

          // If there's no itemData for this Type, create one
          if (!itemDataItem) {
            itemDataItem = {
              Type: item.Type,
              killerCount: 0,
              victimCount: 0,
              participantsCount: 0,
            };
            dateDataItem.itemData.push(itemDataItem);
          }

          // Increment the appropriate count
          if (player === event.Killer) {
            itemDataItem.killerCount++;
          } else if (player === event.Victim) {
            itemDataItem.victimCount++;
          } else if (player.Name !== event.Killer.Name) {
            // Check if participant's name is not the same as the killer's name
            itemDataItem.participantsCount++;
          }
        }
      });
    });

    // Sort the itemData array by killerAmount in descending order
    if (dateDataItem) {
      dateDataItem.itemData.sort((a, b) => b.killerCount - a.killerCount);
    }
  });
}

async function main() {
  const killEvents: KillEvent[] = await fetchData();

  // Define the path to the data.json file
  const dataFilePath = path.resolve(__dirname, "..", "data.json");

  // Read or create the data.json file
  let data: Data;
  if (fs.existsSync(dataFilePath)) {
    const rawData = fs.readFileSync(dataFilePath, "utf-8");
    data = JSON.parse(rawData);

    // Convert date strings back to Date objects
    data.killTypeData.forEach((ktd) => {
      ktd.dateData.forEach((dd) => (dd.date = new Date(dd.date)));
    });
  } else {
    data = { latestEventId: 0, killTypeData: [] };
    fs.writeFileSync(dataFilePath, JSON.stringify(data), "utf-8");
  }

  // Process the killEvents
  processKillEvents(killEvents, data);

  data.latestEventId = killEvents[0].EventId;

  // Cleanup old data
  cleanupOldData(data);

  // Write the updated data back to the file
  fs.writeFileSync(dataFilePath, JSON.stringify(data), "utf-8");
}

main().catch((error) => {
  console.log("An error occurred in the main function:", error);
  process.exit(1);
});

function cleanupOldData(data: Data): void {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  data.killTypeData.forEach((ktd) => {
    const oldData = ktd.dateData.filter((dd) => dd.date < sevenDaysAgo);
    oldData.forEach((dd) => {
      console.log(
        `Deleted data from ${dd.date.toISOString()} for kill type ${ktd.type}`
      );
    });

    ktd.dateData = ktd.dateData.filter((dd) => dd.date >= sevenDaysAgo);
  });
}
