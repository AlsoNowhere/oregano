
import { save } from "./save.service";

export const pasteItems = function(){
    this.currentItem.list.push(...this.root.pasteItems.splice(0));
    save(this.root);
}
