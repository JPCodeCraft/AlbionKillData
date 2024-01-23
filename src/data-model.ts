export interface data{
    latestEventId: number;
    dateData: dateData[];
}

export interface dateData{
    date: Date;
    itemData: itemData[];
}

export interface itemData{
    Type: string;
    killerAmount: number;
    victimAmount: number;
    participantsAmount: number;
}

