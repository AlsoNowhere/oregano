
import { dillx } from "dillx";

import { mainButtonOptions } from "../../data/main-button-options.data";

export const MainButtons = function(){

    this.mainButtonOptions = mainButtonOptions;

    return dillx(
        <section>
            <ul class="reset-list flex" mainbuttonselement---="">
                <li dill-for="mainButtonOptions">
                    <button type="button"
                        class="{theme} large square margin-right-small"
                        title-="title"
                        disabled-="disabled"
                        click--="onClick">

                        <span class="fa fa-{icon}"></span>
                    </button>
                </li>
            </ul>
        </section>
    )
}
