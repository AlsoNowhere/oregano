
import { dillx } from "dillx";

import { ManageItem2, Item } from "oregano-core";

import { save } from "../../services/save.service";

import { stateStore } from "../../stores/state.store";

export const ManageItemPage = function(){

    this.oninserted = function(){
        this.manageformelement.children[0].children[0].children[1].focus();
    }

    this.manageformelement = null;

    this.onSubmit = function(title, message, colour){

        if (title === ""){
            return;
        }

        const newItem = new Item(title, message, colour);

        this.edititem && newItem.list.push(...this.edititem.list);

        this.editindex === null
            ? this.currentItem.list.push(newItem)
            : this.currentItem.list.splice(this.editindex, 1, newItem);

        save(this.root);

        this.editindex === null && setTimeout(()=>{
            this.mainbuttonselement.children[0].children[0].focus();
        },0);

        this.cancel();
    }

    this.cancel = function(){
        stateStore.state = "list";
        this.edititem = null;
        this.editindex = null;
    }

    return dillx(
        <section>
            <ManageItem2 />
        </section>
    )
}
