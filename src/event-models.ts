export interface killEvent {
  numberOfParticipants: number;
  EventId: number;
  TimeStamp: Date;
  Killer: player;
  Victim: player;
  Participants: player[];
}

export interface equipment {
  MainHand: item | null;
  OffHand: item | null;
  Head: item | null;
  Armor: item | null;
  Shoes: item | null;
  Bag: item | null;
  Cape: item | null;
  Mount: item | null;
  Potion: item | null;
  Food: item | null;
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
  Inventory: (item | null)[];
}
