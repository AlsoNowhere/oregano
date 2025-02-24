import _package from "../package.json";

import { component, node, app } from "mint";

import { Route, Router, RouteType, TRouter } from "thyme";

import {
  OreganoAppComponent,
  Header,
  Content,
  oreganoSettings,
  allRoutes,
  AllPrimaryButtons,
  AllSecondaryButtons,
  Pages,
} from "oregano-core";

oreganoSettings.sessionStorageKey = "oregano-5-key";
oreganoSettings.breadcrumbs = true;

const routes = allRoutes.map(
  ([target, content]) => new Route({ target, type: RouteType["^"] }, content)
);

const App = component("main", OreganoAppComponent, null, [
  node(Header, {
    headerTitle: "Oregano",
    version: _package.version,
  }),

  node(Content, null, [
    node(AllPrimaryButtons),
    node(AllSecondaryButtons),
    node(Pages, null, node<TRouter>(Router, { routes })),
  ]),
]);

app(document.body, {}, node(App));
