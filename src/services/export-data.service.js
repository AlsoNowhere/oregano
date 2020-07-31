
import { stateStore } from "../stores/state.store";

export const exportData = function(){
    stateStore.state = "export";
}
