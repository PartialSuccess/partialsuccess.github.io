import { Component, Input } from '@angular/core';
import { PlayerDetails, Item } from '../models';
import { RaidManager } from '../raid.manager';

@Component({
    selector: 'player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent {
    @Input() details: PlayerDetails;

    public addItem(item: Item) {
        RaidManager.addItem({
            name: item.name,
            recipient: this.details.name,
            source: 'test'
        });
    }
}
