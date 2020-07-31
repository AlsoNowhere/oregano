
import { stateStore } from "../stores/state.store";

export const editItem = function(){
    stateStore.state = "manage";
    this.edititem = this._parent._item;
    this.editindex = this._parent._index;
}
