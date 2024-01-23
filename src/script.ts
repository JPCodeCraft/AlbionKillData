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
      numberOfParticipants: event.numberOfParticipants,
      EventId: event.EventId,
      TimeStamp: new Date(event.TimeStamp),
      Killer: {
        Name: event.Killer.Name,
        Id: event.Killer.Id,
        AverageItemPower: event.Killer.AverageItemPower,
        Equipment: {
          MainHand: event.Killer.Equipment.MainHand,
          OffHand: event.Killer.Equipment.OffHand,
          Head: event.Killer.Equipment.Head,
          Armor: event.Killer.Equipment.Armor,
          Shoes: event.Killer.Equipment.Shoes,
          Bag: event.Killer.Equipment.Bag,
          Cape: event.Killer.Equipment.Cape,
          Mount: event.Killer.Equipment.Mount,
          Potion: event.Killer.Equipment.Potion,
          Food: event.Killer.Equipment.Food,
          Inventory: event.Killer.Equipment.Inventory,
        },
      },
      Victim: {
        Name: event.Victim.Name,
        Id: event.Victim.Id,
        AverageItemPower: event.Victim.AverageItemPower,
        Equipment: {
          MainHand: event.Victim.Equipment.MainHand,
          OffHand: event.Victim.Equipment.OffHand,
          Head: event.Victim.Equipment.Head,
          Armor: event.Victim.Equipment.Armor,
          Shoes: event.Victim.Equipment.Shoes,
          Bag: event.Victim.Equipment.Bag,
          Cape: event.Victim.Equipment.Cape,
          Mount: event.Victim.Equipment.Mount,
          Potion: event.Victim.Equipment.Potion,
          Food: event.Victim.Equipment.Food,
          Inventory: event.Victim.Equipment.Inventory,
        },
      },
      Participants: event.Participants.map((participant: any) => ({
        Name: participant.Name,
        Id: participant.Id,
        AverageItemPower: participant.AverageItemPower,
        Equipment: {
          MainHand: participant.Equipment.MainHand,
          OffHand: participant.Equipment.OffHand,
          Head: participant.Equipment.Head,
          Armor: participant.Equipment.Armor,
          Shoes: participant.Equipment.Shoes,
          Bag: participant.Equipment.Bag,
          Cape: participant.Equipment.Cape,
          Mount: participant.Equipment.Mount,
          Potion: participant.Equipment.Potion,
          Food: participant.Equipment.Food,
          Inventory: participant.Equipment.Inventory,
        },
      })),
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
