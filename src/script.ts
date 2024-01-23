import axios from "axios";
import fs from "fs";
import path from "path";
import { KillEvent } from "./event-models";
import { Data, KillType } from "./data-model";

const retentionDays = 7;
const retentionTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

const logFilePath = path.join(__dirname, "..", "log.txt");
const logStream = fs.createWriteStream(logFilePath, {
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
        `Ignoring event with ID ${event.EventId} as it's ID is smaller than the latest event ID ${data.latestEventId}.`
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

  console.log(`Successfully processed ${killEvents.length} kill events.`);
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

  // Reverse the order of the logs
  if (fs.existsSync(logFilePath)) {
    const logData = fs.readFileSync(logFilePath, "utf-8");
    const logLines = logData.split("\n");

    const sortedLogLines = logLines.sort((a, b) => {
      const dateA = new Date(a.split(" - ")[0]);
      const dateB = new Date(b.split(" - ")[0]);
      return dateB.getTime() - dateA.getTime(); // sort in descending order
    });

    fs.writeFileSync(logFilePath, sortedLogLines.join("\n"), "utf-8");
  }
}

main().catch((error) => {
  console.log("An error occurred in the main function:", error);
  process.exit(1);
});

function cleanupOldData(data: Data): void {
  // Cleanup old events
  data.killTypeData.forEach((ktd) => {
    const oldData = ktd.dateData.filter(
      (dd) => dd.date.getTime() < retentionTime
    );
    oldData.forEach((dd) => {
      console.log(
        `Deleted data from ${dd.date.toISOString()} for kill type ${ktd.type}`
      );
    });

    ktd.dateData = ktd.dateData.filter(
      (dd) => dd.date.getTime() >= retentionTime
    );
  });

  // Cleanup old log entries
  if (fs.existsSync(logFilePath)) {
    const logData = fs.readFileSync(logFilePath, "utf-8");
    const logLines = logData.split("\n");

    const filteredLogLines = logLines.filter((line) => {
      const timestamp = new Date(line.split(" - ")[0]).getTime();
      return timestamp >= retentionTime;
    });

    fs.writeFileSync(logFilePath, filteredLogLines.join("\n"), "utf-8");
  }
}
