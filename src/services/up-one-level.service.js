
import { path } from "thyme-core";

import { getItemFromPath } from "oregano-core";

export const upOneLevel = function(){
    path.path = path.path.slice(0,-1);
    this.currentItem = getItemFromPath(this.root, path.path);
}
