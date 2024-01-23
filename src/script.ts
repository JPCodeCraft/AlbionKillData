import axios from "axios";
import fs from "fs";
import path from "path";
import { killEvent } from "./event-models";
import { data } from "./data-model";

async function fetchData(): Promise<killEvent[]> {
  try {
    const response = await axios.get(
      "https://gameinfo.albiononline.com/api/gameinfo/events?limit=51&offset=0"
    );
    return response.data.map((event: any) => ({
      ...event,
      TimeStamp: new Date(event.TimeStamp),
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function processKillEvents(
  killEvents: killEvent[],
  data: data,
  dataFilePath: string
): void {
  killEvents.forEach((event) => {
    // Ignore events that have already been processed
    if (event.EventId <= data.latestEventId) {
      return;
    }

    // Find the dateData for the date of the event
    let dateDataItem = data.dateData.find(
      (dd) =>
        dd.date.toISOString().split("T")[0] ===
        event.TimeStamp.toISOString().split("T")[0]
    );

    // If there's no dateData for this date, create one
    if (!dateDataItem) {
      const dateWithZeroTime = new Date(event.TimeStamp.setHours(0, 0, 0, 0));
      dateDataItem = { date: dateWithZeroTime, itemData: [] };
      data.dateData.push(dateDataItem);
    }

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
              killerAmount: 0,
              victimAmount: 0,
              participantsAmount: 0,
            };
            dateDataItem.itemData.push(itemDataItem);
          }

          // Increment the appropriate amount
          if (player === event.Killer) {
            itemDataItem.killerAmount += item.Count;
          } else if (player === event.Victim) {
            itemDataItem.victimAmount += item.Count;
          } else {
            itemDataItem.participantsAmount += item.Count;
          }
        }
      });
    });
  });

  // Write the updated data back to the file
  fs.writeFileSync(dataFilePath, JSON.stringify(data), "utf-8");
}

async function main() {
  const killEvents: killEvent[] = await fetchData();
  const latestEventId = killEvents[0].EventId;

  console.log(killEvents);

  // Define the path to the data.json file
  const dataFilePath = path.resolve(__dirname, "..", "data.json");

  // Read or create the data.json file
  let data: data;
  if (fs.existsSync(dataFilePath)) {
    const rawData = fs.readFileSync(dataFilePath, "utf-8");
    data = JSON.parse(rawData);
  } else {
    data = { latestEventId: 0, dateData: [] };
    fs.writeFileSync(dataFilePath, JSON.stringify(data), "utf-8");
  }

  data.latestEventId = latestEventId;

  // Process the killEvents
  processKillEvents(killEvents, data, dataFilePath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
