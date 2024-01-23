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
          MainHand: event.Killer.Equipment.MainHand
            ? {
                Type: event.Killer.Equipment.MainHand.Type,
                Count: event.Killer.Equipment.MainHand.Count,
                Quality: event.Killer.Equipment.MainHand.Quality,
              }
            : null,
          OffHand: event.Killer.Equipment.OffHand
            ? {
                Type: event.Killer.Equipment.OffHand.Type,
                Count: event.Killer.Equipment.OffHand.Count,
                Quality: event.Killer.Equipment.OffHand.Quality,
              }
            : null,
          Head: event.Killer.Equipment.Head
            ? {
                Type: event.Killer.Equipment.Head.Type,
                Count: event.Killer.Equipment.Head.Count,
                Quality: event.Killer.Equipment.Head.Quality,
              }
            : null,
          Armor: event.Killer.Equipment.Armor
            ? {
                Type: event.Killer.Equipment.Armor.Type,
                Count: event.Killer.Equipment.Armor.Count,
                Quality: event.Killer.Equipment.Armor.Quality,
              }
            : null,
          Shoes: event.Killer.Equipment.Shoes
            ? {
                Type: event.Killer.Equipment.Shoes.Type,
                Count: event.Killer.Equipment.Shoes.Count,
                Quality: event.Killer.Equipment.Shoes.Quality,
              }
            : null,
          Bag: event.Killer.Equipment.Bag
            ? {
                Type: event.Killer.Equipment.Bag.Type,
                Count: event.Killer.Equipment.Bag.Count,
                Quality: event.Killer.Equipment.Bag.Quality,
              }
            : null,
          Cape: event.Killer.Equipment.Cape
            ? {
                Type: event.Killer.Equipment.Cape.Type,
                Count: event.Killer.Equipment.Cape.Count,
                Quality: event.Killer.Equipment.Cape.Quality,
              }
            : null,
          Mount: event.Killer.Equipment.Mount
            ? {
                Type: event.Killer.Equipment.Mount.Type,
                Count: event.Killer.Equipment.Mount.Count,
                Quality: event.Killer.Equipment.Mount.Quality,
              }
            : null,
          Potion: event.Killer.Equipment.Potion
            ? {
                Type: event.Killer.Equipment.Potion.Type,
                Count: event.Killer.Equipment.Potion.Count,
                Quality: event.Killer.Equipment.Potion.Quality,
              }
            : null,
          Food: event.Killer.Equipment.Food
            ? {
                Type: event.Killer.Equipment.Food.Type,
                Count: event.Killer.Equipment.Food.Count,
                Quality: event.Killer.Equipment.Food.Quality,
              }
            : null,
        },
        Inventory: event.Killer.Inventory
          ? event.Killer.Inventory.map((inventoryItem: any) => {
              if (inventoryItem) {
                return {
                  Type: inventoryItem.Type,
                  Count: inventoryItem.Count,
                  Quality: inventoryItem.Quality,
                };
              } else {
                return null;
              }
            })
          : [],
      },
      Victim: {
        Name: event.Victim.Name,
        Id: event.Victim.Id,
        AverageItemPower: event.Victim.AverageItemPower,
        Equipment: {
          MainHand: event.Victim.Equipment.MainHand
            ? {
                Type: event.Victim.Equipment.MainHand.Type,
                Count: event.Victim.Equipment.MainHand.Count,
                Quality: event.Victim.Equipment.MainHand.Quality,
              }
            : null,
          OffHand: event.Victim.Equipment.OffHand
            ? {
                Type: event.Victim.Equipment.OffHand.Type,
                Count: event.Victim.Equipment.OffHand.Count,
                Quality: event.Victim.Equipment.OffHand.Quality,
              }
            : null,
          Head: event.Victim.Equipment.Head
            ? {
                Type: event.Victim.Equipment.Head.Type,
                Count: event.Victim.Equipment.Head.Count,
                Quality: event.Victim.Equipment.Head.Quality,
              }
            : null,
          Armor: event.Victim.Equipment.Armor
            ? {
                Type: event.Victim.Equipment.Armor.Type,
                Count: event.Victim.Equipment.Armor.Count,
                Quality: event.Victim.Equipment.Armor.Quality,
              }
            : null,
          Shoes: event.Victim.Equipment.Shoes
            ? {
                Type: event.Victim.Equipment.Shoes.Type,
                Count: event.Victim.Equipment.Shoes.Count,
                Quality: event.Victim.Equipment.Shoes.Quality,
              }
            : null,
          Bag: event.Victim.Equipment.Bag
            ? {
                Type: event.Victim.Equipment.Bag.Type,
                Count: event.Victim.Equipment.Bag.Count,
                Quality: event.Victim.Equipment.Bag.Quality,
              }
            : null,
          Cape: event.Victim.Equipment.Cape
            ? {
                Type: event.Victim.Equipment.Cape.Type,
                Count: event.Victim.Equipment.Cape.Count,
                Quality: event.Victim.Equipment.Cape.Quality,
              }
            : null,
          Mount: event.Victim.Equipment.Mount
            ? {
                Type: event.Victim.Equipment.Mount.Type,
                Count: event.Victim.Equipment.Mount.Count,
                Quality: event.Victim.Equipment.Mount.Quality,
              }
            : null,
          Potion: event.Victim.Equipment.Potion
            ? {
                Type: event.Victim.Equipment.Potion.Type,
                Count: event.Victim.Equipment.Potion.Count,
                Quality: event.Victim.Equipment.Potion.Quality,
              }
            : null,
          Food: event.Victim.Equipment.Food
            ? {
                Type: event.Victim.Equipment.Food.Type,
                Count: event.Victim.Equipment.Food.Count,
                Quality: event.Victim.Equipment.Food.Quality,
              }
            : null,
        },
        Inventory: event.Victim.Inventory
          ? event.Victim.Inventory.map((inventoryItem: any) => {
              if (inventoryItem) {
                return {
                  Type: inventoryItem.Type,
                  Count: inventoryItem.Count,
                  Quality: inventoryItem.Quality,
                };
              } else {
                return null;
              }
            })
          : [],
      },
      Participants: event.Participants.map((participant: any) => ({
        Name: participant.Name,
        Id: participant.Id,
        AverageItemPower: participant.AverageItemPower,
        Equipment: {
          MainHand: participant.Equipment.MainHand
            ? {
                Type: participant.Equipment.MainHand.Type,
                Count: participant.Equipment.MainHand.Count,
                Quality: participant.Equipment.MainHand.Quality,
              }
            : null,
          OffHand: participant.Equipment.OffHand
            ? {
                Type: participant.Equipment.OffHand.Type,
                Count: participant.Equipment.OffHand.Count,
                Quality: participant.Equipment.OffHand.Quality,
              }
            : null,
          Head: participant.Equipment.Head
            ? {
                Type: participant.Equipment.Head.Type,
                Count: participant.Equipment.Head.Count,
                Quality: participant.Equipment.Head.Quality,
              }
            : null,
          Armor: participant.Equipment.Armor
            ? {
                Type: participant.Equipment.Armor.Type,
                Count: participant.Equipment.Armor.Count,
                Quality: participant.Equipment.Armor.Quality,
              }
            : null,
          Shoes: participant.Equipment.Shoes
            ? {
                Type: participant.Equipment.Shoes.Type,
                Count: participant.Equipment.Shoes.Count,
                Quality: participant.Equipment.Shoes.Quality,
              }
            : null,
          Bag: participant.Equipment.Bag
            ? {
                Type: participant.Equipment.Bag.Type,
                Count: participant.Equipment.Bag.Count,
                Quality: participant.Equipment.Bag.Quality,
              }
            : null,
          Cape: participant.Equipment.Cape
            ? {
                Type: participant.Equipment.Cape.Type,
                Count: participant.Equipment.Cape.Count,
                Quality: participant.Equipment.Cape.Quality,
              }
            : null,
          Mount: participant.Equipment.Mount
            ? {
                Type: participant.Equipment.Mount.Type,
                Count: participant.Equipment.Mount.Count,
                Quality: participant.Equipment.Mount.Quality,
              }
            : null,
          Potion: participant.Equipment.Potion
            ? {
                Type: participant.Equipment.Potion.Type,
                Count: participant.Equipment.Potion.Count,
                Quality: participant.Equipment.Potion.Quality,
              }
            : null,
          Food: participant.Equipment.Food
            ? {
                Type: participant.Equipment.Food.Type,
                Count: participant.Equipment.Food.Count,
                Quality: participant.Equipment.Food.Quality,
              }
            : null,
        },
        Inventory: participant.Inventory
          ? participant.Inventory.map((inventoryItem: any) => {
              if (inventoryItem) {
                return {
                  Type: inventoryItem.Type,
                  Count: inventoryItem.Count,
                  Quality: inventoryItem.Quality,
                };
              } else {
                return null;
              }
            })
          : [],
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
      console.log("Ignoring event ", event.EventId)
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

  // Process the killEvents
  processKillEvents(killEvents, data, dataFilePath);

  data.latestEventId = latestEventId;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
