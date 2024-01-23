export interface Data{
    latestEventId: number;
    killTypeData: KillTypeData[];
}

export type KillType = 'solo' | 'duo' | '3-5' | '6-10' | '>10';

export interface KillTypeData {
    type: KillType;
    dateData: DateData[];
}

export interface DateData{
    date: Date;
    eventsCount: number;
    itemData: ItemData[];
}

export interface ItemData{
    Type: string;
    killerCount: number;
    victimCount: number;
    participantsCount: number;
}

