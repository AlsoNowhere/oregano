
import { dillx } from "dillx";

import { path } from "thyme-core";

import { List2, getItemFromPath } from "oregano-core";

import { MainButtons } from "../common/MainButtons.component";

import { dragDropAttributes } from "../../services/drag-drop.service";
import { save } from "../../services/save.service";

import { listOptions } from "../../data/list-options.data";

export const ListPage = function(){

    this.listOptions = listOptions;

    this.onclick = function(){
        path.path = [...path.path, this._index];
        this.currentItem = getItemFromPath(this.root, path.path);
    }

    this.listStyles = function(){
        const styles = this._item.colour && this._item.colour !== "#fff"
            ? `background-color:${this._item.colour};`
            : ``;
        return styles;
    }

    this.hasSubList = function(){
        return this.list.length > 0;
    }

    this.subListLength = function(){
        return this.list.filter(x => x.list.length === 0).length;
    }

    this.hasMessage = function(){
        return !!this.message;
    }

    this.itemTemplate = dillx(
        <div class="flex space-between relative pointer hover" style-="listStyles">
            <span class="block absolute pinned top left margin-left-small padded-left-small blueberry-text line-height-large font-bold"
                dill-if="hasSubList">{subListLength}</span>
            <p class="margin-left padded-left line-height-large no-wrap trim">{title}</p>
            <ul class="reset-list flex">
                <li class="padded-small line-height-large blueberry-text" dill-if="hasMessage">
                    <span class="fa fa-list"></span>
                </li>
                <li dill-for="listOptions">
                    <button type="button" class="empty large square" title-="title" click--="onClick">
                        <span class="fa fa-{icon}"></span>
                    </button>
                </li>
            </ul>
        </div>
    );

    this.itemattributes = dragDropAttributes;

    this.dragIndex = null;
    this.dragstart = function(){
        this.dragIndex = this._index;
    }
    this.dragover = event => event.preventDefault();
    this.drop = function(){
        if (this.dragIndex === null) {
            return;
        }
        const temporary = this.currentItem.list[this.dragIndex];
        this.currentItem.list.splice(this.dragIndex, 1);
        this.currentItem.list.splice(this._index, 0, temporary);
        save(this.root);
    }

    return dillx(
        <div>
            <MainButtons />
            <section>
                <List2 list="currentList"
                    onclick="onclick"
                    itemTemplate="itemTemplate"
                    itemattributes="itemattributes" />
            </section>
        </div>
    )
}
