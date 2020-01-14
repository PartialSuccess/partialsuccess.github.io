import { Component, OnInit } from '@angular/core';
import { DROPPED_LOOT } from 'src/assets/dropped-loot';
import { AVAILABLE_LOOT } from 'src/assets/available-loot';
import { ROSTER } from 'src/assets/roster';
import { ATTENDANCE } from 'src/assets/attendance';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { DroppedItem, Item, Player, Players, PlayerDetails } from './models';
import { RaidManager } from './raid.manager';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
    public DroppedLoot: DroppedItem[];
    public AvailableLoot: Item[] = AVAILABLE_LOOT;
    public ItemIndex: string[] = AVAILABLE_LOOT.map((x) => x.name);
    public Roster: Player[] = ROSTER;
    public Attendance = ATTENDANCE;
    public players: Players = {} as any;
    public currentItems = 'test';

    public search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => term.length < 2 ? [] : this.ItemIndex.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
        )

    public ngOnInit() {
        this.setDroppedLoot([]);
        this.update('Cenarion Belt');

        RaidManager.droppedItems.subscribe((droppedItems) => {
            this.setDroppedLoot(droppedItems);
            this.update('Cenarion Belt');
            this.currentItems = droppedItems.map((x) =>
                `{
    recipient: '${x.recipient}',
    name: '${x.name}',
    source: '${x.source}'
}`).join(',');
        });
    }

    private setDroppedLoot(currentLoot: DroppedItem[]) {
        this.DroppedLoot = DROPPED_LOOT.reduce((current, next) => current.concat(next.loot), []).concat(currentLoot);
    }

    public update(event: string) {
        const item = this.AvailableLoot.find((x) => x.name.toLowerCase() === event.toLowerCase());
        if (item == null) { return; }

        const targetPlayers = this.getPossibleRecipients(item.priority);

        this.players = {
            needItem: [],
            needItemAlt: [],
            haveItem: []
        };

        for (const target of targetPlayers) {
            const details = this.getPlayerDetails(target.name, item.name);
            const hasItem = details.all.find((x) => x.name === item.name);

            if (target.status === 'inactive') {
                // do nothing
            } else if (hasItem) {
                this.players.haveItem.push(details);
            } else if (target.status === 'active') {
                this.players.needItem.push(details);
            } else if (target.status === 'alternate') {
                this.players.needItemAlt.push(details);
            }
        }
    }

    private getPlayerDetails(name: string, item: string): PlayerDetails {
        const received = this.getReceivedBy(name);

        const hasItem = received.find((x) => x.name === item.name);
        const weapons = received.filter((x) => x.category === 'weapon');
        const bis = received.filter((x) => x.quality === 'bis');
        const other = received.filter((x) => x.quality === 'other');
        const bisTier = bis.filter((x) => x.category === 'tier');
        const bisGeneral = bis.filter((x) => x.category === 'general');
        const otherTier = other.filter((x) => x.category === 'tier');
        const otherGeneral = other.filter((x) => x.category === 'general');

        // const attendance = this.Attendance.filter((x) => x.players.some((z) => z.name === target.name));
        // const ratio = received.length / attendance.length;

        const nameMapper = (x) => x.name === item ? `<b>${x.name}</b>` : x.name;

        return {
            name: player,
            neededItem: hasItem ? null : item,
            all: received,
            weapons: weapons.map(nameMapper).join(', '),
            bis: {
                tier: bisTier.map(nameMapper).join(', '),
                general: bisGeneral.map(nameMapper).join(', ')
            },
            other: {
                tier: otherTier.map(nameMapper).join(', '),
                general: otherGeneral.map(nameMapper).join(', ')
            }
            // totalBis: receivedBis.length,
            // totalFree: receivedFree.length,
            // total: received.length,
            // attendance: attendance.length,
            // ratio: (ratio * 100).toFixed(2) + '%',
            // hasItem
        };
    }

    private getReceivedBy(playerName: string): Item[] {
        return this.AvailableLoot.filter((available) => {
            const playerReceived = this.DroppedLoot.filter((drop) => drop.recipient === playerName);
            return playerReceived.some((existing) => existing.name === available.name);
        });
    }

    private getPossibleRecipients(priority: string[]): Player[] {
        return this.Roster.filter((player) => {
            return priority.some((drop) => {
                if (player.job === 'tank') {
                    return drop === player.job || drop === 'warrior';
                }

                if (drop === 'healer') {
                    return player.job === 'druid' || player.job === 'priest' || player.job === 'paladin';;
                }

                if (drop === 'caster') {
                    return player.job === 'mage' || player.job === 'warlock';
                }

                if (drop === 'melee') {
                    return player.job === 'rogue' || player.job === 'warrior';
                }

                return drop === player.job;
            });
        });
    }
}
