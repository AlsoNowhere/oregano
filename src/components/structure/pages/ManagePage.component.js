import { component, element, refresh } from "mint";

import { Button } from "../../common/Button.component";
import { Field } from "../../common/Field.component";

import { wait } from "../../../services/wait.service";

import { manageStore } from "../../../stores/manage.store";

// import { Field } from "thyme";

// import { backToList } from "../services/back-to-list.service";

// import { itemColours } from "../data/item-colours.data";
// import { undo } from "../data/undo-list.data";

export const Manage = component(
  "section",
  function () {
    this.manageFormElement = null;

    manageStore.connect(this);

    this.oninsert = function () {
      //     this.itemColours.forEach(each => each.checked = false);
      //     this.itemColour = this.itemColours[0].colour;
      //     this.itemColours[0].checked = true;
      //     if (this.editItem !== null){
      //         this.title = this.editItem.title;
      //         this.message = this.editItem.message;
      //         this.itemColours.forEach(x => {
      //             if (x.colour === this.editItem.colour) {
      //                 x.checked = true;
      //                 this.itemColour = x.colour;
      //             }
      //         });
      //     }
      //     else {
      //         this.title = "";
      //         this.message = "";
      //     }
    };

    this.oneach = async function () {
      if (manageStore.editItem !== null) {
        manageStore.title = manageStore.editItem.title;
        manageStore.message = manageStore.editItem.message;
      } else {
        manageStore.title = "";
        manageStore.message = "";
      }

      await wait();
      this.manageFormElement?.title?.focus?.();
      refresh(manageStore);
    };

    // this.itemColours = itemColours;
    // this.itemColour = this.itemColours[0].colour;
    // this.changeColourValue = function(){
    //     this.itemColours.forEach(each => each.checked = false);
    //     this._item.checked = true;
    //     this.itemColour = this._item.colour;
    // }

    //             <fieldset class="grid-3 padded-right-small">
    //                 <legend>Colour</legend>
    //                 <ul class="clear-list flex">
    //                     <li class="width-large height-large margin-right-small margin-bottom-small"
    //                         dill-for="itemColours">
    //                         <div class="width-full height-full padding-small"
    //                             style="border-radius: 4px; border: 4px solid {colour}">
    //                             <Field type="'radio'"
    //                                 name="'colour'"
    //                                 class="'no-margin width-full height-full'"
    //                                 checked="checked"
    //                                 onChange="changeColourValue"
    //                                 fieldClass="'large middle'" />
    //                         </div>
    //                     </li>
    //                 </ul>
    //             </fieldset>
  },
  { class: "constrain centred padding-large" },

  element(
    "form",
    {
      class: "form",
      autocomplete: "off",
      "(submit)": "onSubmit",
      "m-ref": "manageFormElement",
    },
    [
      element("h2", null, "Add item"),
      element("div", { class: "grid-9 padded-right-small" }, [
        element(Field, {
          label: "Title",
          name: "title",
          required: "required",
          "[value]": "title",
          "[onInput]": "setTitle",
        }),

        element(Field, {
          type: "textarea",
          label: "Message",
          name: "message",
          "[value]": "message",
          "[onInput]": "setMessage",
        }),
      ]),

      element("div", { class: "grid-12" }, [
        element(Button, {
          type: "submit",
          class: "blueberry large margin-right",
          label: "Save",
        }),
        element(Button, {
          class: "smoke large",
          label: "Cancel",
          "[onClick]": "cancel",
        }),
      ]),
    ]
  )
);
