
import { save } from "../services/save.service";

export const deleteItem = function(event){
    event.stopPropagation();

    this.currentItem.list.splice(this._parent._index, 1);

    save(this.root);
}
