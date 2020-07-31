
import { dillx } from "dillx";

import { ImportData } from "oregano-core";

import { save } from "../../services/save.service";

export const ImportPage = function(){

    this.submit = function(value){

        const data = JSON.parse(value);

        this.currentItem.list.push(...(data instanceof Array ? data : [data]).map(x => (x.list === undefined && (x.list = []), x)));

        save(this.root);

        this.back();
    }

    return dillx(
        <>
            <section>
                <ul class="reset-list">
                    <li>
                        <button type="button" class="large square" click--="back">
                            <span class="fa fa-arrow-left"></span>
                        </button>
                    </li>
                </ul>
            </section>
            <section>
                <h2>{currentTitle}</h2>
                <ImportData submit="submit" />
            </section>
        </>
    )

}
