
import { path } from "thyme-core";

import { getItemFromPath } from "oregano-core";

export const upToRoot = function(){
    path.path = [];
    this.currentItem = getItemFromPath(this.root, path.path);
}
