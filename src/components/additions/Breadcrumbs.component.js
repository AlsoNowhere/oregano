import { component, element, getter, refresh } from "mint";

import { path } from "../../services/path.service";

import { appStore } from "../../stores/app.store";
import { listStore } from "../../stores/list.store";

export const Breadcrumbs = component(
  "ul",
  function () {
    getter(this, "crumbs", () => {
      if (appStore.rootData === null) return [];
      const url = path.get();
      if (url.length === 1) return [{ content: " ", isLink: false }];
      let data = appStore.rootData;
      const crumbs = url.reduce((a, b, i) => {
        if (i === 0) {
          a.push({ content: data.title, isLink: true });
          return a;
        }
        data = data.items[b];
        a.push(
          { content: "/", isLink: false },
          { content: data.title, isLink: i !== url.length - 1 }
        );
        return a;
      }, []);
      return crumbs;
    });

    this.goToLink = function () {
      const url = path.get();
      const index = this._i / 2;
      path.set(url.slice(0, index + 1));
      refresh(listStore);
    };
  },
  { class: "breadcrumbs" },
  element(
    "li",
    { "m-for": "crumbs", "m-key": "_i", class: "breadcrumbs__item" },
    [
      element(
        "span",
        {
          "m-if": "isLink",
          class: "breadcrumbs__item-link",
          "(click)": "goToLink",
        },
        "{content}"
      ),
      element("span", { "m-if": "!isLink" }, "{content}"),
    ]
  )
);
