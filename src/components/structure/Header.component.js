
import { dillx } from "dillx";

import { version } from "oregano-core";

export const Header = function(){

    this.version = version;

    return dillx(
        <header class="flex space-between padded-top-smal padded-bottom-smal shadow" style="-webkit-app-region: drag">
            <h1>Oregano <span style="font-size:18px;line-height:18px;">v{version}</span></h1>
            <div>
                <button type="button" class="empty large square" style="-webkit-app-region: no-drag">
                    <span class="font-bold snow-text">_</span>
                </button>
                <button type="button" class="empty large square" style="-webkit-app-region: no-drag">
                    <svg viewBox="0 0 100 100">
                        <line x1="20" y1="20" x2="80" y2="80" stroke="2px" stroke-colour="#fff" />
                        <line x1="80" y1="20" x2="20" y2="80" stroke="2px" stroke-colour="#fff" />
                    </svg>
                </button>
            </div>
        </header>
    )
}
