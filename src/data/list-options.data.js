
import { ListOption } from "oregano-core";

import { editItem } from "../services/edit-item.service";
import { cutItem } from "../services/cut-item.service";
import { deleteItem } from "../services/delete-item.service";

export const listOptions = [
    new ListOption("edit item", "Edit item", "pencil", editItem),
    new ListOption("cut item", "Cut item", "scissors", cutItem),
    new ListOption("delete item", "Delete item", "trash-o", deleteItem),
];
