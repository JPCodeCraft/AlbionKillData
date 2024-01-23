export interface killEvent {
  numberOfParticipants: number;
  EventId: number;
  TimeStamp: Date;
  Killer: player;
  Victim: player;
  Participants: player[];
}

export interface equipment {
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

export interface item {
  Type: string;
  Count: number;
  Quality: number;
}

export interface player {
  Name: string;
  Id: number;
  AverageItemPower: number;
  Equipment: equipment;
}
