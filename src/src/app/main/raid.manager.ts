import { DroppedItem } from './models';
import { BehaviorSubject } from 'rxjs';


export class RaidManager {
    private static _droppedItems = new BehaviorSubject<DroppedItem[]>([]);

    public static droppedItems = RaidManager._droppedItems.asObservable();

    public static addItem(item: DroppedItem) {
        const list = this._droppedItems.getValue();
        list.push(item);
        this._droppedItems.next(list);
    }
}
