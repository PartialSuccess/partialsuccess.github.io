import { Component, OnInit } from '@angular/core';
import { DROPPED_LOOT } from 'src/assets/dropped-loot';
import { AVAILABLE_LOOT } from 'src/assets/available-loot';
import { ROSTER } from 'src/assets/roster';
import { ATTENDANCE } from 'src/assets/attendance';

interface DroppedItem {
    name: string;
    recipient: string;
    source: string;
}

interface Item {
    name: string;
    priority: string[];
    category: string;
    slot: string;
    quality: string;
}

interface Player {
    name: string;
    type: string;
}

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
    public DroppedLoot: DroppedItem[] = DROPPED_LOOT.reduce((current, next) => current.concat(next.loot), []);
    public AvailableLoot: Item[] = AVAILABLE_LOOT;
    public Roster: Player[] = ROSTER;
    public Attendance = ATTENDANCE;

    public data = [];

    public player = '';
    public playerLoot = [];

    public ngOnInit() {
        this.update('perdition\'s blade');
        this.showPlayer('Delos');
    }

    public showPlayer(event: string) {
        this.player = event;
        const droppedLoot = this.DroppedLoot.filter((x) => x.recipient === event);
        this.playerLoot = this.AvailableLoot.filter((x) => droppedLoot.some((z) => z.name === x.name));
    }

    public update(event: string) {
        const item = this.AvailableLoot.find((x) => x.name.toLowerCase() === event.toLowerCase());
        if (item == null) { return; }

        const possibleRecipients = this.getPossibleRecipients(item.priority);

        this.data = [];
        for (const player of possibleRecipients) {
            const received = this.AvailableLoot.filter((x) => {
                const playerReceived = this.DroppedLoot.filter((x) => x.recipient === player.name);
                return playerReceived.some((z) => z.name === x.name);
            });

            const receivedBis = received.filter((x) => x.quality === 'bis');
            const receivedFree = received.filter((x) => x.quality === 'free');
            const hasItem = received.find((x) => x.name === item.name);
            const attendance = this.Attendance.filter((x) => x.players.some((z) => z.name === player.name));
            const ratio = received.length / attendance.length;

            const result = {
                player: player.name,
                totalBis: receivedBis.length,
                totalFree: receivedFree.length,
                total: received.length,
                attendance: attendance.length,
                ratio: (ratio * 100).toFixed(2) + '%',
                hasItem
            };

            this.data.push(result);
        }

        this.data.sort((a, b) => {
            if (a.hasItem) {
                return a.hasItem === b.hasItem ? 0 : a.hasItem ? 1 : -1;
            } else {
                return a.ratio > b.ratio ? 1 : -1;
            }
        });
    }

    private getPossibleRecipients(priority: string[]) {
        return this.Roster.filter((player) => {
            return priority.some((drop) => {
                if (player.type === 'tank') {
                    return drop === player.type || drop === 'warrior';
                }

                if (drop === 'healer') {
                    return player.type === 'druid' || player.type === 'priest' || player.type === 'paladin';;
                }

                if (drop === 'caster') {
                    return player.type === 'mage' || player.type === 'warlock';
                }

                if (drop === 'melee') {
                    return player.type === 'rogue' || player.type === 'warrior';
                }

                return drop === player.type;
            });
        });
    }
}
