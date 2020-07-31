
import { stateStore } from "../stores/state.store";

export const addItem = function(){
    stateStore.state = "manage";
}
