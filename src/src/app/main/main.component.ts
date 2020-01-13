import { Component, OnInit } from '@angular/core';
import { DROPPED_LOOT } from 'src/assets/dropped-loot';
import { AVAILABLE_LOOT } from 'src/assets/available-loot';
import { ROSTER } from 'src/assets/roster';
import { ATTENDANCE } from 'src/assets/attendance';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { DroppedItem, Item, Player, Players, PlayerDetails } from './models';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
    public DroppedLoot: DroppedItem[] = DROPPED_LOOT.reduce((current, next) => current.concat(next.loot), []);
    public AvailableLoot: Item[] = AVAILABLE_LOOT;
    public ItemIndex: string[] = AVAILABLE_LOOT.map((x) => x.name);
    public Roster: Player[] = ROSTER;
    public Attendance = ATTENDANCE;
    public players: Players = {} as any;

    public search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => term.length < 2 ? [] : this.ItemIndex.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
        )

    public ngOnInit() {
        this.update('Cenarion Belt');
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

        // this.players.sort((a, b) => {
        //     if (a.hasItem) {
        //         return a.hasItem === b.hasItem ? 0 : a.hasItem ? 1 : -1;
        //     } else {
        //         return a.ratio > b.ratio ? 1 : -1;
        //     }
        // });
    }

    private getPlayerDetails(name: string, item: string): PlayerDetails {
        const received = this.getReceivedBy(name);

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
            name,
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

    // public showPlayer(event: string) {
    //     this.player = event;
    //     const droppedLoot = this.DroppedLoot.filter((x) => x.recipient === event);
    //     this.playerLoot = this.AvailableLoot.filter((x) => droppedLoot.some((z) => z.name === x.name));
    // }

    // public showAll() {
    //     const players: string[] = this.Attendance
    //         .reduce((p, c) => p.concat(c.players), [])
    //         .map((x) => x.name)
    //         .filter((v, i, a) => a.indexOf(v) === i)
    //         .filter((x) => x !== 'Xinghua' && x !== 'Doruga' && x !== 'Dondante' && x !== 'Nitro' && x !== 'Boxcarhobo' && x !== 'Jarne' &&
    //             x !== 'Kramson' && x !== 'Gried' && x !== 'Lumadin' && x !== 'Dezverly' && x !== 'Alprazolam');
    //     this.data = [];
    //     for (const playerName of players) {
    //         const received = this.AvailableLoot.filter((x) => {
    //             const playerReceived = this.DroppedLoot.filter((z) => z.recipient === playerName);
    //             return playerReceived.some((z) => z.name === x.name);
    //         });

    //         const bisTier = received.filter((x) => x.quality === 'bis' && x.category === 'tier');
    //         const freeTier = received.filter((x) => x.quality === 'free' && x.category === 'tier');
    //         const bisGeneral = received.filter((x) => x.quality === 'bis' && (x.category === 'general' || x.category === 'weapon'));
    //         const freeGeneral = received.filter((x) => x.quality === 'free' && x.category === 'general');

    //         const attendance = this.Attendance.filter((x) => x.players.some((z) => z.name === playerName));

    //         const result = {
    //             player: playerName,
    //             bis: `${bisTier.length} | ${bisGeneral.length}`,
    //             free: `${freeTier.length} | ${freeGeneral.length}`,
    //             weapon: bisGeneral.length,
    //             total: received.length,
    //             attendance: attendance.length
    //         };

    //         this.data.push(result);
    //     }

    //     this.data.sort((a, b) => {
    //         return b.attendance - a.attendance;
    //     });
    // }

}
