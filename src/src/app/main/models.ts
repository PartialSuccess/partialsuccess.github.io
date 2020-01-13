export interface DroppedItem {
    name: string;
    recipient: string;
    source: string;
}

export interface Item {
    name: string;
    priority: string[];
    category: string;
    slot: string;
    quality: string;
}

export interface Player {
    name: string;
    type: string;
    status: string;
}

export interface Players {
    haveItem: PlayerDetails[];
    needItem: PlayerDetails[];
    needItemAlt: PlayerDetails[];
}

export interface PlayerDetails {
    name: string;
    neededItem: Item;
    all: Item[];
    weapons: string;
    bis: { tier: string, general: string };
    other: { tier: string, general: string };
}
