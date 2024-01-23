interface data{
    latestEventId: number;
    dateData: dateData[];
}

interface dateData{
    date: Date;
    itemData: itemData[];
}

interface itemData{
    Type: string;
    killerAmount: number;
    victimAmount: number;
    participantsAmount: number;
}

