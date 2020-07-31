
import { MainButton } from "oregano-core";

import { addItem } from "../services/add-item.service";
import { upOneLevel } from "../services/up-one-level.service";
import { upToRoot } from "../services/up-to-root.service";
import { exportData } from "../services/export-data.service";
import { importData } from "../services/import-data.service";
import { pasteItems } from "../services/paste-items.service";

import { stateStore } from "../stores/state.store";

export const mainButtonOptions = [
    new MainButton("Add", "Add item", "plus", "blueberry", addItem),
    new MainButton("Level up", "Up one level", "level-up", "snow", upOneLevel),
    new MainButton("Up to root", "up-to-root", "level-up", "orange", upToRoot),
    new MainButton("Export", "export-data", "upload", "apple", exportData),
    new MainButton("Import", "import-data", "download", "snow", importData),
    new MainButton("Tree", "tree-view", "list", "snow", () => stateStore.state = "tree-view"),
    new MainButton("Paste", "Paste items", "paint-brush", "orange", pasteItems, { disabled(){ return this.root.pasteItems.length === 0; } }),
]
