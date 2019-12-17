import { Component, OnInit } from '@angular/core';
import { loot } from 'src/assets/loot';
import { drops } from 'src/assets/drops';
import { players } from 'src/assets/players';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
    public loot = loot.reduce((current, next) => current.concat(next.loot), []);
    public drops = drops;
    public players = players;

    public data = [];

    public ngOnInit() {
        this.update('belt of might');
    }

    public update(target: string) {
        const drop = this.drops.find((x) => x.name.toLowerCase() == target);
        if (drop == null) return;

        const players = this.players.filter((x) => drop.priority.some((drop) => drop == x.type));

        this.data = [];
        for (let player of players) {
            const received = this.loot.filter((x) => x.recipient == player.name);
            const hasItem = received.find((x) => x.name == drop.name);
            let result = {
                player: player.name,
                total: received.length,
                hasItem: hasItem
            };

            this.data.push(result);
        }
    }
}
