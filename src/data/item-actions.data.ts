import { listStore } from "../stores/list.store";

import { ItemAction } from "../models/ItemAction.model";

export const itemActions = [
  new ItemAction("pencil", (event, _, scope) => {
    listStore.editItem.apply(scope, [event]);
  }),
  new ItemAction("scissors", (event, _, scope) => {
    listStore.cutItem.apply(scope, [event]);
  }),
  new ItemAction("trash-o", (event, _, scope) => {
    listStore.deleteItem.apply(scope, [event]);
  }),
];
