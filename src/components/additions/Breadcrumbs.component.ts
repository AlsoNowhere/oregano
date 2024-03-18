import { MintComponent, component, element, getter, refresh } from "mint";

import { path, toast, wait } from "sage";

import { upToRoot } from "../../services/up-to-root.service";

import { appStore } from "../../stores/app.store";
import { listStore } from "../../stores/list.store";

import { IData } from "../../interfaces/IData.interface";

class BreadcrumbsComponent extends MintComponent {
  goToLink: () => void;

  constructor() {
    super();

    getter(this, "crumbs", () => {
      if (appStore.rootData === null) return [];
      const url = path.get();
      if (url.length === 1) return [{ content: " ", isLink: false }];
      let data: IData = appStore.rootData;
      const crumbs = url.reduce((a, b, i) => {
        if (i === 0) {
          a.push({ content: data.title, isLink: true });
          return a;
        }
        data = data.items[b];
        if (data === undefined) {
          toast("Unable to find this item, returning to home.", "tomato");
          (async () => {
            await wait();
            upToRoot();
          })();
          return [];
        }
        a.push(
          { content: "/", isLink: false },
          { content: data.title, isLink: i !== url.length - 1 }
        );
        return a;
      }, [] as Array<{ content: string; isLink: boolean }>);
      return crumbs;
    });

    this.goToLink = function () {
      const url = path.get();
      const index = this._i / 2;
      path.set(url.slice(0, index + 1));
      refresh(listStore);
    };
  }
}

export const Breadcrumbs = component(
  "ul",
  BreadcrumbsComponent,
  { class: "breadcrumbs" },
  element("li", { mFor: "crumbs", mKey: "_i", class: "breadcrumbs__item" }, [
    element(
      "span",
      {
        mIf: "isLink",
        class: "breadcrumbs__item-link",
        "(click)": "goToLink",
      },
      "{content}"
    ),
    element("span", { mIf: "!isLink" }, "{content}"),
  ])
);
