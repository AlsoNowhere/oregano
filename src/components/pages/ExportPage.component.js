
import { dillx } from "dillx";

import { ExportData } from "oregano-core";

// import { stateStore } from "../../stores/state.store";

export const ExportPage = function(){

    // this.back = function(){
    //     stateStore.state = "list";
    // }

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
                <ExportData value={JSON.stringify(this.currentItem)} />
            </section>
        </>
    )

}
