interface killEvent {
  numberOfParticipants: number;
  EventId: number;
  TimeStamp: Date;
  Killer: player;
  Victim: player;
  Participants: player[];
}

interface equipment {
    MainHand: item;
    OffHand: item;
    Head: item;
    Armor: item;
    Shoes: item;
    Bag: item;
    Cape: item;
    Mount: item;
    Potion: item;
    Food: item;
    Inventory: (item | null)[];
    }

interface item {
  Type: string;
  Count: number;
  Quality: number;
}

interface player {
  Name: string;
  Id: number;
  AverageItemPower: number;
  Equipment: equipment;
}
