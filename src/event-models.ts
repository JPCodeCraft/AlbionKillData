export interface KillEvent {
  numberOfParticipants: number;
  EventId: number;
  TimeStamp: Date;
  Killer: Player;
  Victim: Player;
  Participants: Player[];
}

export interface Equipment {
  MainHand: Item | null;
  OffHand: Item | null;
  Head: Item | null;
  Armor: Item | null;
  Shoes: Item | null;
  Bag: Item | null;
  Cape: Item | null;
  Mount: Item | null;
  Potion: Item | null;
  Food: Item | null;
}

export interface Item {
  Type: string;
  Count: number;
  Quality: number;
}

export interface Player {
  Name: string;
  Id: string;
  AverageItemPower: number;
  Equipment: Equipment;  
  Inventory: (Item | null)[];
}
