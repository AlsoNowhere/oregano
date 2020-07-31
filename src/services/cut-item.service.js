
import { save } from "./save.service";

export const cutItem = function(){
    const items = this.currentItem.list.splice(this._parent._index, 1);
    this.root.pasteItems.push(items[0]);
    save(this.root);
}
