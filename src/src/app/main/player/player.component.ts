import { Component, Input } from '@angular/core';
import { PlayerDetails } from '../models';

@Component({
    selector: 'player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css']
})
export class PlayerComponent {
    @Input() details: PlayerDetails;
}
