import _package from "../package.json";

import { component, node, app } from "mint";

import { Route, Router, RouteType, TRouter } from "thyme";

import {
  OreganoAppComponent,
  Header,
  Content,
  // Stores
  appStore,
  allRoutes,
  AllMainButtons,
  AllSecondaryButtons,
  Pages,
} from "oregano-core";

appStore.sessionStorageKey = "oregano-5-key";

const routes = allRoutes.map(
  ([target, content]) => new Route({ target, type: RouteType["^"] }, content)
);

const App = component("main", OreganoAppComponent, null, [
  node(Header, {
    headerTitle: "Oregano",
    version: _package.version,
  }),

  node(Content, null, [
    node(AllMainButtons),
    node(AllSecondaryButtons),
    node(Pages, null, node<TRouter>(Router, { routes })),
  ]),
]);

app(document.body, {}, node(App));
