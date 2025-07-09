(function () {
  'use strict';

  var name = "oregano";
  var version = "5.0.4";
  var description = "";
  var main = "./electron/index.js";
  var scripts = {
  	start: "electron .",
  	"build:app": "electron-packager . --overwrite --icon=src/img/noko-3.ico",
  	"build:js": "rollup --config",
  	"watch:js": "rollup --config --watch",
  	"build:css": "lessc ./src/styles/index.less ./dist/styles/index.css",
  	"watch:css": "less-watch-compiler ./src/styles ./dist/styles index.less",
  	server: "http-server",
  	"cy:open": "cypress open",
  	"cy:runAll": "cypress run --spec 'cypress/e2e/**/*.ts'"
  };
  var keywords = [
  ];
  var author = "";
  var license = "ISC";
  var peerDependencies = {
  	mint: "file:../../Mint",
  	"oregano-core": "file:../Oregano-Core"
  };
  var dependencies = {
  	basil: "file:../../Basil",
  	chive: "file:../../Chive",
  	sage: "file:../../Sage",
  	thyme: "file:../../Thyme"
  };
  var devDependencies = {
  	"@electron/remote": "^2.0.9",
  	"@rollup/plugin-json": "^6.0.0",
  	"@rollup/plugin-node-resolve": "^13.3.0",
  	"@rollup/plugin-typescript": "^8.5.0",
  	"@types/cypress": "^1.1.6",
  	"@types/jest": "^29.5.14",
  	cypress: "^13.17.0",
  	electron: "^22.0.2",
  	"electron-packager": "^17.1.1",
  	"http-server": "^14.1.1",
  	less: "^4.1.3",
  	"less-watch-compiler": "^1.16.3",
  	rollup: "^2.78.1",
  	tslib: "^2.6.3",
  	typescript: "^4.8.3"
  };
  var _package = {
  	name: name,
  	version: version,
  	description: description,
  	main: main,
  	scripts: scripts,
  	keywords: keywords,
  	author: author,
  	license: license,
  	peerDependencies: peerDependencies,
  	dependencies: dependencies,
  	devDependencies: devDependencies
  };

  class CreateNode {
      constructor(mintNode, props = null, content = null) {
          this.mintNode = mintNode;
          this.props = props;
          this.content = content;
      }
  }

  const MINT_ERROR = "MINT ERROR --";
  const MINT_WARN = "MINT WARN --";
  const global = {
      mintElement_index: 0,
  };
  const attributesThatAreBoolean = ["checked"];
  const attributesThatAreProperties = [
      "checked",
      "value",
      "textContent",
      "innerHTML",
  ];
  const forScopePermantProperties = [
      "_x",
      "_i",
      "mintElement_index",
      "_mintBlueprint",
  ];

  const handleAppErrors = (rootElement, baseRootScope, initialContent) => {
      // ** CATCH the user passing in non HTMLElement for rootElement.
      if (!(rootElement instanceof HTMLElement))
          throw "app -- rootElement -- You must pass a HTMLElement for the rootElement.";
      // ** CATCH the user passing in null for rootScope.
      if (baseRootScope === null)
          throw "app -- rootScope -- Cannot pass null as root scope. Root scope is defined against generic T as can't autofill from null.";
      // ** CATCH the user not passing in Object for rootScope.
      if (typeof baseRootScope !== "object")
          throw "app -- rootScope -- Value not Object.";
      // ** CATCH the user not passing either a string, MintElement or Array.
      if (typeof initialContent !== "string" &&
          !(initialContent instanceof Array) &&
          !(initialContent instanceof CreateNode)) {
          throw "app -- content -- Must be string or Array.";
      }
      // ** CATCH the user passing "_children" keyword incorrectly.
      if ((initialContent instanceof Array && initialContent.includes("_children")) ||
          initialContent === "_children") {
          throw new Error(`${MINT_ERROR} Can only pass "_children" as child of Component.`);
      }
  };

  class MintAttribute {
      constructor(cloneAttribute) {
          this.cloneAttribute = cloneAttribute;
      }
  }

  // ** Props are defined at the Mint Node level but when we create Mint Elements we
  // ** need to make sure these are unique so here we clone the props.
  const cloneProps = ({ props }) => {
      const newProps = {};
      if (!props) {
          return newProps;
      }
      for (let [key, value] of Object.entries(props)) {
          if (value instanceof MintAttribute) {
              // ** In specific examples, such as when cloning a MintNode for use in mFor, we need to make sure
              // ** each MintAttribute is unique.
              newProps[key] = value.cloneAttribute(value);
          }
          else {
              newProps[key] = value;
          }
      }
      return newProps;
  };

  // ** IMPORTANT
  // ** The order in which mint attributes are processed it important.
  // ** For example: mIf, if false, should stop all other blueprinting.
  const mintAttributeOrder = ["mExtend", "mIf", "mFor", "mRef"];
  const mintAttributesList = ["mExtend", "mIf", "mFor", "mRef"];
  const attributesToIgnore = [
      "mintElement_index",
      ...mintAttributeOrder,
      "mKey",
  ];

  const conflicts = [
      ["mIf", "mFor"],
      ["mFor", "mRef"],
  ];
  const resolveConflicts = (keys) => {
      for (let [a, b] of conflicts) {
          if (keys.includes(a) && keys.includes(b)) {
              throw new Error(`${MINT_ERROR} attributes -- Cannot have ${a} and ${b} on the same element.`);
          }
      }
  };
  // ** Certain Properties (Component props) and Attributes on Components and Elements need to be
  // ** run in a particular order. We create that order here as an Array of strings (Object keys).
  const resolvePropsOrder = (props) => {
      const keys = Object.keys(props);
      // ** Certain attributes cannot be both on an element, resolve that here.
      resolveConflicts(keys);
      keys.sort(([a], [b]) => {
          return mintAttributeOrder.indexOf(a) - mintAttributeOrder.indexOf(b);
      });
      return keys;
  };

  // ** Here we fix a duplication of logic that is for the users' benefit.
  const fixProps = (props) => {
      if (props === null)
          return;
      for (let key of Object.keys(props)) {
          if (mintAttributesList.includes(key)) {
              if (props[key][key]) {
                  props[key] = props[key][key];
              }
          }
      }
  };

  const generateBlueprint = ({ node, parentBlueprint, scope, _rootScope, isSVG, useGivenScope, }) => {
      var _a;
      fixProps(node.props);
      const props = cloneProps({ props: (_a = node.props) !== null && _a !== void 0 ? _a : {} });
      /* Dev */
      // _DevLogger_("GENERATE", "Blueprint", mintContent);
      // ** ORDER IS IMPORTANT!
      // ** Here we take the attributes and order them in a specific run order.
      // ** This way they don't conflict with each other.
      const orderedProps = resolvePropsOrder(props);
      // ** Here we get the generate function for this particular mint element.
      const { generate } = node.mintNode;
      // ** If this is MintText or MintElement then the "generate" function will be on this MintNode.
      const blueprint = generate({
          node,
          orderedProps,
          props,
          scope,
          parentBlueprint,
          _rootScope,
          isSVG,
          useGivenScope,
      });
      return blueprint;
  };
  const generateBlueprints = ({ nodes, scope, parentBlueprint, _rootScope, isSVG = false, useGivenScope = false, }) => {
      // <@ REMOVE FOR PRODUCTION
      if (nodes.find((x) => !(x instanceof CreateNode))) {
          throw new Error(`${MINT_ERROR} generateBlueprints -- nodes sent not correctly implemented.`);
      }
      // @>
      // ** Use parent scope if available. If it isn't, then use the rootScope.
      // ** This means that the blueprint must be at the app level.
      const blueprints = [];
      for (let node of nodes) {
          blueprints.push(generateBlueprint({
              node,
              scope,
              parentBlueprint,
              _rootScope,
              isSVG,
              useGivenScope,
          }));
      }
      return blueprints;
  };

  class Blueprint {
      constructor({ mintNode = null, render = null, refresh = null, scope, parentBlueprint, _rootScope, }) {
          this.mintNode = mintNode;
          this.render = render;
          this.refresh = refresh;
          this.scope = scope;
          this.parentBlueprint = parentBlueprint;
          this._rootScope = _rootScope;
          this.mintElement_index = ++global.mintElement_index;
      }
  }

  class TextBlueprint extends Blueprint {
      constructor({ mintNode, element, textValue, scope, parentBlueprint, _rootScope, }) {
          super({
              mintNode,
              scope,
              parentBlueprint,
              _rootScope,
          });
          this.element = element;
          this.textValue = textValue;
          this._dev = "Text";
      }
  }

  const generateTextBlueprint = ({ node, scope, parentBlueprint, _rootScope, }) => {
      // ** This Function can only be accessed by a MintText so tell TS that here.
      const mintText = node.mintNode;
      // ** Create the TextNode in JS.
      const textNode = document.createTextNode("");
      const { textValue } = mintText;
      return new TextBlueprint({
          mintNode: mintText,
          element: textNode,
          textValue,
          scope,
          parentBlueprint,
          _rootScope,
      });
  };

  // ** This function allows the definition of property look ups on the scope.
  // ** E.g 1
  // ** { "[class]": "data.class"}
  // ** scope = { data: { class: "padding" } }
  // ** E.g 2
  // ** const str = "Content: {data.content}"
  // ** scope = { data: { content: "text value" } }
  const resolvePropertyLookup = (target, scope) => {
      var _a;
      if (target === "_children") {
          const childrenContent = scope._mintBlueprint._childrenContent;
          const contentLength = (_a = childrenContent === null || childrenContent === void 0 ? void 0 : childrenContent.length) !== null && _a !== void 0 ? _a : 0;
          return contentLength > 0;
      }
      let _value = scope;
      const lookups = target.split(".");
      for (let x of lookups) {
          // <@ REMOVE FOR PRODUCTION
          if (!(_value instanceof Object)) {
              console.warn(`${MINT_WARN} while attempting to parse value "{${target}}" a non object was found -> ${_value}.`);
              return "";
          }
          // @>
          _value = _value[x];
      }
      return _value;
  };

  /*
    This function takes a string and an Object (scope). Every time the string
    contains braces with a variable inside we extract the value from the scope
    and replace it in the string.
    E.g:
    cosnt str = "Here is {content}";
    const scope = { content: "the truth" };

    str becomes "Here is the truth".
  */
  //<@ REMOVE FOR PRODUCTION
  const deBracerError = (text, scope, errorMessage) => {
      console.error(errorMessage, " -- deBracer ERROR. Text sent: ", text, "Scope: ", scope);
      throw new Error(`${MINT_ERROR} Text sent to resolve, not text: ${text}`);
  };
  //@>
  const resolve = (_value, scope, errorMessage) => {
      const value = _value instanceof Function ? _value.apply(scope) : _value;
      // ** Get a resolved string only value.
      const resolvedValue = (() => {
          if (value === undefined || value === null)
              return "";
          if (typeof value === "number")
              return value.toString();
          return value;
      })();
      // ** Here we allow the Dev to define a string output that might contain {variable} itself.
      // ** Cycle through until all are resolved.
      return deBracer(resolvedValue, scope, errorMessage);
  };
  const deBracer = (text, scope, errorMessage) => {
      /* Dev */
      // _DevLogger_("Debracer", errorMessage, text, scope);
      //<@ REMOVE FOR PRODUCTION
      if (typeof text !== "string" && typeof text !== "number")
          deBracerError(text, scope, errorMessage);
      //@>
      const textValue = typeof text === "string" ? text : text.toString();
      return textValue.replace(/\\*\{[.a-zA-Z0-9_$]+\}/g, (x) => {
          // ** If value is matched as "\{variable}" then return "{variable}".
          if (x.charAt(0) === "\\")
              return x.substring(1);
          // ** Get the variable, i.e "{variable}" -> "variable".
          const subStr = x.substring(1, x.length - 1);
          if (x.includes(".")) {
              const _value = resolvePropertyLookup(subStr, scope);
              return resolve(_value, scope, errorMessage);
          }
          // ** Get the value.
          const _value = scope[subStr];
          return resolve(_value, scope, errorMessage);
      });
  };

  const refreshTextNode = (blueprint) => {
      const { element, textValue } = blueprint;
      /* Dev */
      // _DevLogger_("REFRESH", "TEXTNODE", textNode);
      element.nodeValue = deBracer(textValue, blueprint.scope, "Refresh - textNode");
      return { condition: false };
  };

  const getWhereToInsert = (parentElement, childBlueprints, blueprintIndex) => {
      for (let [i, blueprint] of childBlueprints.entries()) {
          if (i < blueprintIndex + 1)
              continue;
          const collection = blueprint.collection || blueprint.forListBlueprints;
          if (collection instanceof Array) {
              for (let contentBlueprint of collection) {
                  const element = contentBlueprint.element;
                  if (parentElement.contains(element !== null && element !== void 0 ? element : null)) {
                      return element;
                  }
              }
          }
          if (blueprint.element === undefined) {
              continue;
          }
          const element = blueprint.element;
          if (parentElement.contains(element)) {
              return element;
          }
      }
  };
  // ** This function takes a HTMLElement and add its into the parent HTMLElement.
  const addElement = (element, parentElement, blueprintsList, blueprintIndex) => {
      /* DEV */
      // _DevLogger_("ADD", "ELEMENT", element, blueprintsList);
      const elementToInsertBefore = getWhereToInsert(parentElement, blueprintsList, blueprintIndex);
      if (elementToInsertBefore !== undefined) {
          parentElement.insertBefore(element, elementToInsertBefore);
      }
      else {
          parentElement.appendChild(element);
      }
  };

  const renderTextBlueprint = (blueprint, parentElement, childBlueprints, blueprintIndex) => {
      /* Dev */
      // _DevLogger_("RENDER", "TEXTNODE", blueprint);
      const { element, textValue, scope } = blueprint;
      if (element instanceof Text) {
          element.nodeValue = deBracer(textValue, scope, "Render - textNode");
          addElement(element, parentElement, childBlueprints, blueprintIndex);
      }
  };

  class MintNode {
      constructor(content, generate, render, refresh) {
          this.content = content instanceof Array ? content : content === null ? [] : [content];
          this.generate = generate;
          this.render = render;
          this.refresh = refresh;
      }
  }

  class MintText extends MintNode {
      constructor(textValue) {
          super(null, generateTextBlueprint, renderTextBlueprint, refreshTextNode);
          this.textValue = textValue;
      }
  }

  // ** This function takes an Array of raw content that the user can more easily define
  // ** and returns Mint consumable Nodes.
  const createMintText = (initialContent) => {
      const content = [];
      const targetContent = [];
      if (initialContent === null)
          return content;
      if (!(initialContent instanceof Array)) {
          targetContent.push(initialContent);
      }
      else {
          targetContent.push(...initialContent);
      }
      for (let x of targetContent) {
          // ** We only accept MintNodes and so here we check if the user has passed in string values.
          // ** Then we replace them with MintTextNodes.
          if (typeof x === "string") {
              content.push(new CreateNode(new MintText(x)));
          }
          else {
              content.push(x);
          }
      }
      return content;
  };

  const hasUpdatingBlueprint = (blueprintToCheck, blueprints) => {
      if (blueprints.includes(blueprintToCheck)) {
          return true;
      }
      let beingUpdated = false;
      for (let item of blueprints) {
          if (!!item.childBlueprints) {
              beingUpdated = hasUpdatingBlueprint(blueprintToCheck, item.childBlueprints);
          }
          if (beingUpdated === true)
              break;
      }
      return beingUpdated;
  };
  class Tracker extends Array {
      constructor() {
          super();
          this.addBlueprint = function (blueprint) {
              this.push(blueprint);
          };
          this.removeBlueprint = function (blueprint) {
              const index = this.indexOf(blueprint);
              this.splice(index, 1);
          };
          this.updating = function (blueprint) {
              return hasUpdatingBlueprint(blueprint, this);
          };
      }
  }

  const currentlyTracking = new Tracker();

  const resolveMAttributesOnRender = (blueprint, parentElement, parentChildBlueprints, blueprintIndex) => {
      const { orderedProps = [], props = {} } = blueprint;
      let shouldExit = { condition: false, value: undefined };
      for (let key of orderedProps) {
          const property = props[key];
          const resolver = property.onRender;
          if (shouldExit.condition === false &&
              property instanceof MintAttribute &&
              resolver instanceof Function) {
              shouldExit = resolver.apply(property, [
                  blueprint,
                  parentElement,
                  parentChildBlueprints,
                  blueprintIndex,
              ]);
          }
      }
      return shouldExit;
  };

  const renderBlueprint = (blueprint, parentElement, parentChildBlueprints, blueprintIndex) => {
      /* DEV */
      // _DevLogger_("RENDER", "Blueprint", blueprint);
      {
          const shouldReturn = resolveMAttributesOnRender(blueprint, parentElement, parentChildBlueprints, blueprintIndex);
          if (shouldReturn.condition) {
              return;
          }
      }
      if (blueprint.mintNode === null) {
          const { collection } = blueprint;
          if (collection) {
              const indexes = [];
              let i = blueprintIndex;
              while (i - blueprintIndex < collection.length) {
                  indexes.push(i);
                  i++;
              }
              renderBlueprints(collection, parentElement, parentChildBlueprints, indexes);
          }
          return;
      }
      blueprint.mintNode.render(blueprint, parentElement, parentChildBlueprints, blueprintIndex);
  };
  const renderBlueprints = (blueprints, parentElement, parentChildBlueprints = blueprints, indexes) => {
      for (let [index, blueprint] of blueprints.entries()) {
          renderBlueprint(blueprint, parentElement, parentChildBlueprints, !!indexes ? indexes[index] : index);
      }
  };

  // ** Root of the application.
  // ** There can be more than one application in a project.
  const app = (rootElement, baseRootScope, initialContent, { componentResolvers } = { componentResolvers: [] }) => {
      var _a, _b;
      // <@ REMOVE FOR PRODUCTION
      handleAppErrors(rootElement, baseRootScope, initialContent);
      // @>
      const rootScope = Object.assign(Object.assign({}, baseRootScope), { _isRootScope: true, _rootElement: rootElement, _rootChildBlueprints: [], componentResolvers });
      // ** LIFECYCLE CALL
      // ** This one runs before the blueprints are made, but after the data is defined.
      (_a = rootScope.onpreblueprint) === null || _a === void 0 ? void 0 : _a.call(rootScope, { scope: rootScope });
      // ** Create the app content that will be added to the root element.
      const content = createMintText(initialContent);
      // ** Generate the blueprints.
      const blueprints = generateBlueprints({
          nodes: content,
          scope: rootScope,
          parentBlueprint: null,
          _rootScope: rootScope,
          isSVG: false,
      });
      /* Dev */
      // _DevLogger_("APP", "BLUEPRINTS", blueprints);
      // ** Save a reference to the blueprints that are at the root element (App) level to the rootScope.
      rootScope._rootChildBlueprints = blueprints;
      // ** LIFECYCLE CALL
      // ** This is called only once.
      (_b = rootScope.oninit) === null || _b === void 0 ? void 0 : _b.call(rootScope, { scope: rootScope });
      // ** Render the blueprints with a tracker.
      // ** We detect if one of the renders tries to trigger a refresh, which is not allowed.
      // {
      for (let [index, blueprint] of blueprints.entries()) {
          // <@ REMOVE FOR PRODUCTION
          // ** If render or refresh is called on a blueprint that is currently rendering or refreshing then its an error.
          if (currentlyTracking.updating(blueprint))
              throw new Error(`${MINT_ERROR} Render was run on blueprint that was already rendering.`);
          currentlyTracking.addBlueprint(blueprint);
          // @>
          renderBlueprints([blueprint], rootElement, blueprints, [index]);
          // <@ REMOVE FOR PRODUCTION
          currentlyTracking.removeBlueprint(blueprint);
          // @>
      }
      // ** Here we define and return a function that can remove a created app.
      return { rootElement, scope: blueprints, rootScope };
  };

  const cloneContent = (mintContent) => {
      return mintContent;
  };

  // ** This function returns the getter part of a property lookup, if it has one.
  const resolverGetter = (key, parentScope) => {
      const properties = Object.getOwnPropertyDescriptor(parentScope, key);
      let output = undefined;
      if (properties === undefined)
          return output;
      // ** We can reason here that there must be a getter if it's no writable
      // ** as Mint doesn't create one with the other.
      if (properties.writable === undefined) {
          output = properties.get;
      }
      return output;
  };

  class ScopeTransformer {
      constructor(transform) {
          this.transform = transform;
      }
  }

  // ** Some props on a Component are not what should be accessed when doing a lookup
  // ** on that item.
  // ** For example content that is derived at lookup time from something else.
  // ** We replace those here with the other content.
  const applyScopeTransformers = (scope) => {
      const keys = Object.keys(scope);
      for (let key of keys) {
          // ** We need to check if this value has already been applied.
          // ** We can do this by checking if the value is writable and has a getter.
          const getter = resolverGetter(key, scope);
          // ** We don't want to lookup the item at this time and so we ignore these.
          if (getter === undefined && scope[key] instanceof ScopeTransformer) {
              scope[key].transform(scope, key);
          }
      }
  };

  // ** This function gets the content that should be used to replace "_children".
  // ** It works by having the content saved when the Component is used in an element().
  // ** This is then replaced with cloned content from the Component definition.
  // ** This saved content can then be used to replace "_children" where it it defined.
  const getContent = (blueprint) => {
      const { parentBlueprint, _childrenContent } = blueprint;
      // ** If the content is valid then return this.
      if (_childrenContent !== undefined)
          return _childrenContent;
      // ** If the parent does not have valid content then pass undefined, which will be ignored to prevent errors.
      if (parentBlueprint === null)
          return;
      // ** We cycle back through until we get valid content.
      return getContent(parentBlueprint);
  };
  const resolveChildBlueprints = (blueprint, childBlueprints, isSVG) => {
      const { scope, _rootScope } = blueprint;
      let childrenContent;
      // ** Here we get the content that should be used to replace "_children".
      // ** This is pre Blueprint generated rated.
      childrenContent = getContent(blueprint);
      if (childrenContent !== undefined) {
          // ** If this is the keyword "_children" then replace this with childrenContent.
          // ** As these are blueprints then they will need to be cloned and unique at the render phase.
          for (let [i, item] of childBlueprints.entries()) {
              if (item instanceof TextBlueprint && item.textValue === "_children") {
                  // ** This is IMPORTANT.
                  // ** We need to remove "_children" before generating Blueprints otherwise we'll get into
                  // ** an infinite loop.
                  childBlueprints.splice(i, 1);
                  // ** Now we can generate the Blueprints.
                  const _children = generateBlueprints({
                      nodes: childrenContent,
                      scope,
                      parentBlueprint: blueprint,
                      _rootScope,
                      isSVG
                  });
                  // ** Now we insert the Blueprints, replacing "_children".
                  childBlueprints.splice(i, 0, ..._children);
              }
          }
      }
      return childBlueprints;
  };

  // ** This function returns if a string matches the provided start and end characters.
  // ** E.g 1
  // ** str = "[class]"
  // ** matches isAttrType(str, "[", "]")
  // ** E.g 2
  // ** str = "(click)"
  // ** matches isAttrType(str, "(", ")")
  const isAttrType = (attr, start, end) => {
      return attr.charAt(0) === start && attr.charAt(attr.length - 1) === end;
  };

  const handleResolverProperties = (scope, key, value, parentScope) => {
      const getter = resolverGetter(value, parentScope);
      if (getter instanceof Function) {
          // ** If getter is undefined it means that this property is a getter, therefore created by the Resolver Object.
          // ** With that in mind we want to preserve this getter instead of just using the current value.
          Object.defineProperty(scope, key, {
              get: getter,
              configurable: true,
          });
      }
      else {
          const newValue = resolvePropertyLookup(value, parentScope);
          // ** Here we check what the new value is going to be.
          // ** If its undefined or null it means we don't want to change the default or previously
          // ** defined value.
          if (newValue === undefined || newValue === null)
              return;
          scope[key] = newValue;
      }
  };
  const bindingTemplateProp = (scope, key, value, parentScope) => {
      if (key !== "scope") {
          handleResolverProperties(scope, key, value, parentScope);
          return;
      }
  };
  // ** When a Component is defined, props are provided to it.
  // ** Here we take those props and assign their values from the parent scope to this Component.
  const assignProps = (scope, orderedProps, props, parentScope) => {
      for (let key of orderedProps) {
          const value = props[key];
          if (isAttrType(key, "[", "]")) {
              const _key = key.substring(1, key.length - 1);
              bindingTemplateProp(scope, _key, value, parentScope);
          }
          else {
              const descriptors = Object.getOwnPropertyDescriptor(scope, key);
              // ** We do not want to try to assign to a property that only has a getter. Check for that here.
              if (descriptors !== undefined &&
                  descriptors.get !== undefined &&
                  descriptors.set === undefined) {
                  return;
              }
              // ** If the prop is a string then extract the values (deBrace) from it before assigning.
              if (typeof value === "string") {
                  scope[key] = deBracer(value, parentScope, "Template -- props");
              }
              else {
                  scope[key] = value;
              }
          }
      }
  };

  const checkForErrorsOnBlueprint = (blueprint) => {
      // <@ REMOVE FOR PRODUCTION
      if (blueprint.element === undefined) {
          if (blueprint.collection === undefined) {
              throw new Error(`${MINT_ERROR} Element Blueprint was defined without element or collection.`);
          }
      }
      if (blueprint.element !== undefined) {
          if (blueprint.collection !== undefined) {
              throw new Error(`${MINT_ERROR} Element Blueprint was defined with both element and collection.`);
          }
      }
      if (blueprint.collection !== undefined) {
          if (blueprint.childBlueprints !== undefined) {
              throw new Error(`${MINT_ERROR} Element Blueprint was defined with both collection and childBlueprints.`);
          }
      }
      // @>
  };

  const resolveMAttributesOnGenerate = ({ node, htmlElement, orderedProps, props, parentScope, scope, _children, parentBlueprint, _rootScope, isSVG, isComponent, isAttribute, }) => {
      let shouldExit = { condition: false, value: undefined };
      for (let key of orderedProps) {
          const property = props[key];
          const resolver = property.onGenerate;
          if (shouldExit.condition === false &&
              property instanceof MintAttribute &&
              resolver instanceof Function) {
              shouldExit = resolver.apply(property, [
                  {
                      node,
                      htmlElement,
                      orderedProps,
                      props,
                      parentScope,
                      scope,
                      _children,
                      parentBlueprint,
                      _rootScope,
                      isSVG,
                      isComponent,
                      isAttribute,
                  },
              ]);
          }
      }
      return shouldExit;
  };

  class MintScope {
      constructor() { }
  }

  class ComponentBlueprint extends Blueprint {
      constructor({ mintNode, fragment, element, orderedProps, props, orderedAttributes, attributes, scope, parentBlueprint, collection, childBlueprints, _rootScope, _childrenContent }) {
          super({
              mintNode,
              scope,
              parentBlueprint,
              _rootScope
          });
          this.isComponent = true;
          if (!!fragment)
              this.fragment = fragment;
          if (!!element)
              this.element = element;
          this.orderedProps = orderedProps;
          this.props = props;
          this.orderedAttributes = orderedAttributes;
          this.attributes = attributes;
          if (!!collection)
              this.collection = collection;
          if (!!childBlueprints)
              this.childBlueprints = childBlueprints;
          if (!!_childrenContent)
              this._childrenContent = _childrenContent;
          if (element instanceof SVGElement)
              this.isSVG = true;
          this._dev = "Component";
      }
  }

  const generateComponentBlueprint = ({ node, orderedProps, props, scope: parentScope, parentBlueprint, _rootScope, isSVG, useGivenScope }) => {
      var _a, _b;
      const { mintNode, content: _children } = node;
      fixProps(mintNode.attributes);
      const mintComponent = mintNode;
      const { element, content } = mintComponent;
      const attributes = cloneProps({
          props: mintComponent.attributes
      });
      const orderedAttributes = resolvePropsOrder(attributes);
      // <@ REMOVE FOR PRODUCTION
      if (!(mintComponent.scope instanceof Function) && mintComponent.scope !== null) {
          throw new Error(`${MINT_ERROR} Mint Component -- scope -- must pass a constructor function for Component scope argument (second argument) i.e component("div", function(){}`);
      }
      // @>
      element === "svg" && (isSVG = true);
      // <@ REMOVE FOR PRODUCTION
      if (element !== "<>" && ((element === null || element === void 0 ? void 0 : element.includes("<")) || (element === null || element === void 0 ? void 0 : element.includes(">")))) {
          throw new Error(`${MINT_ERROR} Element sent to node() contains angle brackets "${element}". Use "${element.substring(1, element.length - 1)}" instead.`);
      }
      // @>
      // ** Generate new HTMLElement.
      // ** If this is a Fragment then a new Element won't be defined.
      let newHTMLElement = undefined;
      if (element !== undefined && element !== "<>") {
          newHTMLElement =
              element === "svg" || isSVG
                  ? document.createElementNS("http://www.w3.org/2000/svg", element)
                  : document.createElement(element);
      }
      // ** Create the new Component's scope.
      let componentScope;
      if (useGivenScope) {
          // ** When mFor is looped over a Component an extra layer of scope is added.
          // ** In order to get the original Component we must do it manually here.
          componentScope = parentScope;
      }
      else {
          componentScope = new ((_a = mintComponent.scope) !== null && _a !== void 0 ? _a : MintScope)();
          // ** Certain props are ScopeTransformer objects and apply their values differently
          // ** to the Component.
          // ** We handle that here.
          applyScopeTransformers(componentScope);
      }
      // ** Here we check for app level Component Resolvers.
      // ** These are things that are run against the Component.
      // ** For example generating prop types checks.
      if (!!_rootScope.componentResolvers) {
          for (let componentResolver of _rootScope.componentResolvers) {
              componentResolver(orderedProps !== null && orderedProps !== void 0 ? orderedProps : [], props !== null && props !== void 0 ? props : {}, mintComponent, parentScope);
          }
      }
      if (!useGivenScope) {
          // ** When a Component is defined, props are provided to it.
          // ** Here we take those props and assign their values from the parent scope to this Component.
          assignProps(componentScope, orderedProps !== null && orderedProps !== void 0 ? orderedProps : [], props !== null && props !== void 0 ? props : {}, parentScope);
      }
      const commonValues = {
          node,
          htmlElement: newHTMLElement,
          parentScope,
          scope: componentScope,
          _children,
          parentBlueprint,
          _rootScope,
          isSVG,
          isComponent: true
      };
      {
          // ** Here we resolve the props of the Component.
          // ** If one of the mAttributes on the list means we stop generating here then detect that.
          const shouldReturn = resolveMAttributesOnGenerate(Object.assign({ orderedProps: orderedProps !== null && orderedProps !== void 0 ? orderedProps : [], props: props !== null && props !== void 0 ? props : {}, isAttribute: false }, commonValues));
          if (shouldReturn.condition) {
              return shouldReturn.value;
          }
      }
      {
          // ** Here we resolve the attributes of the Component.
          // ** If one of the mAttributes on the list means we stop generating here then detect that.
          const shouldReturn = resolveMAttributesOnGenerate(Object.assign({ orderedProps: orderedAttributes, props: attributes, isAttribute: true }, commonValues));
          if (shouldReturn.condition) {
              return shouldReturn.value;
          }
      }
      // ** LIFECYCLE CALL
      (_b = componentScope.onpreblueprint) === null || _b === void 0 ? void 0 : _b.call(componentScope);
      // ** We define the content that might be used to populate the "_children" keyword inside
      // ** the Component.
      const blueprint = new ComponentBlueprint({
          mintNode: mintComponent,
          fragment: element === "<>" || undefined,
          element: newHTMLElement,
          orderedProps: orderedProps !== null && orderedProps !== void 0 ? orderedProps : [],
          props: props !== null && props !== void 0 ? props : {},
          orderedAttributes,
          attributes,
          scope: componentScope,
          parentBlueprint,
          _rootScope
      });
      if (!!_children) {
          blueprint._childrenContent = [];
          for (let x of _children) {
              blueprint._childrenContent.push(cloneContent(x));
          }
      }
      componentScope._mintBlueprint = blueprint;
      /* Dev */
      // _DevLogger_("GENERATE", "COMPONENT", blueprint);
      // ** Clone the content so that each Component has unique content from the original definition.
      const clonedContent = [];
      for (let x of content) {
          clonedContent.push(cloneContent(x));
      }
      const _childBlueprints = generateBlueprints({
          nodes: clonedContent,
          scope: componentScope,
          parentBlueprint: blueprint,
          _rootScope,
          isSVG
      });
      // ** Check if the children content contains the "_children" keyword.
      // ** Using this allows the content of this child blueprint to use custom content passed into this parent Component.
      // ** E.g
      /*
        const Sub = component("div", null, null, "_children");
        const Main = component("main", null, null, element(Sub, null, "Content"));
    
        Produces:
    
        <main>
          <div>Content</div>
        </main>
      */
      const childBlueprints = resolveChildBlueprints(blueprint, _childBlueprints, isSVG);
      if (element === "<>") {
          blueprint.collection = childBlueprints;
      }
      else {
          blueprint.childBlueprints = childBlueprints;
      }
      checkForErrorsOnBlueprint(blueprint);
      return blueprint;
  };

  const renderEventAttributes = (element, key, value, orderedAttributes, attributes, scope) => {
      // ** Get the function we will run on the listener from the scope.
      const eventFunction = scope[value];
      // ** As the target value is stored inside parenthesis we extract it here.
      // ** e.g (click) -> click
      const target = key.substring(1, key.length - 1);
      const listener = (event) => {
          // ** We do not let undefined mean an absense of a value here because undefined could be an accident.
          // ** We check for null instead as that is not a default value.
          if (eventFunction === undefined) {
              console.error(element);
              throw new Error(`${MINT_ERROR} Event provided is undefined, use instead null to skip, for event '${target}' - '${value}'.`);
          }
          if (eventFunction === null)
              return;
          eventFunction.apply(scope, [event, element, scope]);
      };
      const options = eventFunction === null || eventFunction === void 0 ? void 0 : eventFunction.mintEventOptions;
      element.addEventListener(target, listener, options);
      {
          // ** To make sure this isn't added more than once, remove it once added.
          let index = -1;
          for (let [i, _key] of orderedAttributes.entries()) {
              if (_key === key) {
                  index = i;
              }
          }
          index !== undefined && index !== -1 && orderedAttributes.splice(index, 1);
          delete attributes[key];
      }
  };

  const getValue = (property, scope) => {
      const getter = resolverGetter(property, scope);
      let _value = getter instanceof Function ? getter.apply(scope) : scope[property];
      if (typeof _value === "number") {
          _value = _value.toString();
      }
      return _value;
  };
  const renderBindingAttributes = (element, key, property, scope) => {
      const target = key.substring(1, key.length - 1);
      const _value = getValue(property, scope);
      const newAttributeValue = _value instanceof Function ? _value.apply(scope) : _value;
      /* Dev */
      // _DevLogger_("RENDER", "ATTRIBUTES", target, newAttributeValue);
      if (typeof newAttributeValue === "boolean") {
          element[target] = newAttributeValue;
      }
      else if (attributesThatAreProperties.includes(target)) {
          const value = typeof newAttributeValue === "string"
              ? deBracer(newAttributeValue, scope, "Render - binding property")
              : newAttributeValue;
          // ===
          /*
              For this specific case (setting value on <select> elements).
              The value property does not apply if the option for that value does not exist as a child of the select.
              Therefore the value has to be set after adding the options, which we can do here by waiting until the stack has finished).
            */
          if (target === "value" && element instanceof HTMLSelectElement) {
              setTimeout(() => {
                  element[target] = value;
              }, 0);
          }
          // ===
          else if (value !== undefined) {
              element[target] = value;
          }
      }
      else if (newAttributeValue !== undefined &&
          newAttributeValue !== false &&
          newAttributeValue !== null) {
          element.setAttribute(target, deBracer(newAttributeValue, scope, `Render - binding attribute - (${target}), (${newAttributeValue})`));
      }
  };

  const renderStringAttribute = (element, key, value, scope) => {
      if (typeof value === "boolean") {
          element[key] = value;
      }
      else {
          const newAttributeValue = deBracer(value, scope, `Render - string attribute (${key}), (${value})`);
          element.setAttribute(key, newAttributeValue);
      }
  };

  const setAttribute$1 = (element, key, value, orderedAttributes, attributes, scope) => {
      /* Dev */
      // _DevLogger_("RENDER", "SETATTRIBUTE", key, "|", value, [element]);
      // ** Events are attributes defined like: "(attr)".
      const isEvent = isAttrType(key, "(", ")");
      if (isEvent) {
          renderEventAttributes(element, key, value, orderedAttributes, attributes, scope);
      }
      // ** Value binding attributes are defined like "[attr]".
      const isValueBinding = isAttrType(key, "[", "]");
      if (isValueBinding) {
          renderBindingAttributes(element, key, value, scope);
      }
      {
          const isNormal = !isEvent && !isValueBinding;
          if (isNormal) {
              renderStringAttribute(element, key, value, scope);
          }
      }
  };
  const renderAttributes = (
  // element: TElement,
  // orderedAttributes: null | Array<string>,
  // attributes: IAttributes,
  // scope: Object
  blueprint) => {
      const { orderedAttributes, attributes, scope } = blueprint;
      const element = blueprint.element;
      /* DEV */
      // _DevLogger_("RENDER", "ATTRIBUTES", orderedAttributes, { element });
      if (attributes === undefined || orderedAttributes === null)
          return;
      // <@ REMOVE FOR PRODUCTION
      if (orderedAttributes === undefined)
          throw new Error(`${MINT_ERROR} Attributes cannot be undefined, only null or object`);
      // @>
      // ** Loop over the attributes and add them in turn.
      // ** "set" here refers to all the different types of attributes.
      // ** We clone the attributes here so that the loop will retain the full list of attributes
      // ** even if some are removed during the processing.
      for (let key of [...orderedAttributes]) {
          const value = attributes[key];
          // ** If the attribute here is a mint attribute then ignore that attribute.
          if (attributesToIgnore.includes(key))
              continue;
          // ** If the value is undefined, that is acceptable but no attribute will be added.
          if (value === undefined)
              continue;
          setAttribute$1(element, key, value, orderedAttributes, attributes, scope);
      }
  };

  const renderComponentBlueprint = (blueprint, parentElement, parentChildBlueprints, blueprintIndex) => {
      /* Dev */
      // _DevLogger_("RENDER", "COMPONENT", blueprint);
      var _a, _b, _c, _d, _e;
      const { element, scope, collection, childBlueprints } = blueprint;
      // ** LIFECYCLE CALL
      (_a = scope.oninit) === null || _a === void 0 ? void 0 : _a.call(scope, { scope });
      (_b = scope.oninsert) === null || _b === void 0 ? void 0 : _b.call(scope, { scope });
      (_c = scope.oneach) === null || _c === void 0 ? void 0 : _c.call(scope, { scope });
      if (element !== undefined) {
          // renderAttributes(element, orderedAttributes, attributes, scope);
          renderAttributes(blueprint);
      }
      // ** Here we add the Component Element to the parentElement, if there is a Component Element.
      if (element !== undefined) {
          addElement(element, parentElement, parentChildBlueprints, blueprintIndex);
      }
      // ** Here we add the collection of Component Elements if there is a collection.
      if (collection !== undefined) {
          for (let x of collection) {
              renderBlueprints([x], parentElement, parentChildBlueprints, [blueprintIndex]);
          }
      }
      // ** Here we handle the children of this Component, if it has any.
      if (!!childBlueprints) {
          renderBlueprints(childBlueprints, element !== null && element !== void 0 ? element : parentElement);
      }
      // ** LIFECYCLE CALL
      (_d = scope.onafterinsert) === null || _d === void 0 ? void 0 : _d.call(scope, { scope });
      (_e = scope.onaftereach) === null || _e === void 0 ? void 0 : _e.call(scope, { scope });
      return;
  };

  // ** It's not super easy to reason how to get the parentBlueprint of
  // ** of a Blueprint and so we put that logic here.
  const getParentElement = (blueprint) => {
      const { parentBlueprint } = blueprint;
      const { _rootElement } = blueprint._rootScope;
      if (parentBlueprint === null)
          return _rootElement;
      const { element } = parentBlueprint;
      if (element !== undefined)
          return element;
      return getParentElement(parentBlueprint);
  };

  const refreshBlueprint = (blueprint, options) => {
      const parentElement = getParentElement(blueprint);
      /* Dev */
      // _DevLogger_("REFRESH", "Blueprint", blueprint);
      const focusTarget = document.activeElement;
      if (blueprint.mintNode === null) {
          if (blueprint.refresh) {
              blueprint.refresh(blueprint, { newlyInserted: options.newlyInserted });
          }
          return;
      }
      const _refresh = blueprint.mintNode.refresh;
      _refresh(blueprint, parentElement, options);
      // ** Here we check if the Element that was refreshed was the activeElement (had focus).
      // ** If it was then we re add the focus if it has been lost.
      if (focusTarget !== null &&
          focusTarget !== document.activeElement &&
          document.body.contains(focusTarget)) {
          focusTarget.focus();
      }
  };
  const refreshBlueprints = (blueprints, options) => {
      for (let blueprint of blueprints) {
          refreshBlueprint(blueprint, options);
      }
  };

  const getOldValue = (target, element) => {
      if (attributesThatAreProperties.includes(target)) {
          return element[target];
      }
      return element.getAttribute(target);
  };
  const refreshBindingAttributes = (element, key, value, scope) => {
      const target = key.substring(1, key.length - 1);
      const oldAttributeValue = getOldValue(target, element);
      const _value = resolvePropertyLookup(value, scope);
      const newAttributeValue = _value instanceof Function ? _value.apply(scope) : _value;
      if (oldAttributeValue === newAttributeValue) {
          return;
      }
      if (typeof newAttributeValue === "boolean") {
          element[target] = newAttributeValue;
      }
      else if (attributesThatAreProperties.includes(target)) {
          const value = typeof newAttributeValue === "string"
              ? deBracer(newAttributeValue, scope, "Refresh - binding property")
              : newAttributeValue;
          // ===
          /*
              For this specific case (setting value on <select> elements).
              The value property does not apply if the option for that value does not exist as a child of the select.
              Therefore the value has to be set after adding the options, which we can do here by waiting until the stack has finished).
            */
          if (target === "value" && element instanceof HTMLSelectElement) {
              setTimeout(() => {
                  element[target] = value;
              }, 0);
          }
          // ===
          // ===
          /*
            For the case where the property needs to be set as a boolean but is not a boolean value
            do that here.
            For example setting checked on Input type checkbox.1
          */
          else if (attributesThatAreBoolean.includes(target)) {
              element[target] = !!value;
          }
          // ===
          else if (value !== undefined) {
              element[target] = value;
          }
      }
      else if (newAttributeValue === undefined || newAttributeValue === null) {
          element.removeAttribute(target);
      }
      else {
          element.setAttribute(target, deBracer(newAttributeValue, scope, "Refresh - binding attribute"));
      }
  };

  const refreshStringAttribute = (element, key, value, scope) => {
      const oldAttributeValue = element.getAttribute(key);
      if (oldAttributeValue === value) {
          return;
      }
      if (typeof value === "boolean") {
          element[key] = value;
      }
      else if (value === undefined) {
          element.removeAttribute(key);
      }
      else {
          const newAttributeValue = deBracer(value, scope, "Refresh - string attribute");
          if (oldAttributeValue === newAttributeValue) {
              return;
          }
          element.setAttribute(key, newAttributeValue);
      }
  };

  const setAttribute = (element, key, value, scope) => {
      /* Dev */
      // _DevLogger_("REFRESH", "SETATTRIBUTE: ", key, "|", value);
      if (isAttrType(key, "(", ")")) {
          console.error("Event handler attribute was present in refresh");
          console.trace();
      }
      if (isAttrType(key, "[", "]")) {
          refreshBindingAttributes(element, key, value, scope);
      }
      else {
          refreshStringAttribute(element, key, value, scope);
      }
  };
  const refreshAttributes = (element, orderedAttributes, attributes, scope) => {
      /* DEV */
      // _DevLogger_("REFRESH", "ATTRIBUTES: ", orderedAttributes, { element });
      for (let key of orderedAttributes) {
          const value = attributes[key];
          if (attributesToIgnore.includes(key))
              continue;
          setAttribute(element, key, value, scope);
      }
  };

  const resolveMAttributesOnRefresh = (blueprint, parentElement, options) => {
      const { orderedProps = [], props = {}, orderedAttributes = [], attributes = {} } = blueprint;
      let shouldExit = { condition: false, value: undefined };
      for (let key of orderedProps) {
          const property = props[key];
          const resolver = property.onRefresh;
          if (shouldExit.condition === false && property instanceof MintAttribute && resolver instanceof Function) {
              shouldExit = resolver.apply(property, [blueprint, parentElement, options]);
          }
      }
      for (let key of orderedAttributes) {
          const property = attributes[key];
          const resolver = property.onRefresh;
          if (shouldExit.condition === false && property instanceof MintAttribute && resolver instanceof Function) {
              shouldExit = resolver.apply(property, [blueprint, parentElement, options]);
          }
      }
      return shouldExit;
  };

  const refreshComponentBlueprint = (blueprint, parentElement, options) => {
      /* Dev */
      // _DevLogger_("REFRESH", "COMPONENT: ", blueprint);
      var _a, _b, _c, _d, _e;
      const { element, orderedProps, props, orderedAttributes, attributes, scope, parentBlueprint, collection, childBlueprints, } = blueprint;
      applyScopeTransformers(scope);
      {
          const parentScope = (_a = parentBlueprint === null || parentBlueprint === void 0 ? void 0 : parentBlueprint.scope) !== null && _a !== void 0 ? _a : blueprint._rootScope;
          assignProps(scope, orderedProps, props, parentScope);
      }
      const shouldReturn = resolveMAttributesOnRefresh(blueprint, parentElement, options);
      if (shouldReturn.condition) {
          return shouldReturn;
      }
      // ** LIFECYCLE CALL
      options.newlyInserted && ((_b = scope.oninsert) === null || _b === void 0 ? void 0 : _b.call(scope, { scope }));
      (_c = scope.oneach) === null || _c === void 0 ? void 0 : _c.call(scope, { scope });
      if (element !== undefined && !(element instanceof Text)) {
          refreshAttributes(element, orderedAttributes, attributes, scope);
      }
      if (!!collection) {
          refreshBlueprints(collection, options);
      }
      if (!!childBlueprints) {
          refreshBlueprints(childBlueprints, options);
      }
      // ** LIFECYCLE CALL
      options.newlyInserted && ((_d = scope.onafterinsert) === null || _d === void 0 ? void 0 : _d.call(scope, { scope }));
      (_e = scope.onaftereach) === null || _e === void 0 ? void 0 : _e.call(scope, { scope });
      return shouldReturn;
  };

  class MintComponent extends MintNode {
      constructor(element, attributes, content, scope) {
          super(content, generateComponentBlueprint, renderComponentBlueprint, refreshComponentBlueprint);
          this.element = element;
          this.attributes = attributes !== null && attributes !== void 0 ? attributes : {};
          this.scope = scope;
          if (scope === null || scope === void 0 ? void 0 : scope._propTypes) {
              this.propTypes = scope._propTypes;
          }
      }
      clone() {
          var _a;
          const content = [];
          for (let x of this.content) {
              content.push(cloneContent(x));
          }
          const cloned = new MintComponent((_a = this.element) !== null && _a !== void 0 ? _a : "<>", Object.assign({}, this.attributes), content, this.scope);
          return cloned;
      }
  }

  const component = (element, scope = null, attributes = null, initialContent = null) => {
      // <@ REMOVE FOR PRODUCTION
      if (element === "<>" && typeof initialContent === "string") {
          throw new Error(`${MINT_ERROR} Cannot define content as 'string' when Component is a Fragment (<>).`);
      }
      // @>
      // <@ REMOVE FOR PRODUCTION
      if (!!(attributes === null || attributes === void 0 ? void 0 : attributes.mIf)) {
          throw new Error(`${MINT_ERROR} Cannot add mIf directly to Components attribute in Component definition.`);
      }
      // @>
      // <@ REMOVE FOR PRODUCTION
      if (!!(attributes === null || attributes === void 0 ? void 0 : attributes.mFor)) {
          throw new Error(`${MINT_ERROR} Cannot add mFor directly to Components attribute in Component definition.`);
      }
      // @>
      const content = createMintText(initialContent);
      return new MintComponent(element, attributes, content, scope);
  };

  class TemplateBlueprint extends Blueprint {
      constructor({ mintNode, fragment, templateState, scope, parentBlueprint, _rootScope, }) {
          super({
              mintNode,
              scope,
              parentBlueprint,
              _rootScope,
          });
          if (!!fragment)
              this.fragment = fragment;
          this.templateState = templateState;
          this._dev = "Template";
      }
  }

  const generateMTemplate = ({ node, scope, parentBlueprint, _rootScope }) => {
      const { mintNode } = node;
      const mintTemplate = mintNode;
      return new TemplateBlueprint({
          mintNode: mintTemplate,
          templateState: null,
          scope,
          parentBlueprint,
          _rootScope
      });
  };

  const renderMTemplate = (blueprint, parentElement, parentChildBlueprints, blueprintIndex) => {
      const { mintNode, scope, parentBlueprint, _rootScope } = blueprint;
      let { options, templateGenerator, scopeLookup } = mintNode;
      if (scopeLookup !== undefined) {
          templateGenerator = scope[scopeLookup];
          // <@ REMOVE FOR PRODUCTION
          if (!(templateGenerator instanceof Function)) {
              throw new Error(`${MINT_ERROR} -- node(template("target")) -- No function provided from "target". Make sure you write () => TMintContent not just TMintContent`);
          }
          // @>
      }
      const { conditionedBy } = options;
      blueprint.templateState = conditionedBy && scope[conditionedBy];
      const template = templateGenerator.apply(scope);
      let content;
      if (template instanceof Array) {
          content = template;
      }
      else {
          content = [template];
      }
      const collection = generateBlueprints({
          nodes: content,
          scope,
          parentBlueprint,
          _rootScope,
      });
      // <@ REMOVE FOR PRODUCTION
      if (!!collection.find((x) => x instanceof TextBlueprint && x.textValue === "_children")) {
          throw new Error(`${MINT_ERROR} cannot add "_children" as a child of mTemplate template.`);
      }
      // @>
      for (let x of collection) {
          renderBlueprints([x], parentElement, parentChildBlueprints, [
              blueprintIndex,
          ]);
      }
      blueprint.collection = collection;
  };

  const getAllElements = (blueprints) => {
      const allElements = [];
      for (let x of blueprints) {
          if (x.element instanceof Element) {
              allElements.push(x.element);
              continue;
          }
          if (x.collection instanceof Array) {
              allElements.push(...getAllElements(x.collection));
              continue;
          }
      }
      return allElements;
  };

  const fillOutElements = (blueprintList, initialBlueprint) => {
      const output = [];
      const a = output;
      for (let x of blueprintList) {
          const b = x;
          if (b !== initialBlueprint && b.fragment) {
              if (!!b.childBlueprints) {
                  a.push(...fillOutElements(b.childBlueprints, initialBlueprint));
              }
              if (!!b.collection) {
                  a.push(...fillOutElements(b.collection, initialBlueprint));
              }
          }
          else {
              a.push(b);
          }
      }
      return output;
  };
  // ** Here we take a Blueprint and find the index among the parent content so that
  // ** we can insert the Blueprint content correctly amongst it.
  const getBlueprintIndex = (blueprint, initialBlueprint = blueprint) => {
      const { parentBlueprint } = blueprint;
      const { _rootChildBlueprints } = blueprint._rootScope;
      let blueprintList, blueprintIndex;
      if (parentBlueprint === null) {
          blueprintList = fillOutElements(_rootChildBlueprints, initialBlueprint);
          blueprintIndex = _rootChildBlueprints.indexOf(blueprint);
          return { blueprintList, blueprintIndex };
      }
      const { fragment, collection, childBlueprints } = parentBlueprint;
      if (fragment) {
          return getBlueprintIndex(parentBlueprint, initialBlueprint);
      }
      if (childBlueprints !== undefined) {
          blueprintList = childBlueprints;
      }
      if (collection !== undefined) {
          blueprintList = collection;
      }
      blueprintList = fillOutElements(blueprintList, initialBlueprint);
      blueprintIndex = blueprintList.indexOf(initialBlueprint);
      /* DEV */
      // _DevLogger_("REFRESH", "INDEX", blueprint, blueprintIndex);
      return { blueprintList, blueprintIndex };
  };

  const conductRefresh = (blueprint) => {
      var _a;
      const { collection } = blueprint;
      const parentElement = getParentElement(blueprint);
      const { blueprintList: parentBlueprintList, blueprintIndex } = getBlueprintIndex(blueprint);
      const allElements = getAllElements(collection);
      for (let x of allElements) {
          (_a = x.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(x);
      }
      renderMTemplate(blueprint, parentElement, parentBlueprintList, blueprintIndex);
  };
  const refreshMTemplate = (blueprint) => {
      const { collection, scope, templateState, mintNode } = blueprint;
      const { options: { conditionedBy, onevery }, } = mintNode;
      // ** If there is no content to add; DO NOTHING
      if (collection === undefined)
          return { condition: false };
      // ** If we want to refresh every time then DO that here and end.
      if (onevery === true) {
          conductRefresh(blueprint);
          return { condition: false };
      }
      if (conditionedBy !== undefined) {
          const newTemplateState = resolvePropertyLookup(conditionedBy, scope);
          // ** If the conditional state hasn't changed: DO NOTHING
          if (templateState === newTemplateState)
              return { condition: false };
          // ** Update the state for next time.
          blueprint.templateState = newTemplateState;
          conductRefresh(blueprint);
          return { condition: false };
      }
      return { condition: false };
  };

  class MintTemplate extends MintNode {
      constructor(optionsOrGeneratorOrScopeLookup, templateGeneratorOrScopeLookup) {
          super(null, generateMTemplate, renderMTemplate, refreshMTemplate);
          if (templateGeneratorOrScopeLookup !== undefined) {
              this.options = optionsOrGeneratorOrScopeLookup;
              if (typeof templateGeneratorOrScopeLookup === "string") {
                  this.scopeLookup = templateGeneratorOrScopeLookup;
              }
              else {
                  this.templateGenerator = templateGeneratorOrScopeLookup;
              }
          }
          else {
              this.options = {
                  onevery: true,
              };
              if (typeof optionsOrGeneratorOrScopeLookup === "string") {
                  this.scopeLookup = optionsOrGeneratorOrScopeLookup;
              }
              else {
                  this.templateGenerator = optionsOrGeneratorOrScopeLookup;
              }
          }
      }
      addChildren() { }
      addProperties() { }
  }

  const template = (optionsOrGenerator, templateGenerator) => {
      return new MintTemplate(optionsOrGenerator, templateGenerator);
  };

  class ElementBlueprint extends Blueprint {
      constructor({ mintNode, fragment, element, orderedAttributes, attributes, scope, parentBlueprint, _rootScope, collection, childBlueprints }) {
          super({
              mintNode,
              scope,
              parentBlueprint,
              _rootScope
          });
          this.isComponent = false;
          if (!!fragment)
              this.fragment = fragment;
          if (!!element)
              this.element = element;
          this.orderedAttributes = orderedAttributes;
          this.attributes = attributes;
          if (!!collection)
              this.collection = collection;
          if (!!childBlueprints)
              this.childBlueprints = childBlueprints;
          if (element instanceof SVGElement)
              this.isSVG = true;
          this._dev = "Element";
      }
  }

  const generateElementBlueprint = ({ node, orderedProps: orderedAttributes, props: attributes, scope, parentBlueprint, _rootScope, isSVG, }) => {
      // ** This Function can only be accessed  by MintElement so tell TS that here.
      const mintElement = node.mintNode;
      const { element, content } = mintElement;
      // ** We to check for SVG, which we do here.
      // ** Child Elements of SVG are all SVG Elements as well so it stays true from here downwards.
      element === "svg" && (isSVG = true);
      let newHTMLElement = undefined;
      // ** Check for Fragments.
      if (element !== undefined && element !== "<>") {
          // ** Create the new Element in JS
          // ** SVG Elements are slightly different and are created differently here.
          newHTMLElement = isSVG
              ? // ** An SVGElement is different to a HTMLElement, it is older and needs a different method to be created.
                  document.createElementNS("http://www.w3.org/2000/svg", element)
              : // ** Create a new HTMLElment.
                  document.createElement(element);
      }
      {
          // ** Here we resolve the attributes of the element.
          // ** If one of the mAttributes on the list means we stop generating here then detect that.
          const shouldReturn = resolveMAttributesOnGenerate({
              orderedProps: orderedAttributes !== null && orderedAttributes !== void 0 ? orderedAttributes : [],
              props: attributes !== null && attributes !== void 0 ? attributes : {},
              htmlElement: newHTMLElement,
              node,
              parentScope: scope,
              scope,
              _children: null,
              parentBlueprint,
              _rootScope,
              isSVG,
              isComponent: false,
              isAttribute: true,
          });
          if (shouldReturn.condition) {
              return shouldReturn.value;
          }
      }
      const blueprint = new ElementBlueprint({
          mintNode: mintElement,
          fragment: element === "<>" || undefined,
          element: newHTMLElement,
          orderedAttributes: orderedAttributes !== null && orderedAttributes !== void 0 ? orderedAttributes : [],
          attributes: attributes !== null && attributes !== void 0 ? attributes : {},
          scope,
          parentBlueprint,
          _rootScope,
      });
      /* Dev */
      // _DevLogger_("GENERATE", "ELEMENT", blueprint);
      const _childBlueprints = [];
      // ** Here we produce the content of the children of this Element.
      if (content !== undefined) {
          _childBlueprints.push(...generateBlueprints({
              nodes: content,
              scope,
              parentBlueprint: blueprint,
              _rootScope,
              isSVG,
          }));
      }
      // ** Check if the children content contains the "_children" keyword.
      // ** Using this allows the content of this child blueprint to use custom content passed into this parent Component.
      // ** E.g
      /*
        const Sub = component("div", null, null, "_children");
        const Main = component("main", null, null, element(Sub, null, "Content"));
    
        Produces:
    
        <main>
          <div>Content</div>
        </main>
      */
      const childBlueprints = resolveChildBlueprints(blueprint, _childBlueprints, isSVG);
      if (element === "<>") {
          blueprint.collection = childBlueprints;
      }
      else {
          blueprint.childBlueprints = childBlueprints;
      }
      checkForErrorsOnBlueprint(blueprint);
      return blueprint;
  };

  const renderElementBlueprint = (blueprint, parentElement, parentChildBlueprints, blueprintIndex) => {
      const { element, collection, childBlueprints } = blueprint;
      /* Dev */
      // _DevLogger_("RENDER", "ELEMENT", blueprint, blueprintIndex);
      if (element !== undefined) {
          // renderAttributes(element, orderedAttributes, attributes, scope);
          renderAttributes(blueprint);
      }
      // ** Here we add the Element to the parentElement, if there is an Element.
      if (element !== undefined) {
          addElement(element, parentElement, parentChildBlueprints, blueprintIndex);
      }
      // ** Here we add the collection of Elements if there is a collection.
      if (collection !== undefined) {
          for (let x of collection) {
              renderBlueprints([x], parentElement, parentChildBlueprints, [blueprintIndex]);
          }
      }
      // ** Here we handle the children of this Element, if it has any.
      if (!!childBlueprints) {
          renderBlueprints(childBlueprints, element !== null && element !== void 0 ? element : parentElement);
      }
  };

  const refreshElementBlueprint = (blueprint, parentElement, options) => {
      /* Dev */
      // _DevLogger_("REFRESH", "ELEMENT", blueprint);
      const { element, collection, orderedAttributes, attributes, scope, childBlueprints, } = blueprint;
      const shouldReturn = resolveMAttributesOnRefresh(blueprint, parentElement, options);
      if (shouldReturn.condition) {
          return shouldReturn;
      }
      if (element !== undefined && !(element instanceof Text)) {
          refreshAttributes(element, orderedAttributes, attributes, scope);
      }
      if (!!collection) {
          refreshBlueprints(collection, options);
      }
      if (!!childBlueprints) {
          refreshBlueprints(childBlueprints, options);
      }
      return shouldReturn;
  };

  class MintElement extends MintNode {
      constructor(element, 
      // props: null | IProps = null,
      attributes = null, content) {
          super(content, generateElementBlueprint, renderElementBlueprint, refreshElementBlueprint);
          this.element = element;
          // this.props = props ?? {};
          this.attributes = attributes !== null && attributes !== void 0 ? attributes : {};
      }
      clone() {
          var _a;
          const content = [];
          for (let x of this.content) {
              content.push(cloneContent(x));
          }
          return new MintElement((_a = this.element) !== null && _a !== void 0 ? _a : "<>", 
          // Object.assign({}, this.props),
          Object.assign({}, this.attributes), content);
      }
  }

  function node(element, props = null, initialContent = null) {
      // export const node = <T extends Object>(
      //   element: string | MintComponent | MintTemplate,
      //   props: null | (T & IProps) = null,
      //   initialContent: null | TRawContent = null
      // ): CreateNode<T, MintElement | MintComponent | MintTemplate> => {
      // <@ REMOVE FOR PRODUCTION
      if (element === "<>" && props !== null) {
          const acceptableProps = ["mIf", "mFor", "mKey"];
          const keys = [];
          for (let x of Object.keys(props)) {
              if (!acceptableProps.includes(x))
                  keys.push(x);
          }
          if (keys.length > 0) {
              console.warn(`${MINT_WARN} Defining a Fragment with attributes i.e node("<>", { ${keys.join(", ")} }) means these attributes will be ignored on render.`);
          }
      }
      // @>
      let mintNode;
      const content = createMintText(initialContent);
      if (typeof element === "string") {
          mintNode = new MintElement(element, props, content);
      }
      else {
          mintNode = element;
          // (element as MintComponent)._children = content;
      }
      return new CreateNode(mintNode, props, content);
  }

  const externalRefreshBlueprint = (scopeOrBlueprintOrStore) => {
      let blueprint = undefined;
      const { _mintBlueprint } = scopeOrBlueprintOrStore;
      const { _component } = scopeOrBlueprintOrStore;
      // ** Passed a Blueprint directly
      if (scopeOrBlueprintOrStore instanceof Blueprint) {
          blueprint = scopeOrBlueprintOrStore;
      }
      // ** Passed IScope
      else if (!!_mintBlueprint) {
          blueprint = _mintBlueprint;
      }
      // ** Passed Store
      else if (_component !== undefined) {
          // ** If this Store is not currently connected to a Component then do nothing.
          if (_component === null) {
              return;
          }
          blueprint = _component._mintBlueprint;
      }
      // <@ REMOVE FOR PRODUCTION
      if (blueprint === undefined) {
          throw new Error(`${MINT_ERROR} refresh called using an invalid scope. Blueprint is undefined.`);
      }
      // @>
      if (currentlyTracking.updating(blueprint)) {
          console.warn(`${MINT_WARN} refresh() detected while still templating, refresh ignored.`);
          return;
      }
      currentlyTracking.addBlueprint(blueprint);
      refreshBlueprints([blueprint], { newlyInserted: false });
      currentlyTracking.removeBlueprint(blueprint);
  };
  const externalRefresh = (target) => {
      let arr = [];
      /* Dev */
      // _DevLogger_("REFRESH: ", "target", target);
      if (!(target instanceof Array)) {
          arr = [target];
      }
      else {
          arr = target;
      }
      for (let each of arr) {
          externalRefreshBlueprint(each);
      }
  };

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
              if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                  t[p[i]] = s[p[i]];
          }
      return t;
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  const generateMExtend = ({ extension, orderedProps, props, parentScope, scope, }) => {
      // ** Here we use the "mExtend" tool to extract an Object from the scope and extend the
      // ** attributes used in the Render of that Element.
      const _extension = typeof extension === "string" ? parentScope[extension] : extension;
      //<@ REMOVE FOR PRODUCTION
      if (!(_extension instanceof Object)) {
          throw new Error("Render -- Element -- mExtend -- Something other than an Object was set on mExtend.");
      }
      //@>
      // ** Set the values here.
      for (let [key, value] of Object.entries(_extension)) {
          //<@ REMOVE FOR PRODUCTION
          if (key === "mExtend") {
              throw new Error("Render -- Element -- mExtend -- Property of mExtend found on extension object. This will cause a cyclicular error.");
          }
          //@>
          orderedProps.push(key);
          props[key] = value;
      }
      assignProps(scope, Object.keys(_extension), _extension, parentScope);
      return {
          condition: false,
          value: undefined,
      };
  };

  class MintExtend extends MintAttribute {
      constructor(extension) {
          super(() => new MintExtend(extension));
          this.extension = extension;
          this.onGenerate = function (_a) {
              var args = __rest(_a, []);
              const { extension } = this;
              return generateMExtend(Object.assign({ extension }, args));
          };
      }
  }

  const mExtend = (extension) => {
      return { mExtend: new MintExtend(extension) };
  };

  class IfBlueprint extends Blueprint {
      constructor({ mintNode, orderedProps, props, scope, parentBlueprint, _rootScope, content, isSVG, }) {
          super({
              mintNode,
              scope,
              parentBlueprint,
              _rootScope,
          });
          this.orderedProps = orderedProps;
          this.props = props;
          this.content = content;
          if (!!isSVG)
              this.isSVG = isSVG;
          this._dev = "If";
      }
  }

  const generateMIf = ({ mIfInstance, _ifValue, node, orderedProps, props, parentScope, parentBlueprint, _rootScope, isSVG }) => {
      const { mintNode, content } = node;
      const mintElement = mintNode;
      // <@ REMOVE FOR PRODUCTION
      if (_ifValue.includes(" ")) {
          console.warn(`${MINT_WARN} mIf value defined with a space, this may be a mistake. Value: "${_ifValue}".`);
      }
      // @>
      if (mIfInstance._mIf !== undefined) {
          throw new Error("");
      }
      const inverse = _ifValue.charAt(0) === "!";
      const ifValue = inverse ? _ifValue.substring(1) : _ifValue;
      const result = !!resolvePropertyLookup(ifValue, parentScope);
      const state = inverse ? !result : !!result;
      mIfInstance._mIf = {
          inverse,
          ifValue,
          state,
          scope: parentScope,
          blueprinted: state,
          mintNode: mintNode
      };
      /* Dev */
      // _DevLogger_("GENERATE", "mIf", mIfInstance._mIf);
      if (mIfInstance._mIf.state === false) {
          mIfInstance.blueprint = new IfBlueprint({
              mintNode: mintElement,
              orderedProps,
              props: props !== null && props !== void 0 ? props : {},
              scope: parentScope,
              parentBlueprint,
              _rootScope,
              content,
              isSVG
          });
          /* Dev */
          // _DevLogger_("GENERATE", "mIf", that.blueprint, parentBlueprint);
          return { condition: true, value: mIfInstance.blueprint };
      }
      return { condition: false, value: undefined };
  };

  // ** This function takes a list of Blueprints and remove their content from
  // ** their parent HTMLElement.
  const removeList = (list) => {
      var _a;
      for (let x of list) {
          const { element, collection } = x;
          if (element !== undefined) {
              (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element);
          }
          if (collection !== undefined) {
              removeList(collection);
          }
      }
  };

  const resolveState = (mIf) => {
      const { ifValue, inverse, scope } = mIf;
      const result = resolvePropertyLookup(ifValue, scope);
      return inverse ? !result : !!result;
  };
  const fromFalseNotBlueprintedToTrue = (blueprint, parentElement, options) => {
      let newBlueprint = blueprint;
      const { mIf, newState, newlyInserted } = options;
      const ifBlueprint = blueprint;
      const { _rootScope } = blueprint;
      const { mintNode, parentBlueprint, scope, isSVG } = ifBlueprint;
      const cloneMintContent = new CreateNode(mintNode, ifBlueprint.props, ifBlueprint.content);
      [newBlueprint] = generateBlueprints({
          nodes: [cloneMintContent],
          scope,
          parentBlueprint,
          _rootScope,
          isSVG
      });
      // ** We need to replace this previous IfBlueprint as its not longer the correct context.
      if (parentBlueprint !== null) {
          // ** When not at root element
          const { childBlueprints, collection } = parentBlueprint;
          if (childBlueprints !== undefined) {
              // ** Child blueprints
              let index = -1;
              for (let [i, x] of childBlueprints.entries()) {
                  if (x === ifBlueprint) {
                      index = i;
                  }
              }
              childBlueprints.splice(index, 1, newBlueprint);
          }
          if (collection !== undefined) {
              // ** Collection
              let index = -1;
              for (let [i, x] of collection.entries()) {
                  if (x === ifBlueprint) {
                      index = i;
                  }
              }
              collection.splice(index, 1, newBlueprint);
          }
      }
      else {
          // ** When at root element.
          const { _rootChildBlueprints } = blueprint._rootScope;
          let index = -1;
          for (let [i, x] of _rootChildBlueprints.entries()) {
              if (x === ifBlueprint) {
                  index = i;
              }
          }
          _rootChildBlueprints.splice(index, 1, newBlueprint);
      }
      mIf.blueprinted = true;
      const { blueprintList, blueprintIndex } = getBlueprintIndex(newBlueprint);
      parentElement !== undefined && renderBlueprints([newBlueprint], parentElement, blueprintList, [blueprintIndex]);
      return { newState, newlyInserted };
  };
  const fromFalseToTrue = (blueprint, parentElement, parentBlueprintList, blueprintIndex) => {
      const { element, collection } = blueprint;
      if (element !== undefined) {
          addElement(element, parentElement, parentBlueprintList, blueprintIndex);
      }
      if (collection !== undefined) {
          for (let x of collection) {
              renderBlueprints([x], parentElement, parentBlueprintList, [blueprintIndex]);
          }
      }
  };
  const fromTrueToFalse = (blueprint) => {
      var _a;
      const { isComponent, scope } = blueprint;
      if (isComponent) {
          (_a = scope.onremove) === null || _a === void 0 ? void 0 : _a.call(scope, { scope });
      }
      removeList([blueprint]);
  };
  const stateShift = (blueprint, parentElement, parentBlueprintList, blueprintIndex, mIf) => {
      if (mIf === undefined)
          return {};
      const oldState = mIf.state;
      mIf.state = resolveState(mIf);
      const newState = mIf.state;
      let newlyInserted = false;
      /* Dev */
      // _DevLogger_("REFRESH", "mIf: ", mIf, oldState, newState);
      // ** Change in state -> Do something
      if (oldState !== newState) {
          // ** Is now TRUE
          if (newState === true) {
              newlyInserted = true;
              // ** WAS NOT previously rendered -> Add
              if (mIf.blueprinted === false) {
                  // ** WAS NOT previously blueprinted -> Blueprint first, then Add
                  return fromFalseNotBlueprintedToTrue(blueprint, parentElement, {
                      mIf,
                      newState,
                      newlyInserted
                  });
              }
              else {
                  // ** WAS previously blueprinted -> Add back
                  fromFalseToTrue(blueprint, parentElement, parentBlueprintList, blueprintIndex);
              }
          }
          // ** Is now FALSE
          else if (blueprint instanceof Blueprint) {
              // ** WAS previously rendered -> Remove
              fromTrueToFalse(blueprint);
          }
      }
      return { newState, newlyInserted };
  };
  const refreshMIf = (mIf, blueprint, parentElement, options) => {
      const { blueprintList: parentBlueprintList, blueprintIndex } = getBlueprintIndex(blueprint);
      const oldBlueprinted = mIf.blueprinted;
      const { newState, newlyInserted } = stateShift(blueprint, parentElement, parentBlueprintList, blueprintIndex, mIf);
      options.newlyInserted = newlyInserted !== null && newlyInserted !== void 0 ? newlyInserted : false;
      if (oldBlueprinted === false && newState === true) {
          return { condition: true, value: blueprint };
      }
      if (newState === false)
          return { condition: true, value: blueprint };
      return { condition: false, value: undefined };
  };

  const renderMIf = (blueprint, mIf) => {
      if (blueprint === null)
          return { condition: false, value: undefined };
      if (mIf.blueprinted === false && mIf.state === false) {
          return { condition: true, value: blueprint };
      }
      return { condition: false, value: undefined };
  };

  class MintIf extends MintAttribute {
      constructor(ifValue) {
          super(() => new MintIf(ifValue));
          this.onGenerate = function (_a) {
              var args = __rest(_a, []);
              const that = this;
              return generateMIf(Object.assign({ mIfInstance: that, _ifValue: ifValue }, args));
          };
          this.onRender = function (blueprint) {
              const { _mIf } = this;
              return renderMIf(blueprint, _mIf);
          };
          this.onRefresh = function (blueprint, parentElement, options) {
              const { _mIf } = this;
              return refreshMIf(_mIf, blueprint, parentElement, options);
          };
      }
  }

  const mIf = (ifValue) => {
      return { mIf: new MintIf(ifValue) };
  };

  //  ** Creates a function that will check against a property target and return if unique.
  const checkUniqueService = (key) => {
      // ** item is an item in arr and arr is the full list of items.
      // ** index is the index of item in arr.
      return (item, index, arr) => {
          // ** This is IMPORTANT
          // ** When using the index we ignore checking for uniqueness because it will always be unique.
          if (key === "_i")
              return true;
          const value = item[key];
          {
              for (let [i, x] of arr.entries()) {
                  // ** Find the first value on the arr that matches the provided value.
                  if (x[key] === value) {
                      // ** If they are at the same index then alls fine.
                      if (index === i) {
                          return true;
                      }
                      // ** If the indexes are wrong it means that there is another value with
                      // ** the same value and therefore a duplicate and this is not unique.
                      else {
                          return false;
                      }
                  }
              }
          }
          return false;
      };
  };

  /*
    This is a very important Function.
    When passing an Array of Objects to a mFor we need to go over the data of each
    Object and add the parent scope into the data.
    We do this by creating a new Object and adding the parent scope as the prototype.
    Importantly we then define the for each data using Object.defineProperty
    instead of newScope.property = value otherwise the parent would change instead,
    leaving the parent scope with the last Array property value and with each in the for
    using that property too.
  */
  const createForData = (data, scope, index) => {
      const Data = function _ForData() {
          this._x = data;
          this._i = index;
      };
      Data.prototype = scope;
      const newScope = new Data();
      if (data instanceof Object) {
          const entries = Object.entries(data);
          for (let [key, value] of entries) {
              Object.defineProperty(newScope, key, {
                  // ** Set the value
                  value,
                  // ** Can it be edited
                  writable: true,
                  // ** Will it be loopable e.g is shown in Object.entries
                  enumerable: true,
                  // ** Can it be deleted from this object
                  configurable: true,
              });
          }
      }
      return newScope;
  };

  const generatemForBlueprint = (nodeToClone, scope, orderedProps, props, _children, parentBlueprint, data, index, _rootScope, isSVG = false) => {
      var _a, _b;
      if (data instanceof Blueprint)
          return data;
      let newScope;
      if (!!nodeToClone.scope) {
          newScope = new ((_a = nodeToClone.scope) !== null && _a !== void 0 ? _a : MintScope)();
          assignProps(newScope, orderedProps, props, scope);
      }
      else {
          newScope = scope || new MintScope();
      }
      applyScopeTransformers(newScope);
      const _scope = createForData(data, newScope, index);
      if (!!nodeToClone.scope) {
          assignProps(newScope, orderedProps, props, _scope);
      }
      const mintElementClone = nodeToClone.clone();
      if (!!mintElementClone.attributes) {
          delete mintElementClone.attributes.mFor;
          delete mintElementClone.attributes.mKey;
          delete mintElementClone.attributes.mForType;
      }
      const cloneMintNode = new CreateNode(mintElementClone, (_b = mintElementClone.attributes) !== null && _b !== void 0 ? _b : null, _children);
      cloneMintNode.props = Object.assign({}, props);
      delete cloneMintNode.props.mFor;
      delete cloneMintNode.props.mKey;
      delete cloneMintNode.props.mForType;
      const [blueprint] = generateBlueprints({
          nodes: [cloneMintNode],
          scope: _scope,
          parentBlueprint,
          _rootScope,
          isSVG,
          useGivenScope: true,
      });
      return blueprint;
  };

  class ForBlueprint extends Blueprint {
      constructor({ 
      // mintNode,
      render, refresh, nodeToClone, fragment, orderedProps, props, scope, parentBlueprint, forListBlueprints, 
      // collection,
      _rootScope, isSVG, }) {
          super({ render, refresh, scope, parentBlueprint, _rootScope });
          this.nodeToClone = nodeToClone;
          if (!!fragment)
              this.fragment = fragment;
          this.orderedProps = orderedProps;
          this.props = props;
          this.forListBlueprints = forListBlueprints;
          // this.collection = collection;
          if (!!isSVG)
              this.isSVG = isSVG;
          this._dev = "For";
      }
  }

  var FOR_Type;
  (function (FOR_Type) {
      FOR_Type[FOR_Type["default"] = 0] = "default";
      FOR_Type[FOR_Type["match"] = 1] = "match";
  })(FOR_Type || (FOR_Type = {}));

  const recycleMForData = (currentScope, newData, newIndex) => {
      // ** Update the Object reference:
      // ** only if the Object has changed
      // ** AND only if _x is present already.
      if (currentScope.hasOwnProperty("_x") && currentScope._x !== newData) {
          currentScope._x = newData;
      }
      // ** Delete old values no longer on this new object;
      const currentScopeKeys = Object.keys(currentScope);
      for (let key of currentScopeKeys) {
          // ** Some properties are not changed once set.
          if (forScopePermantProperties.includes(key))
              continue;
          // ** We only want to try and delete properties that are on this object, not the prototype.
          if (!newData.hasOwnProperty(key)) {
              delete currentScope[key];
          }
      }
      if (typeof newData !== "string") {
          // ** Update or create values that weren't on Scope before.
          const newDataKeys = Object.keys(newData);
          for (let key of newDataKeys) {
              // ** This check is here not because we EXPECT these values to be on the new Object but because we DON'T EXPECT.
              // ** If they are here then they will break the Mint refresh causing untold misery to millions... and
              // ** as honest folk we can't possible allow that to happen!
              if (forScopePermantProperties.includes(key))
                  continue;
              currentScope[key] = newData[key];
          }
      }
      if (currentScope._i !== newIndex) {
          currentScope._i = newIndex;
      }
  };

  const moveElement = (element, index) => {
      const parentElement = element.parentElement;
      const before = Array.from(parentElement.children)[index];
      if (before === undefined) {
          parentElement.append(element);
      }
      else {
          parentElement.insertBefore(element, before);
      }
  };
  const matchElements = (currentRenders, oldList, newList, forKey) => {
      let stopped = false;
      for (let [i, x] of currentRenders.entries()) {
          if (stopped)
              return;
          if (x.element === undefined)
              return;
          let index = -1;
          for (let [i, y] of newList.entries()) {
              if (x.scope[forKey] === y[forKey]) {
                  index = i;
              }
          }
          if (index === undefined)
              return;
          if (i === index)
              return;
          if (index === -1) {
              console.warn(MINT_ERROR + "Unexpected mFor refresh error");
              return;
          }
          const [hold] = currentRenders.splice(i, 1);
          currentRenders.splice(index, 0, hold);
          stopped = true;
          const element = x.element;
          moveElement(element, index + 1);
          matchElements(currentRenders, oldList, newList, forKey);
      }
  };

  const handleErrorsAndWarnings = (blueprint, mFor) => {
      var _a, _b;
      const { nodeToClone, orderedProps, props, forListBlueprints, parentBlueprint, _rootScope, isSVG } = blueprint;
      const { blueprintIndex } = getBlueprintIndex(blueprint);
      const childBlueprints = (_a = parentBlueprint === null || parentBlueprint === void 0 ? void 0 : parentBlueprint.childBlueprints) !== null && _a !== void 0 ? _a : _rootScope._rootChildBlueprints;
      const parentScope = (_b = parentBlueprint === null || parentBlueprint === void 0 ? void 0 : parentBlueprint.scope) !== null && _b !== void 0 ? _b : _rootScope;
      const { forKey } = mFor;
      /* Dev */
      // _DevLogger_("REFRESH", "mFor: ", mFor);
      const protoForData = resolvePropertyLookup(mFor.forValue, parentScope);
      // <@ REMOVE FOR PRODUCTION
      if (!(protoForData instanceof Array) && protoForData !== undefined) {
          throw new Error(`${MINT_ERROR} Must pass in an Array or undefined to mFor (mFor: "${mFor.forValue}")`);
      }
      // @>
      // ** Here we run a check against the mKey to check there are no duplicates.
      // ** We only want to include one for each key match and ignore duplicates.
      const checkUnique = checkUniqueService(forKey);
      const cloneProtoForData = [...protoForData];
      const forData = [];
      for (let [i, x] of cloneProtoForData.entries()) {
          if (checkUnique(x, i, cloneProtoForData)) {
              forData.push(x);
          }
      }
      // ** Duplicates won't cause errors but we warn the user because its isn't expected.
      if (protoForData.length !== forData.length) {
          console.warn(`mFor -- duplicate elements detected. Only one instance will be rendered. Check mKey value. ${forKey}`);
      }
      const parentElement = getParentElement(blueprint);
      return {
          forKey,
          forData,
          blueprintIndex,
          parentElement,
          nodeToClone,
          orderedProps,
          props,
          parentScope,
          forListBlueprints,
          childBlueprints,
          parentBlueprint,
          _rootScope,
          isSVG
      };
  };
  const changeElementPosition = (forRender, requiredIndex, forRenders, allElements, options) => {
      const element = forRender.element;
      if (element === undefined)
          return;
      const { parentElement } = element;
      if (requiredIndex >= forRenders.length - 1) {
          addElement(element, options.parentElement, options.childBlueprints, options.blueprintIndex);
      }
      else {
          const targetElement = allElements[requiredIndex];
          parentElement === null || parentElement === void 0 ? void 0 : parentElement.insertBefore(element, targetElement);
      }
  };
  const rearrangeElements = (forRenders, options) => {
      const allElements = [];
      for (let x of [...options.parentElement.children]) {
          for (let y of forRenders) {
              if (y.element === x) {
                  allElements.push(x);
              }
          }
      }
      for (let [i, item] of forRenders.entries()) {
          const element = item.element;
          if (element === undefined) {
              continue;
          }
          const index = i;
          const locationIndex = allElements.indexOf(element);
          if (index !== locationIndex) {
              changeElementPosition(item, index, forRenders, allElements, options);
              rearrangeElements(forRenders, options);
              break;
          }
      }
  };
  const refreshMFor = (blueprint, { _mFor, newlyInserted }) => {
      var _a, _b, _c;
      const { forKey, forData, blueprintIndex, parentElement, nodeToClone, orderedProps, props, parentScope, parentBlueprint, forListBlueprints, childBlueprints, _rootScope, isSVG } = handleErrorsAndWarnings(blueprint, _mFor);
      _mFor.forData = forData;
      const newList = forData;
      _mFor.oldForDataLength = newList.length;
      /* Dev */
      // _DevLogger_("REFRESH", "mFor: ", forData);
      // ** New list
      const newCurrentForRenders = [];
      // ** Find if each new item already exists on current list of childBlueprints.
      // ** If not then add the scope only. That way we can check which are already blueprinted
      // ** and blueprint the ones that aren't later.
      for (let [i, item] of newList.entries()) {
          let newCurrentRender = undefined;
          for (let x of forListBlueprints) {
              const { scope } = x;
              if (scope === undefined)
                  continue;
              if (forKey === "_i") {
                  if (i === scope["_i"]) {
                      newCurrentRender = x;
                      break;
                  }
                  continue;
              }
              if (forKey === "_x") {
                  if (item === scope["_x"]) {
                      newCurrentRender = x;
                      break;
                  }
                  continue;
              }
              if (item[forKey] === scope[forKey]) {
                  newCurrentRender = x;
              }
          }
          newCurrentForRenders.push(newCurrentRender || item);
          i++;
      }
      // ** Here we take the newly sorted renders and make sure they are all Blueprints
      // ** if not already.
      const forRenders = [];
      for (let [i, x] of newCurrentForRenders.entries()) {
          if (x instanceof Blueprint) {
              forRenders.push(x);
          }
          else {
              forRenders.push(generatemForBlueprint(nodeToClone, parentScope, orderedProps, props, _mFor._children, parentBlueprint, x, i, _rootScope, isSVG));
          }
      }
      _mFor.currentForRenders = forRenders;
      if (_mFor.mForType === FOR_Type.match) {
          const oldList = [..._mFor.currentForRenders];
          matchElements(_mFor.currentForRenders, oldList, newList, forKey);
          for (let [i, { scope }] of _mFor.currentForRenders.entries()) {
              recycleMForData(scope, newList[i], i);
          }
      }
      else if (_mFor.mForType === FOR_Type.default) {
          for (let [i, { scope }] of _mFor.currentForRenders.entries()) {
              recycleMForData(scope, newList[i], i);
          }
      }
      // ** Cycle through old list and if its not on the new list then remove this element.
      for (let currentRender of forListBlueprints) {
          if (!newCurrentForRenders.includes(currentRender)) {
              if (!currentRender.fragment) {
                  const element = currentRender.element;
                  (_a = element === null || element === void 0 ? void 0 : element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element);
              }
              else {
                  const collection = currentRender.collection;
                  removeList(collection);
              }
          }
      }
      // ** Cycle through new list and if its not on the old list then add this element.
      for (let targetRender of forRenders) {
          if (!forListBlueprints.includes(targetRender)) {
              const element = targetRender.element;
              if (element !== undefined) {
                  addElement(element, parentElement, childBlueprints, blueprintIndex);
              }
          }
      }
      for (let targetRender of forRenders) {
          const { mintNode } = targetRender;
          if (mintNode === null)
              continue;
          if (!forListBlueprints.includes(targetRender)) {
              (_b = mintNode.render) === null || _b === void 0 ? void 0 : _b.call(mintNode, targetRender, parentElement, childBlueprints, blueprintIndex);
          }
          else {
              (_c = mintNode.refresh) === null || _c === void 0 ? void 0 : _c.call(mintNode, targetRender, parentElement, {
                  newlyInserted
              });
          }
      }
      // ** We need to make sure that things are kept in sync.
      // ** Here we tell the forListBlueprints about the new list of Blueprints, either added or removed.
      {
          forListBlueprints.length = 0;
          for (let x of forRenders) {
              forListBlueprints.push(x);
          }
      }
      rearrangeElements(forRenders, {
          childBlueprints,
          parentElement,
          blueprintIndex
      });
      return {
          condition: true,
          value: blueprint
      };
  };

  const createmForObject = ({ forKey, forValue, mForType, nodeToClone, _children, parentScope, orderedProps, props, parentBlueprint, _rootScope, isSVG }) => {
      const initialForData = resolvePropertyLookup(forValue, parentScope);
      if (!(initialForData instanceof Array) || initialForData === undefined) {
          throw new Error(`${MINT_ERROR} Must pass in an Array or undefined to mFor (mFor: "${forValue}")`);
      }
      // ** Here we run a check against the mKey to check there are no duplicates.
      // ** We only want to include one for each key match and ignore duplicates.
      const checkUnique = checkUniqueService(forKey);
      const cloneForData = [...initialForData];
      const forData = [];
      for (let [i, x] of cloneForData.entries()) {
          if (checkUnique(x, i, cloneForData)) {
              forData.push(x);
          }
      }
      // ** Duplicates won't cause errors but we warn the user because its isn't expected.
      if (initialForData.length !== forData.length) {
          console.warn(`mFor -- duplicate elements detected. Only one instance will be rendered. Check mKey value. ${forKey}`);
      }
      const currentForRenders = [];
      for (let [i, x] of forData.entries()) {
          currentForRenders.push(generatemForBlueprint(nodeToClone, parentScope, orderedProps, props, _children, parentBlueprint, x, i, _rootScope, isSVG));
      }
      return {
          forKey,
          forValue,
          nodeToClone,
          scope: parentScope,
          forData,
          currentForRenders,
          oldForDataLength: forData.length,
          mForType,
          _children
      };
  };
  const generateMFor = ({ mForInstance, forValue, node, orderedProps, props, _children, parentScope, parentBlueprint, _rootScope, isSVG }) => {
      var _a;
      const nodeToClone = node.mintNode;
      if (mForInstance.generated)
          return { condition: false };
      // <@ REMOVE FOR PRODUCTION
      {
          if (props.mKey === undefined) {
              console.error(nodeToClone);
              throw new Error(`${MINT_ERROR} mFor must have a mKey attribute`);
          }
      }
      // @>
      const forKey = props.mKey;
      // <@ REMOVE FOR PRODUCTION
      {
          if (forKey.includes(" ")) {
              console.warn(`${MINT_WARN} mKey value defined with a space, this may be a mistake. Value: "${forKey}".`);
          }
      }
      // @>
      // <@ REMOVE FOR PRODUCTION
      if (forValue.includes(" ")) {
          console.warn(`${MINT_WARN} mFor value defined with a space, this may be a mistake. Value: "${forValue}".`);
      }
      // @>
      mForInstance.generated = true;
      const mForType = (_a = props.mForType) !== null && _a !== void 0 ? _a : FOR_Type.default;
      // removeFromOrderedAttributes(orderedProps, props, [
      //   "mFor",
      //   "mKey",
      //   "mForType",
      // ]);
      mForInstance._mFor = createmForObject({
          forKey,
          forValue,
          mForType,
          nodeToClone: nodeToClone,
          _children,
          parentScope,
          orderedProps,
          props,
          parentBlueprint,
          _rootScope,
          isSVG
      });
      const forListBlueprints = mForInstance._mFor.currentForRenders;
      const runRefresh = (blueprint, options) => {
          // refreshBlueprints(blueprint.forListBlueprints);
          refreshMFor(blueprint, Object.assign({ _mFor: mForInstance._mFor }, options));
      };
      mForInstance.blueprint = new ForBlueprint({
          render: mForInstance.onRender,
          // refresh: mForInstance.onRefresh,
          refresh: runRefresh,
          nodeToClone: nodeToClone,
          orderedProps,
          props,
          scope: parentScope,
          parentBlueprint,
          _rootScope,
          forListBlueprints,
          // collection: collection as Array<Blueprint>,
          isSVG: isSVG || undefined
      });
      return {
          condition: true,
          value: mForInstance.blueprint
      };
  };

  const renderFor = (blueprint, childBlueprints, parentElement, blueprintIndex) => {
      // <@ REMOVE FOR PRODUCTION
      if (blueprint === null ||
          blueprint.forListBlueprints === null ||
          blueprint.forListBlueprints === undefined) {
          throw new Error(`${MINT_ERROR} Render - For - Wrong Blueprint sent to mFor.`);
      }
      // @>
      const { forListBlueprints } = blueprint;
      for (let x of forListBlueprints) {
          renderBlueprints([x], parentElement, childBlueprints, [blueprintIndex]);
      }
      return {
          condition: true,
          value: blueprint,
      };
  };

  class MintFor extends MintAttribute {
      constructor(forValue) {
          super((oldInstance) => {
              const newInstance = new MintFor(forValue);
              newInstance._mFor = oldInstance._mFor;
              newInstance.generated = oldInstance.generated;
              newInstance.blueprint = oldInstance.blueprint;
              return newInstance;
          });
          this.generated = false;
          this.onGenerate = function (_a) {
              var args = __rest(_a, []);
              const that = this;
              return generateMFor(Object.assign({ mForInstance: that, forValue }, args));
          };
          this.onRender = function (blueprint, parentElement, parentChildBlueprints, blueprintIndex) {
              /* DEV */
              // _DevLogger_("RENDER", "FOR", blueprint, this);
              const that = this;
              if (that.blueprint !== blueprint) {
                  throw new Error("This is an unexpected error");
              }
              return renderFor(that.blueprint, parentChildBlueprints, parentElement, blueprintIndex);
          };
          this.onRefresh = function (_, __, options) {
              const that = this;
              refreshMFor(that.blueprint, Object.assign({ _mFor: that._mFor }, options));
              return { condition: false };
          };
      }
  }

  const mFor = (forValue) => {
      return { mFor: new MintFor(forValue) };
  };

  class UpwardRef {
      constructor(ref = null) {
          this.ref = ref;
      }
  }

  const generateMRef = ({ refValue, htmlElement, parentScope, scope, isAttribute }) => {
      const value = resolvePropertyLookup(refValue, parentScope);
      // ** Here we check if the ref is UpwardRef.
      // ** This is a pattern where we don't manipulate the parentScope directly.
      // ** This means we can pass the property down to children.
      if (value instanceof UpwardRef) {
          value.ref = htmlElement;
      }
      else {
          const _scope = isAttribute ? scope : parentScope;
          _scope[refValue] = htmlElement;
          if (!!_scope._store) {
              if (_scope._store.hasOwnProperty(refValue)) {
                  _scope._store[refValue] = htmlElement;
              }
              // <@ REMOVE FOR PRODUCTION
              else {
                  console.warn(`${MINT_WARN} tried to add property "${refValue}" using mRef to store "${_scope._store.constructor.name}" which does not have this property.`);
              }
              // @>
          }
      }
      return {
          condition: false,
          value: undefined,
      };
  };

  class MintRef extends MintAttribute {
      constructor(refValue) {
          super(() => new MintRef(refValue));
          this.onGenerate = (_a) => {
              var args = __rest(_a, []);
              return generateMRef(Object.assign({ refValue }, args));
          };
      }
  }

  const mRef = (refValue) => {
      return { mRef: new MintRef(refValue) };
  };

  class Store {
      constructor(initialData) {
          if (!(initialData instanceof Object)) {
              throw "You must provide an Object to create a new Store.";
          }
          const entries = Object.entries(initialData);
          for (let [key, value] of entries) {
              if (value instanceof ScopeTransformer) {
                  value.transform(this, key);
              }
              else {
                  this[key] = value;
              }
          }
          this._component = null;
          this._keys = Object.keys(initialData);
          this._data = initialData;
          Object.seal(this);
      }
      connect(scope) {
          this._component = scope;
          scope._store = this;
          for (let key of this._keys) {
              const value = this._data[key];
              if (value instanceof ScopeTransformer) {
                  value.transform(scope, key);
              }
              else {
                  Object.defineProperty(scope, key, {
                      get: () => this[key],
                      set: (_value) => (this[key] = _value),
                  });
              }
          }
      }
  }

  const _get = (target, value) => {
      let output = target;
      const trail = value.split(".");
      while (trail.length > 0) {
          const [property] = trail;
          output = output[property];
          trail.shift();
      }
      return output;
  };
  class Resolver extends ScopeTransformer {
      constructor(callback) {
          super((scope, key) => {
              Object.defineProperty(scope, key, {
                  get: this.callback
              });
          });
          if (callback instanceof Function) {
              this.callback = callback;
          }
          else {
              this.callback = function () {
                  return _get(this, callback);
              };
          }
      }
  }

  const quickElement = (name, attributesOrInitialContent, initialContent) => {
      let attributes = null;
      let content;
      // ** If initialContent is defined then we used all arguments.
      if (initialContent !== undefined) {
          attributes = attributesOrInitialContent;
          content = initialContent;
      }
      // ** If the attributesOrInitialContent is not an Object (not an Array) then this must be attributes only.
      else if (typeof attributesOrInitialContent !== "string" &&
          !(attributesOrInitialContent instanceof Array) &&
          !(attributesOrInitialContent instanceof CreateNode)) {
          attributes = attributesOrInitialContent;
      }
      // ** Otherwise we know that the second argument is the content and that
      // ** attributes should be null.
      else {
          attributes = null;
          content = attributesOrInitialContent;
      }
      return node(name, attributes, content);
  };

  const span = (attributesOrContent, _content) => {
      return quickElement("span", attributesOrContent, _content);
  };

  const div = (attributesOrContent, _content) => {
      return quickElement("div", attributesOrContent, _content);
  };

  class ButtonComponent$1 extends MintScope {
      constructor() {
          super();
          this.type = "button";
          this.theme = "snow";
          this.class = "";
          this.style = undefined;
          this.content = undefined;
          this.id = undefined;
          this.classes = new Resolver(function () {
              if (this.hasExtraButtonLabel)
                  return `${this.class} multi-content`;
              return this.class;
          });
          this.hasIcon = new Resolver(function () {
              return this.icon !== undefined;
          });
          this.hasLabel = new Resolver(function () {
              return this.label !== undefined;
          });
          this.isSquare = new Resolver(function () {
              return this.square ? "square" : "";
          });
          this.isLarge = new Resolver(function () {
              return this.large ? "large" : "";
          });
          this.hasExtraButtonLabel = new Resolver(function () {
              return (this.extraButtonLabel !== null && this.extraButtonLabel !== undefined);
          });
          this.getExtraButtonLabel = function () {
              return this.extraButtonLabel;
          };
          this.getContent = function () {
              return this.content;
          };
          this.onClick = null;
      }
  }
  const Button$1 = component("button", ButtonComponent$1, {
      "[type]": "type",
      class: "{theme} {classes} {isSquare} {isLarge}",
      "[style]": "style",
      "[title]": "title",
      "[id]": "id",
      "(click)": "onClick",
      mRef: mRef("ref"),
  }, [
      node("<>", Object.assign({}, mIf("!_children")), [
          node("<>", Object.assign({}, mIf("!content")), [
              node("span", { mIf: mIf("hasIcon"), class: "icon fa fa-{icon}" }),
              node("span", { mIf: mIf("hasLabel"), class: "label" }, "{label}"),
              node("span", { mIf: mIf("hasExtraButtonLabel"), class: "extra-content" }, node(template("getExtraButtonLabel"))),
          ]),
          node("<>", Object.assign({}, mIf("content")), node(template("getContent"))),
      ]),
      node("<>", Object.assign({}, mIf("_children")), "_children"),
  ]);

  class ColourSelectorComponent$2 extends MintScope {
      constructor() {
          super();
          this.onInput = null;
          this.colourSelectorScope = this;
          this.showColours = false;
          this.colours = [
              "black",
              "green",
              "lightgreen",
              "blue",
              "lightblue",
              "grey",
              "lightgrey",
              "#444",
              "pink",
              "teal",
              "aqua",
              "red",
              "tomato",
              "purple",
          ];
          this.toggleShowColours = function () {
              this.colourSelectorScope.showColours =
                  !this.colourSelectorScope.showColours;
              externalRefresh(this.colourSelectorScope);
          };
          this.chooseColour = function () {
              var _a;
              (_a = this.onInput) === null || _a === void 0 ? void 0 : _a.call(this, this._x);
              this.colourSelectorScope.showColours = false;
              externalRefresh(this.colourSelectorScope);
          };
      }
  }
  component("div", ColourSelectorComponent$2, { class: "relative z-index" }, [
      node(Button$1, {
          "[large]": "large",
          square: true,
          content: node("span", null, "C"),
          "[colourSelectorScope]": "colourSelectorScope",
          "[onClick]": "toggleShowColours",
      }),
      node("ul", Object.assign(Object.assign({}, mIf("showColours")), { class: "list flex absolute left-gap", style: "top: 2rem; width: 100px;" }), node("li", Object.assign(Object.assign({}, mFor("colours")), { mKey: "_i", class: "width height snow-border pointer", style: "background-color: {_x};", "(click)": "chooseColour" }))),
  ]);

  class FieldInputComponent$1 extends MintScope {
      constructor() {
          super();
          this.type = "text";
          this.class = "";
          this.style = "";
          // this.onKeyDown = null;
          this.onInput = null;
          // this.onFocus = null;
          // this.onBlur = null;
          this.extendField = {};
          this._labelClass = new Resolver(function () {
              var _a;
              return ((_a = this.labelClass) !== null && _a !== void 0 ? _a : "") + (this.large ? " large" : "");
          });
          this._inputClass = new Resolver(function () {
              return this.class + (this.large ? " large" : "");
          });
          this.isRequired = new Resolver(function () {
              return this.required ? "required" : "";
          });
          this.hasLabelAbove = new Resolver(function () {
              return !!this.label && !this.labelBeside;
          });
          this.hasLabelBeside = new Resolver(function () {
              return !!this.label && !!this.labelBeside;
          });
      }
  }
  const FieldInput$1 = component("label", FieldInputComponent$1, { class: "{_labelClass} {isRequired}", "[style]": "labelStyles" }, [
      node("span", { mIf: mIf("hasLabelAbove") }, "{label}"),
      node("input", Object.assign(Object.assign({ "[type]": "type", "[name]": "name", "[value]": "value", "[checked]": "checked", "[class]": "_inputClass", "[style]": "style", "[placeholder]": "placeholder", "[required]": "required", "[readonly]": "readonly", "[id]": "id", 
          // "(keydown)": "onKeyDown",
          "(input)": "onInput" }, mExtend("extendField")), mRef("ref"))),
      node("span", { mIf: mIf("hasLabelBeside") }, "{label}"),
  ]);

  const FieldCheckbox$1 = component("div", null, null, node(FieldInput$1, {
      type: "checkbox",
      "[name]": "name",
      "[value]": "value",
      "[checked]": "checked",
      "[label]": "label",
      labelBeside: true,
      "[labelClass]": "labelClass",
      "[class]": "inputClass",
      "[large]": "large",
      "[style]": "style",
      "[required]": "required",
      "[readonly]": "readonly",
      "[id]": "id",
      "[onInput]": "onInput",
      "[ref]": "ref",
  }));

  const FieldRadio$1 = component("div", null, null, node(FieldInput$1, {
      type: "radio",
      "[name]": "name",
      "[value]": "value",
      "[checked]": "checked",
      "[label]": "label",
      labelBeside: true,
      "[labelClass]": "labelClass",
      "[labelStyles]": "labelStyles",
      "[class]": "inputClass",
      "[style]": "style",
      "[required]": "required",
      "[readonly]": "readonly",
      "[onInput]": "onInput",
      "[ref]": "ref",
  }));

  class FieldSelectComponent$1 extends MintScope {
      constructor() {
          super();
          this.class = "";
          this.style = "";
          this.options = [];
          this.onInput = null;
          this.hasLabel = new Resolver(function () {
              return !!this.label;
          });
      }
  }
  const FieldSelect$1 = component("label", FieldSelectComponent$1, { class: "{labelClass} {isRequired}" }, [
      node("span", { mIf: mIf("hasLabel") }, "{label}"),
      node("select", {
          "[name]": "name",
          "[value]": "value",
          "[class]": "class",
          "[style]": "style",
          "[required]": "required",
          "[readonly]": "readonly",
          "[id]": "id",
          "(input)": "onInput",
          mRef: mRef("ref"),
      }, [
          node("option", {
              mFor: mFor("options"),
              mKey: "value",
              "[value]": "value",
          }, "{name}"),
      ]),
  ]);

  class FieldFieldsetComponent$1 extends MintScope {
      constructor() {
          super();
          this.legend = "";
          this.value = null;
          this.options = [];
          this.isChecked = new Resolver(function () {
              return this.value === this.fieldValue;
          });
          this.fieldValue = new Resolver(() => this.value);
          this.onInput = null;
      }
  }
  const FieldFieldset$1 = component("fieldset", FieldFieldsetComponent$1, { "[id]": "id" }, [
      node("legend", { mIf: mIf("legend"), class: "fieldset__legend" }, "{legend}"),
      node("ul", { class: "list flex" }, node("li", { mFor: mFor("options"), mKey: "value", class: "margin-right-small" }, node(FieldRadio$1, {
          "[name]": "name",
          "[value]": "value",
          "[label]": "label",
          "[class]": "class",
          "[labelClass]": "labelClass",
          "[labelStyles]": "labelStyles",
          "[style]": "style",
          "[checked]": "isChecked",
          "[onInput]": "onInput",
      }))),
  ]);

  class FieldTextareaComponent$1 extends MintScope {
      constructor() {
          super();
          this.class = "";
          this.style = "";
          this.resize = false;
          this.onInput = null;
          this.hasLabel = new Resolver(function () {
              return !!this.label;
          });
          this.getStyles = new Resolver(function () {
              return (this.resize ? "" : "resize: none; ") + this.style;
          });
          this.getReadonly = new Resolver(function () {
              return this.readonly ? "true" : undefined;
          });
      }
  }
  const FieldTextarea$1 = component("label", FieldTextareaComponent$1, { class: "{labelClass} {isRequired}" }, [
      node("span", { mIf: mIf("hasLabel") }, "{label}"),
      node("textarea", Object.assign(Object.assign({ "[name]": "name", "[value]": "value", "[class]": "class", "[placeholder]": "placeholder", "[style]": "getStyles", "[readonly]": "getReadonly", "[id]": "id", "(input)": "onInput" }, mExtend("extendField")), { mRef: mRef("ref") })),
  ]);

  const passProps$1 = {
      "[type]": "type",
      "[name]": "name",
      "[value]": "value",
      "[checked]": "checked",
      "[label]": "label",
      "[legend]": "legend",
      "[labelBeside]": "labelBeside",
      "[labelClass]": "labelClass",
      "[labelStyles]": "labelStyles",
      "[class]": "class",
      "[style]": "style",
      "[large]": "large",
      "[required]": "required",
      "[readonly]": "readonly",
      "[id]": "id",
      // "[onKeyDown]": "onKeyDown",
      "[onInput]": "onInput",
      // "[onFocus]": "onFocus",
      // "[onBlur]": "onBlur",
      "[extendField]": "extendField",
      "[ref]": "ref",
  };
  class FieldComponent$1 extends MintScope {
      constructor() {
          super();
          this.type = "text";
          this.class = "";
          this.style = undefined;
          this.onKeyDown = null;
          this.onInput = null;
          this.onFocus = null;
          this.onBlur = null;
          this.extendScope = {};
          this.extendField = {};
          this.ref = null;
          this.isInput = new Resolver(function () {
              const inValidTypes = [
                  "textarea",
                  "select",
                  "checkbox",
                  "radio",
                  "fieldset",
              ];
              return !inValidTypes.includes(this.type);
          });
          this.isCheckbox = new Resolver(function () {
              return this.type === "checkbox";
          });
          this.isRadio = new Resolver(function () {
              return this.type === "radio";
          });
          this.isFieldSet = new Resolver(function () {
              return this.type === "fieldset";
          });
          this.isSelect = new Resolver(function () {
              return this.type === "select";
          });
          this.isTextarea = new Resolver(function () {
              return this.type === "textarea";
          });
      }
  }
  component("<>", FieldComponent$1, { "[class]": "wrapperClasses" }, [
      node(FieldInput$1, Object.assign(Object.assign({ mIf: mIf("isInput") }, mExtend("extendScope")), passProps$1)),
      node(FieldCheckbox$1, Object.assign(Object.assign({ mIf: mIf("isCheckbox") }, mExtend("extendScope")), passProps$1)),
      node(FieldRadio$1, Object.assign(Object.assign({ mIf: mIf("isRadio") }, mExtend("extendScope")), passProps$1)),
      node(FieldFieldset$1, Object.assign(Object.assign(Object.assign({ mIf: mIf("isFieldSet") }, mExtend("extendScope")), passProps$1), { "[options]": "options" })),
      node(FieldTextarea$1, Object.assign(Object.assign(Object.assign({ mIf: mIf("isTextarea") }, mExtend("extendScope")), passProps$1), { "[resize]": "resize" })),
      node(FieldSelect$1, Object.assign(Object.assign(Object.assign({ mIf: mIf("isSelect") }, mExtend("extendScope")), passProps$1), { "[options]": "options" })),
  ]);

  class ModalComponent$1 extends MintScope {
      constructor() {
          super();
          this.state = "";
          this.theme = "smoke";
          this.class = "";
          this.style = "";
          this.hasTitle = new Resolver(function () {
              return this.title !== undefined;
          });
          this.clickOnBackground = function () {
              if (this.closeOnBackgroundClick instanceof Function) {
                  this.closeOnBackgroundClick();
              }
              // if (!(this.closeOnBackgroundClick instanceof Function)) return;
              // if (this._store instanceof Store && typeof this.storeTarget === "string") {
              //   closeModal(this._store, this.storeTarget);
              // } else {
              //   closeModal(this, "state");
              // }
          };
          this.clickOnContent = function (event) {
              if (this.closeOnBackgroundClick instanceof Function) {
                  event.stopPropagation();
              }
          };
      }
  }
  component("article", ModalComponent$1, { class: "modal {state}", "(click)": "clickOnBackground" }, node("div", { class: "modal__content {class}", "[style]": "style", "(click)": "clickOnContent" }, [
      node("header", { mIf: mIf("hasTitle"), class: "modal__header {theme}" }, node("h2", null, "{title}")),
      "_children"
  ]));

  const exact$1 = (target, hash) => {
      return target === hash;
  };
  const contains$1 = (target, hash) => {
      return hash.includes(target);
  };
  const hasWord$1 = (target, hash) => {
      return (hash.includes(` ${hash} `) ||
          exact$1(target, hash) ||
          starts$1(target + " ", hash) ||
          ends$1(" " + target, hash));
  };
  const containsAndHyphen$1 = (target, hash) => {
      return target === hash || hash.includes(target + "-");
  };
  const starts$1 = (target, hash) => {
      return hash.slice(0, target.length) === target;
  };
  const ends$1 = (target, hash) => {
      return hash.slice(hash.length - target.length) === target;
  };

  var RouteType$1;
  (function (RouteType) {
      RouteType["exact"] = "exact";
      RouteType["="] = "=";
      RouteType["contains"] = "contains";
      RouteType["*"] = "*";
      RouteType["hasWord"] = "hasWord";
      RouteType["~"] = "~";
      RouteType["containsAndHyphen"] = "containsAndHyphen";
      RouteType["|"] = "|";
      RouteType["starts"] = "starts";
      RouteType["^"] = "^";
      RouteType["ends"] = "ends";
      RouteType["$"] = "$";
  })(RouteType$1 || (RouteType$1 = {}));

  const logic$1 = {
      [RouteType$1.exact]: exact$1,
      [RouteType$1["="]]: exact$1,
      [RouteType$1.contains]: contains$1,
      [RouteType$1["*"]]: contains$1,
      [RouteType$1.hasWord]: hasWord$1,
      [RouteType$1["~"]]: hasWord$1,
      [RouteType$1.containsAndHyphen]: containsAndHyphen$1,
      [RouteType$1["|"]]: containsAndHyphen$1,
      [RouteType$1.starts]: starts$1,
      [RouteType$1["^"]]: starts$1,
      [RouteType$1.ends]: ends$1,
      [RouteType$1["$"]]: ends$1,
  };
  class RouterComponent$1 extends MintScope {
      constructor() {
          super();
          this.routes = [];
          this.oninit = function () {
              var _a;
              (_a = this.onDefine) === null || _a === void 0 ? void 0 : _a.call(this, this);
          };
          this.router = function () {
              const routes = this.routes;
              const hash = window.location.hash.replace("#", "").replace(/%20/g, " ");
              {
                  let i = 0;
                  while (i < routes.length) {
                      const route = routes[i];
                      if (logic$1[route.type](route.target, hash))
                          return route.content;
                      i++;
                  }
              }
              return [];
          };
      }
  }
  const Router = component("<>", RouterComponent$1, {}, [
      node(template("router")),
  ]);

  class TabsComponent$1 extends MintScope {
      constructor() {
          super();
          const scope = this;
          this.tabs = [];
          this.currentTab = null;
          this.currentTemplate = new Resolver(function () {
              return this.currentTab.template;
          });
          this.tabSelected = new Resolver(function () {
              return this.currentTab !== null;
          });
          this.activeTab = new Resolver(function () {
              return this._x === this.currentTab ? "active" : "";
          });
          this.onpreblueprint = function () {
              if (this.tabs.length === 0)
                  return;
              if (this.currentTab !== null)
                  return;
              this.currentTab = this.tabs[0];
          };
          this.selectTab = function () {
              var _a;
              scope.currentTab = this._x;
              (_a = scope.onSelectTab) === null || _a === void 0 ? void 0 : _a.call(scope);
              externalRefresh(scope);
          };
      }
  }
  component("div", TabsComponent$1, { class: "tabs", mRef: mRef("ref") }, [
      node("ul", { class: "tabs__list" }, node("li", {
          mFor: mFor("tabs"),
          mKey: "name",
          class: "tabs__list-item {activeTab}",
          "(click)": "selectTab",
      }, node("div", null, "{name}"))),
      node("div", { mIf: mIf("tabSelected"), class: "tabs__body" }, node(template({ onevery: true }, "currentTemplate"))),
  ]);

  class TableComponent$1 extends MintScope {
      constructor() {
          super();
          this.columns = [];
          this.rows = [];
      }
  }
  component("table", TableComponent$1, { class: "table" }, [
      node("thead", null, node("tr", null, node("th", Object.assign(Object.assign({}, mFor("columns")), { mKey: "id" }), "{title}"))),
      node("tbody", null, node("tr", Object.assign(Object.assign({}, mFor("rows")), { mKey: "id" }), node("td", Object.assign(Object.assign({}, mFor("columns")), { mKey: "id" }), "{cell}"))),
  ]);

  class Route {
      constructor(targetOrOptions, content) {
          if (typeof targetOrOptions === "string") {
              this.target = targetOrOptions;
              this.type = RouteType$1.exact;
          }
          else {
              this.target = targetOrOptions.target;
              this.type = targetOrOptions.type;
          }
          this.content = content;
      }
  }

  const lineProps = {
      y1: "4",
      y2: "28",
  };
  class HeaderComponent extends MintScope {
      constructor() {
          super();
          this.headerTitle = "Oregano";
          this.version = "";
      }
  }
  const Header = component("header", HeaderComponent, { class: "header" }, [
      node("h1", null, [span("{headerTitle}"), span("v{version}")]),
      node("div", { class: "flex" }, [
          node("button", {
              type: "button",
              class: "empty snow-text font-size",
          }, node("span", {
              class: "block absolute middle width-small height",
          })),
          node("button", {
              type: "button",
              class: "empty",
          }, node("svg", {
              class: "absolute middle width height",
              viewBox: "0 0 32 32",
          }, [
              node("line", Object.assign({ x1: "4", x2: "28" }, lineProps)),
              node("line", Object.assign({ x1: "28", x2: "4" }, lineProps)),
          ])),
      ]),
  ]);

  const oreganoSettings = {
      sessionStorageKey: "",
      breadcrumbs: false,
  };

  class AppStore extends Store {
      constructor() {
          super({
              rootData: null,
              currentItem: null,
              sessionStorageKey: new Resolver(() => oreganoSettings.sessionStorageKey),
              loaded: false,
              currentTitle: new Resolver(function () {
                  var _a;
                  return (_a = appStore.currentItem) === null || _a === void 0 ? void 0 : _a.title;
              }),
          });
      }
  }
  const appStore = new AppStore();

  class ContentComponent extends MintScope {
      constructor() {
          super();
          this.loaded = new Resolver(() => appStore.loaded);
      }
  }
  const Content = component("div", ContentComponent, {
      class: "main-content",
  }, "_children");

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __awaiter$1(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  const path = {
      get url() {
          return this.get().join("/");
      },
      get() {
          return window.location.hash
              .replace(/(%20)/g, " ")
              .slice(1)
              .split("/")
              .filter((x) => x !== "");
      },
      set(url) {
          window.location.hash = url.join("/");
      },
  };

  const wait = (time = 0) => new Promise((resolve) => {
      setTimeout(() => {
          resolve();
      }, time);
  });

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  const time = 300;
  const timeToWait = 3000;

  class Toaster {
      constructor(target = document.body) {
          this.toast = (message, options, alternateElementTarget) => __awaiter(this, void 0, void 0, function* () {
              var _a;
              const _previousTarget = this.target;
              if (alternateElementTarget !== undefined) {
                  this.target = alternateElementTarget;
              }
              const theme = typeof options === "string" ? options : (_a = options === null || options === void 0 ? void 0 : options.theme) !== null && _a !== void 0 ? _a : "blueberry";
              const { hasButton, clickToClose, linger, classes, buttonClasses } = typeof options === "string" ? {} : options;
              if (this.toasts.length === 0) {
                  this.mountToastContainer();
              }
              this.target = _previousTarget;
              const toast = { element: document.createElement("div") };
              toast.element.classList.add("toast", `toast__${theme}`, ...(classes || []));
              const toastMessageSpan = document.createElement("span");
              toastMessageSpan.textContent = message;
              const toastMessageButton = document.createElement("button");
              toastMessageButton.classList.add("toast__button", "empty", ...(buttonClasses || []));
              {
                  const buttonSpan = document.createElement("span");
                  buttonSpan.classList.add("fa", "fa-times");
                  toastMessageButton.append(buttonSpan);
              }
              const remove = () => __awaiter(this, void 0, void 0, function* () {
                  var _b, _c;
                  delete toast.remove;
                  if (clickToClose === true) {
                      toast.element.removeEventListener("click", remove);
                  }
                  toastMessageButton.removeEventListener("click", remove);
                  toast.element.classList.add("fade-out");
                  yield wait(time);
                  (_b = toast.element.parentElement) === null || _b === void 0 ? void 0 : _b.removeChild(toast.element);
                  this.toasts.splice(this.toasts.indexOf(toast, 1));
                  if (this.toasts.length == 0) {
                      this.index = 0;
                      (_c = this.toastContainer.parentElement) === null || _c === void 0 ? void 0 : _c.removeChild(this.toastContainer);
                  }
              });
              toast.remove = remove;
              if (clickToClose === true) {
                  toast.element.addEventListener("click", remove);
              }
              toastMessageButton.addEventListener("click", remove);
              toast.element.append(toastMessageSpan);
              if (hasButton === undefined) {
                  toast.element.append(toastMessageButton);
              }
              this.toastContainer.append(toast.element);
              this.toasts.push(toast);
              this.index++;
              const _timeToWait = typeof linger !== "number"
                  ? timeToWait
                  : (() => {
                      // ** TS should accept a number as an argument here but....... you know!
                      if (linger < 0 || parseInt(linger + "") !== linger) {
                          console.error("Must provide a positive integer for the property 'linger'.");
                          return timeToWait;
                      }
                      return linger;
                  })();
              yield wait(_timeToWait);
              remove();
          });
          this.index = 0;
          this.toasts = [];
          this.target = target;
          {
              const toastContainer = document.createElement("div");
              toastContainer.classList.add("toast-container");
              this.toastContainer = toastContainer;
          }
      }
      getToastIndex(index) {
          return `toast--piece--${index}`;
      }
      mountToastContainer() {
          this.target.append(this.toastContainer);
      }
  }
  const toaster = new Toaster(document.body);
  const toast = (message, theme = "blueberry", alternateElementTarget) => toaster.toast(message, theme, alternateElementTarget);

  const resolveLeadingZeroes$1 = (item) => {
      if (typeof item === "number") {
          if (item < 10)
              return "0" + item;
          return "" + item;
      }
      else {
          if (item.length === 1)
              return "0" + item;
          return item;
      }
  };
  const dateMap = new Map();
  dateMap.set("dd/mm/yyyy", ({ d, m, y }) => `${resolveLeadingZeroes$1(d)}/${resolveLeadingZeroes$1(m)}/${y}`);
  dateMap.set("dd/mm/yyyy hh:mm", ({ d, m, y, h, min }) => `${resolveLeadingZeroes$1(d)}/${resolveLeadingZeroes$1(m)}/${y} ${resolveLeadingZeroes$1(h)}:${resolveLeadingZeroes$1(min)}`);
  dateMap.set("yyyy-mm-dd", ({ d, m, y }) => `${y}-${resolveLeadingZeroes$1(m)}-${resolveLeadingZeroes$1(d)}`);
  dateMap.set("dd-mm-yyyy", ({ d, m, y }) => `${resolveLeadingZeroes$1(d)}-${resolveLeadingZeroes$1(m)}-${y}`);
  dateMap.set("dd-mm-yyyy hh:mm", ({ d, m, y, h, min }) => `${resolveLeadingZeroes$1(d)}-${resolveLeadingZeroes$1(m)}-${y} ${resolveLeadingZeroes$1(h)}:${resolveLeadingZeroes$1(min)}`);
  const getDate = (date = new Date(), type = "dd/mm/yyyy") => {
      const [d, m, y, h, min] = [
          date.getDate(),
          date.getMonth() + 1,
          date.getFullYear(),
          date.getHours(),
          date.getMinutes(),
      ];
      const output = dateMap.get(type);
      if (output === undefined) {
          return null;
      }
      return output({ d, m, y, h, min });
  };

  const styles = (obj) => {
      return Object.entries(obj)
          .filter(([key, value]) => key !== undefined && value !== undefined)
          .map(([key, value]) => `${key}: ${value}`)
          .join("; ");
  };

  const changePage = (page) => {
      path.set([page, ...path.get().slice(1)]);
  };

  class Action {
      constructor(type, value) {
          this.type = type;
          this.value = value;
      }
  }

  class ActionStore extends Store {
      constructor() {
          super({
              getTheme: new Resolver(function () {
                  return this.active ? "blueberry" : "snow";
              }),
          });
      }
  }
  const actionStore = new ActionStore();

  class ActionButton {
      constructor({ label, icon, title, square = true, id }, action) {
          this.label = label;
          this.icon = icon;
          this.title = title;
          this.square = square;
          this.action = action;
          this.onClick = function () {
              const buttonScope = this;
              const actionButton = actionButtons.find(({ id }) => id === buttonScope.id);
              actionButton.active = !actionButton.active;
              externalRefresh(actionStore);
          };
          this.id = id;
          this.active = false;
      }
  }

  var ActionTypes;
  (function (ActionTypes) {
      ActionTypes[ActionTypes["init"] = 0] = "init";
      ActionTypes[ActionTypes["add-to-list"] = 1] = "add-to-list";
      ActionTypes[ActionTypes["style"] = 2] = "style";
  })(ActionTypes || (ActionTypes = {}));

  const actionButtons = [
      new ActionButton({
          icon: "clone",
          label: "M",
          title: "Message to side",
          square: false,
          id: "message-to-side",
      }),
      new ActionButton({
          icon: "sort-numeric-desc",
          title: "Items added to top",
          id: "list-order",
      }, new Action(ActionTypes["add-to-list"], (currentItem, newItem) => {
          currentItem.items.unshift(newItem);
      })),
      // new ActionButton(
      //   {
      //     icon: "level-up",
      //     title: "Large font size",
      //     id: "large-font",
      //   },
      //   new Action(ActionTypes.style, "font-size: 1.5rem;")
      // ),
      // new ActionButton(
      //   {
      //     label: "B",
      //     title: "Bold font",
      //     id: "bold-font",
      //   },
      //   new Action(ActionTypes.style, "font-weight: bold;")
      // ),
      new ActionButton({
          icon: "line-chart",
          title: "Has chart",
          id: "charts",
      }),
      new ActionButton({
          icon: "list",
          label: "H",
          title: "Has heatmap",
          square: false,
          id: "heatmap",
      }, new Action(ActionTypes.init, (item) => {
          if (item.heatmap === undefined) {
              item.heatmap = {};
          }
      })),
  ];

  const getActionAbles = (actions, match) => {
      var _a;
      const _actions = [];
      let i = 0;
      while (i < actions.length) {
          const x = actions[i];
          const a = (_a = actionButtons.find(({ id }) => id === x)) === null || _a === void 0 ? void 0 : _a.action;
          if ((a === null || a === void 0 ? void 0 : a.type) === match) {
              _actions.push(a.value);
          }
          i++;
      }
      return _actions;
  };

  class UndoConfig {
      constructor(type, { item, path, items }) {
          this.type = type;
          this.item = item;
          this.path = path;
          this.items = items;
      }
  }

  var UndoConfigs;
  (function (UndoConfigs) {
      UndoConfigs["add"] = "add";
      UndoConfigs["paste"] = "paste";
      UndoConfigs["cut"] = "cut";
      UndoConfigs["delete"] = "delete";
  })(UndoConfigs || (UndoConfigs = {}));

  class Undo {
      constructor(list) {
          this.limit = 1;
          this.list = list;
      }
      maintainLimit() {
          if (this.list.length > this.limit) {
              this.list.pop();
          }
      }
      addDelete(item, path) {
          this.list.push(new UndoConfig(UndoConfigs.delete, {
              item,
              path,
          }));
          this.maintainLimit();
      }
  }

  class Colour {
      constructor(colour, textColour = "#fff") {
          this.colour = colour;
          this.textColour = textColour;
      }
  }

  const colours = [
      new Colour("#fff", "#444"),
      new Colour("#3d7fe3"),
      new Colour("#00b112"),
      new Colour("yellow", "#444"),
      new Colour("orange"),
      new Colour("tomato"),
      new Colour("#777"),
      new Colour("#444"),
      new Colour("teal"),
      new Colour("pink"),
      new Colour("purple"),
  ];

  class Item {
      constructor({ title, message, colour, actions = [], items, index, createdAt, heatmap, tags = undefined, } = {}) {
          this.title = title !== null && title !== void 0 ? title : "";
          this.message = message !== null && message !== void 0 ? message : "";
          this.colour = colour !== null && colour !== void 0 ? colour : colours[0].colour;
          this.actions = actions;
          this.items = items !== null && items !== void 0 ? items : [];
          this.heatmap = heatmap;
          this.tags = tags;
          this.index = index !== null && index !== void 0 ? index : appStore.rootData.itemIndex++;
          this.createdAt =
              createdAt !== null && createdAt !== void 0 ? createdAt : Math.floor(Date.now() - appStore.rootData.timestamp_root);
      }
  }

  const data = {
      root: true,
      timestamp_root: Date.now(),
      title: "Oregano",
      message: "",
      colour: colours[0].colour,
      actions: [],
      items: [],
      tags: [],
      index: 0,
      createdAt: Date.now(),
      pasteItems: [],
      undo: [],
      itemIndex: 1,
  };
  const defaultData = JSON.stringify(data);

  const cleanItem = (item) => {
      item.items = item.items.filter((x) => !!x);
      item.items = item.items.map(cleanItem);
      const { title, message, colour, actions, items, heatmap, tags, index, createdAt, } = item;
      const newItem = new Item({
          title,
          message,
          colour,
          actions,
          items,
          heatmap,
          tags,
          index,
          createdAt,
      });
      return newItem;
  };
  const cleanData = (item) => {
      cleanItem(item);
  };
  const initRootData = (item) => {
      const undo = new Undo(item.undo);
      const output = Object.assign(Object.assign({}, item), { undo });
      cleanData(output);
      return output;
  };
  const loadData$1 = () => __awaiter$1(void 0, void 0, void 0, function* () {
      if (appStore.sessionStorageKey === null) {
          console.warn("Could not LOAD data, no session storage key (appStore.sessionStorageKey) provided");
          return;
      }
      const localData = localStorage.getItem(appStore.sessionStorageKey);
      const data = !localData || localData === "undefined" ? defaultData : localData;
      const parsed = JSON.parse(data);
      if (parsed.timestamp_root === undefined) {
          parsed.timestamp_root = Date.now();
      }
      appStore.rootData = initRootData(parsed);
      saveData();
  });
  const saveData = () => __awaiter$1(void 0, void 0, void 0, function* () {
      if (appStore.sessionStorageKey === null) {
          console.warn("Could not SAVE data, no session storage key provided");
          return;
      }
      const data = Object.assign({}, appStore.rootData);
      data.undo = data.undo.list;
      localStorage.setItem(appStore.sessionStorageKey, JSON.stringify(data));
  });

  class AppButtonsStore extends Store {
      constructor() {
          super({
              appButtonsElement: null,
              isList: new Resolver(() => path.get().at(0) === "list"),
          });
      }
  }
  const appButtonsStore = new AppButtonsStore();

  const setFocusOnFirstMainButton = () => __awaiter$1(void 0, void 0, void 0, function* () {
      var _a;
      yield wait();
      const { appButtonsElement } = appButtonsStore;
      if (!appButtonsElement)
          return;
      const addButton = [...appButtonsElement.children].find((x) => x.classList.contains("main-button--add"));
      if (!addButton)
          return;
      (_a = addButton === null || addButton === void 0 ? void 0 : addButton.focus) === null || _a === void 0 ? void 0 : _a.call(addButton);
  });

  class HasMessageComponent extends MintScope {
      constructor() {
          super();
          this.hasMessage = new Resolver(function () {
              const { message } = listStore.list[this.index];
              return !!message;
          });
      }
  }
  const HasMessage = component("div", HasMessageComponent, {
      class: "list-page__item-has_message",
  }, [
      node("span", {
          mIf: mIf("hasMessage"),
          class: "fa fa-list",
      }),
  ]);

  class ItemCountComponent extends MintScope {
      constructor() {
          super();
          this.itemsLength = new Resolver(function () {
              const { items: { length }, } = listStore.list[this.index];
              return !length ? "" : length + "";
          });
      }
  }
  const ItemCount = component("span", ItemCountComponent, { class: "list-page__item-items_length" }, span({ mIf: mIf("itemsLength") }, "{itemsLength}"));

  class ButtonComponent extends MintScope {
      constructor() {
          super();
          this.type = "button";
          this.theme = "snow";
          this.class = "";
          this.style = undefined;
          this.content = undefined;
          this.id = undefined;
          this.classes = new Resolver(function () {
              if (this.hasExtraButtonLabel)
                  return `${this.class} multi-content`;
              return this.class;
          });
          this.hasIcon = new Resolver(function () {
              return this.icon !== undefined;
          });
          this.hasLabel = new Resolver(function () {
              return this.label !== undefined;
          });
          this.isSquare = new Resolver(function () {
              return this.square ? "square" : "";
          });
          this.isLarge = new Resolver(function () {
              return this.large ? "large" : "";
          });
          this.hasExtraButtonLabel = new Resolver(function () {
              return (this.extraButtonLabel !== null && this.extraButtonLabel !== undefined);
          });
          this.getExtraButtonLabel = function () {
              return this.extraButtonLabel;
          };
          this.getContent = function () {
              return this.content;
          };
          this.onClick = null;
      }
  }
  const Button = component("button", ButtonComponent, {
      "[type]": "type",
      class: "{theme} {classes} {isSquare} {isLarge}",
      "[style]": "style",
      "[title]": "title",
      "[id]": "id",
      "(click)": "onClick",
      mRef: mRef("ref"),
  }, [
      node("<>", Object.assign({}, mIf("!_children")), [
          node("<>", Object.assign({}, mIf("!content")), [
              node("span", { mIf: mIf("hasIcon"), class: "icon fa fa-{icon}" }),
              node("span", { mIf: mIf("hasLabel"), class: "label" }, "{label}"),
              node("span", { mIf: mIf("hasExtraButtonLabel"), class: "extra-content" }, node(template("getExtraButtonLabel"))),
          ]),
          node("<>", Object.assign({}, mIf("content")), node(template("getContent"))),
      ]),
      node("<>", Object.assign({}, mIf("_children")), "_children"),
  ]);

  class ColourSelectorComponent$1 extends MintScope {
      constructor() {
          super();
          this.onInput = null;
          this.colourSelectorScope = this;
          this.showColours = false;
          this.colours = [
              "black",
              "green",
              "lightgreen",
              "blue",
              "lightblue",
              "grey",
              "lightgrey",
              "#444",
              "pink",
              "teal",
              "aqua",
              "red",
              "tomato",
              "purple",
          ];
          this.toggleShowColours = function () {
              this.colourSelectorScope.showColours =
                  !this.colourSelectorScope.showColours;
              externalRefresh(this.colourSelectorScope);
          };
          this.chooseColour = function () {
              var _a;
              (_a = this.onInput) === null || _a === void 0 ? void 0 : _a.call(this, this._x);
              this.colourSelectorScope.showColours = false;
              externalRefresh(this.colourSelectorScope);
          };
      }
  }
  component("div", ColourSelectorComponent$1, { class: "relative z-index" }, [
      node(Button, {
          "[large]": "large",
          square: true,
          content: node("span", null, "C"),
          "[colourSelectorScope]": "colourSelectorScope",
          "[onClick]": "toggleShowColours",
      }),
      node("ul", Object.assign(Object.assign({}, mIf("showColours")), { class: "list flex absolute left-gap", style: "top: 2rem; width: 100px;" }), node("li", Object.assign(Object.assign({}, mFor("colours")), { mKey: "_i", class: "width height snow-border pointer", style: "background-color: {_x};", "(click)": "chooseColour" }))),
  ]);

  class FieldInputComponent extends MintScope {
      constructor() {
          super();
          this.type = "text";
          this.class = "";
          this.style = "";
          // this.onKeyDown = null;
          this.onInput = null;
          // this.onFocus = null;
          // this.onBlur = null;
          this.extendField = {};
          this._labelClass = new Resolver(function () {
              var _a;
              return ((_a = this.labelClass) !== null && _a !== void 0 ? _a : "") + (this.large ? " large" : "");
          });
          this._inputClass = new Resolver(function () {
              return this.class + (this.large ? " large" : "");
          });
          this.isRequired = new Resolver(function () {
              return this.required ? "required" : "";
          });
          this.hasLabelAbove = new Resolver(function () {
              return !!this.label && !this.labelBeside;
          });
          this.hasLabelBeside = new Resolver(function () {
              return !!this.label && !!this.labelBeside;
          });
      }
  }
  const FieldInput = component("label", FieldInputComponent, { class: "{_labelClass} {isRequired}", "[style]": "labelStyles" }, [
      node("span", { mIf: mIf("hasLabelAbove") }, "{label}"),
      node("input", Object.assign(Object.assign({ "[type]": "type", "[name]": "name", "[value]": "value", "[checked]": "checked", "[class]": "_inputClass", "[style]": "style", "[placeholder]": "placeholder", "[required]": "required", "[readonly]": "readonly", "[id]": "id", 
          // "(keydown)": "onKeyDown",
          "(input)": "onInput" }, mExtend("extendField")), mRef("ref"))),
      node("span", { mIf: mIf("hasLabelBeside") }, "{label}"),
  ]);

  const FieldCheckbox = component("div", null, null, node(FieldInput, {
      type: "checkbox",
      "[name]": "name",
      "[value]": "value",
      "[checked]": "checked",
      "[label]": "label",
      labelBeside: true,
      "[labelClass]": "labelClass",
      "[class]": "inputClass",
      "[large]": "large",
      "[style]": "style",
      "[required]": "required",
      "[readonly]": "readonly",
      "[id]": "id",
      "[onInput]": "onInput",
      "[ref]": "ref",
  }));

  const FieldRadio = component("div", null, null, node(FieldInput, {
      type: "radio",
      "[name]": "name",
      "[value]": "value",
      "[checked]": "checked",
      "[label]": "label",
      labelBeside: true,
      "[labelClass]": "labelClass",
      "[labelStyles]": "labelStyles",
      "[class]": "inputClass",
      "[style]": "style",
      "[required]": "required",
      "[readonly]": "readonly",
      "[onInput]": "onInput",
      "[ref]": "ref",
  }));

  class FieldSelectComponent extends MintScope {
      constructor() {
          super();
          this.class = "";
          this.style = "";
          this.options = [];
          this.onInput = null;
          this.hasLabel = new Resolver(function () {
              return !!this.label;
          });
      }
  }
  const FieldSelect = component("label", FieldSelectComponent, { class: "{labelClass} {isRequired}" }, [
      node("span", { mIf: mIf("hasLabel") }, "{label}"),
      node("select", {
          "[name]": "name",
          "[value]": "value",
          "[class]": "class",
          "[style]": "style",
          "[required]": "required",
          "[readonly]": "readonly",
          "[id]": "id",
          "(input)": "onInput",
          mRef: mRef("ref"),
      }, [
          node("option", {
              mFor: mFor("options"),
              mKey: "value",
              "[value]": "value",
          }, "{name}"),
      ]),
  ]);

  class FieldFieldsetComponent extends MintScope {
      constructor() {
          super();
          this.legend = "";
          this.value = null;
          this.options = [];
          this.isChecked = new Resolver(function () {
              return this.value === this.fieldValue;
          });
          this.fieldValue = new Resolver(() => this.value);
          this.onInput = null;
      }
  }
  const FieldFieldset = component("fieldset", FieldFieldsetComponent, { "[id]": "id" }, [
      node("legend", { mIf: mIf("legend"), class: "fieldset__legend" }, "{legend}"),
      node("ul", { class: "list flex" }, node("li", { mFor: mFor("options"), mKey: "value", class: "margin-right-small" }, node(FieldRadio, {
          "[name]": "name",
          "[value]": "value",
          "[label]": "label",
          "[class]": "class",
          "[labelClass]": "labelClass",
          "[labelStyles]": "labelStyles",
          "[style]": "style",
          "[checked]": "isChecked",
          "[onInput]": "onInput",
      }))),
  ]);

  class FieldTextareaComponent extends MintScope {
      constructor() {
          super();
          this.class = "";
          this.style = "";
          this.resize = false;
          this.onInput = null;
          this.hasLabel = new Resolver(function () {
              return !!this.label;
          });
          this.getStyles = new Resolver(function () {
              return (this.resize ? "" : "resize: none; ") + this.style;
          });
          this.getReadonly = new Resolver(function () {
              return this.readonly ? "true" : undefined;
          });
      }
  }
  const FieldTextarea = component("label", FieldTextareaComponent, { class: "{labelClass} {isRequired}" }, [
      node("span", { mIf: mIf("hasLabel") }, "{label}"),
      node("textarea", Object.assign(Object.assign({ "[name]": "name", "[value]": "value", "[class]": "class", "[placeholder]": "placeholder", "[style]": "getStyles", "[readonly]": "getReadonly", "[id]": "id", "(input)": "onInput" }, mExtend("extendField")), { mRef: mRef("ref") })),
  ]);

  const passProps = {
      "[type]": "type",
      "[name]": "name",
      "[value]": "value",
      "[checked]": "checked",
      "[label]": "label",
      "[legend]": "legend",
      "[labelBeside]": "labelBeside",
      "[labelClass]": "labelClass",
      "[labelStyles]": "labelStyles",
      "[class]": "class",
      "[style]": "style",
      "[large]": "large",
      "[required]": "required",
      "[readonly]": "readonly",
      "[id]": "id",
      // "[onKeyDown]": "onKeyDown",
      "[onInput]": "onInput",
      // "[onFocus]": "onFocus",
      // "[onBlur]": "onBlur",
      "[extendField]": "extendField",
      "[ref]": "ref",
  };
  class FieldComponent extends MintScope {
      constructor() {
          super();
          this.type = "text";
          this.class = "";
          this.style = undefined;
          this.onKeyDown = null;
          this.onInput = null;
          this.onFocus = null;
          this.onBlur = null;
          this.extendScope = {};
          this.extendField = {};
          this.ref = null;
          this.isInput = new Resolver(function () {
              const inValidTypes = [
                  "textarea",
                  "select",
                  "checkbox",
                  "radio",
                  "fieldset",
              ];
              return !inValidTypes.includes(this.type);
          });
          this.isCheckbox = new Resolver(function () {
              return this.type === "checkbox";
          });
          this.isRadio = new Resolver(function () {
              return this.type === "radio";
          });
          this.isFieldSet = new Resolver(function () {
              return this.type === "fieldset";
          });
          this.isSelect = new Resolver(function () {
              return this.type === "select";
          });
          this.isTextarea = new Resolver(function () {
              return this.type === "textarea";
          });
      }
  }
  const Field = component("<>", FieldComponent, { "[class]": "wrapperClasses" }, [
      node(FieldInput, Object.assign(Object.assign({ mIf: mIf("isInput") }, mExtend("extendScope")), passProps)),
      node(FieldCheckbox, Object.assign(Object.assign({ mIf: mIf("isCheckbox") }, mExtend("extendScope")), passProps)),
      node(FieldRadio, Object.assign(Object.assign({ mIf: mIf("isRadio") }, mExtend("extendScope")), passProps)),
      node(FieldFieldset, Object.assign(Object.assign(Object.assign({ mIf: mIf("isFieldSet") }, mExtend("extendScope")), passProps), { "[options]": "options" })),
      node(FieldTextarea, Object.assign(Object.assign(Object.assign({ mIf: mIf("isTextarea") }, mExtend("extendScope")), passProps), { "[resize]": "resize" })),
      node(FieldSelect, Object.assign(Object.assign(Object.assign({ mIf: mIf("isSelect") }, mExtend("extendScope")), passProps), { "[options]": "options" })),
  ]);

  class ModalComponent extends MintScope {
      constructor() {
          super();
          this.state = "";
          this.theme = "smoke";
          this.class = "";
          this.style = "";
          this.hasTitle = new Resolver(function () {
              return this.title !== undefined;
          });
          this.clickOnBackground = function () {
              if (this.closeOnBackgroundClick instanceof Function) {
                  this.closeOnBackgroundClick();
              }
              // if (!(this.closeOnBackgroundClick instanceof Function)) return;
              // if (this._store instanceof Store && typeof this.storeTarget === "string") {
              //   closeModal(this._store, this.storeTarget);
              // } else {
              //   closeModal(this, "state");
              // }
          };
          this.clickOnContent = function (event) {
              if (this.closeOnBackgroundClick instanceof Function) {
                  event.stopPropagation();
              }
          };
      }
  }
  component("article", ModalComponent, { class: "modal {state}", "(click)": "clickOnBackground" }, node("div", { class: "modal__content {class}", "[style]": "style", "(click)": "clickOnContent" }, [
      node("header", { mIf: mIf("hasTitle"), class: "modal__header {theme}" }, node("h2", null, "{title}")),
      "_children"
  ]));

  const exact = (target, hash) => {
      return target === hash;
  };
  const contains = (target, hash) => {
      return hash.includes(target);
  };
  const hasWord = (target, hash) => {
      return (hash.includes(` ${hash} `) ||
          exact(target, hash) ||
          starts(target + " ", hash) ||
          ends(" " + target, hash));
  };
  const containsAndHyphen = (target, hash) => {
      return target === hash || hash.includes(target + "-");
  };
  const starts = (target, hash) => {
      return hash.slice(0, target.length) === target;
  };
  const ends = (target, hash) => {
      return hash.slice(hash.length - target.length) === target;
  };

  var RouteType;
  (function (RouteType) {
      RouteType["exact"] = "exact";
      RouteType["="] = "=";
      RouteType["contains"] = "contains";
      RouteType["*"] = "*";
      RouteType["hasWord"] = "hasWord";
      RouteType["~"] = "~";
      RouteType["containsAndHyphen"] = "containsAndHyphen";
      RouteType["|"] = "|";
      RouteType["starts"] = "starts";
      RouteType["^"] = "^";
      RouteType["ends"] = "ends";
      RouteType["$"] = "$";
  })(RouteType || (RouteType = {}));

  const logic = {
      [RouteType.exact]: exact,
      [RouteType["="]]: exact,
      [RouteType.contains]: contains,
      [RouteType["*"]]: contains,
      [RouteType.hasWord]: hasWord,
      [RouteType["~"]]: hasWord,
      [RouteType.containsAndHyphen]: containsAndHyphen,
      [RouteType["|"]]: containsAndHyphen,
      [RouteType.starts]: starts,
      [RouteType["^"]]: starts,
      [RouteType.ends]: ends,
      [RouteType["$"]]: ends,
  };
  class RouterComponent extends MintScope {
      constructor() {
          super();
          this.routes = [];
          this.oninit = function () {
              var _a;
              (_a = this.onDefine) === null || _a === void 0 ? void 0 : _a.call(this, this);
          };
          this.router = function () {
              const routes = this.routes;
              const hash = window.location.hash.replace("#", "").replace(/%20/g, " ");
              {
                  let i = 0;
                  while (i < routes.length) {
                      const route = routes[i];
                      if (logic[route.type](route.target, hash))
                          return route.content;
                      i++;
                  }
              }
              return [];
          };
      }
  }
  component("<>", RouterComponent, {}, [
      node(template("router")),
  ]);

  class TabsComponent extends MintScope {
      constructor() {
          super();
          const scope = this;
          this.tabs = [];
          this.currentTab = null;
          this.currentTemplate = new Resolver(function () {
              return this.currentTab.template;
          });
          this.tabSelected = new Resolver(function () {
              return this.currentTab !== null;
          });
          this.activeTab = new Resolver(function () {
              return this._x === this.currentTab ? "active" : "";
          });
          this.onpreblueprint = function () {
              if (this.tabs.length === 0)
                  return;
              if (this.currentTab !== null)
                  return;
              this.currentTab = this.tabs[0];
          };
          this.selectTab = function () {
              var _a;
              scope.currentTab = this._x;
              (_a = scope.onSelectTab) === null || _a === void 0 ? void 0 : _a.call(scope);
              externalRefresh(scope);
          };
      }
  }
  const Tabs = component("div", TabsComponent, { class: "tabs", mRef: mRef("ref") }, [
      node("ul", { class: "tabs__list" }, node("li", {
          mFor: mFor("tabs"),
          mKey: "name",
          class: "tabs__list-item {activeTab}",
          "(click)": "selectTab",
      }, node("div", null, "{name}"))),
      node("div", { mIf: mIf("tabSelected"), class: "tabs__body" }, node(template({ onevery: true }, "currentTemplate"))),
  ]);

  class TableComponent extends MintScope {
      constructor() {
          super();
          this.columns = [];
          this.rows = [];
      }
  }
  component("table", TableComponent, { class: "table" }, [
      node("thead", null, node("tr", null, node("th", Object.assign(Object.assign({}, mFor("columns")), { mKey: "id" }), "{title}"))),
      node("tbody", null, node("tr", Object.assign(Object.assign({}, mFor("rows")), { mKey: "id" }), node("td", Object.assign(Object.assign({}, mFor("columns")), { mKey: "id" }), "{cell}"))),
  ]);

  class Tab {
      constructor(name, template) {
          this.name = name;
          this.template = template;
      }
  }

  const getTextColour = (_colour) => {
      const colour = colours.find(({ colour }) => colour === _colour);
      return (colour === null || colour === void 0 ? void 0 : colour.textColour) || colours[0].colour;
  };

  class ListItemComponent extends MintScope {
      constructor() {
          super();
          this.style = new Resolver(function () {
              return styles({
                  color: getTextColour(listStore.list[this.index].colour),
              });
          });
      }
  }
  const ListItem = component("<>", ListItemComponent, null, node(Button, {
      theme: "empty",
      "[icon]": "icon",
      square: true,
      class: "list-page__item-button",
      "[onClick]": "onClick",
      "[index]": "index",
  }));

  const editItem$2 = (event, _, scope) => {
      event.stopPropagation();
      const { index } = scope;
      manageStore.editItem = listStore.list[index];
      manageStore.toEditMethod = "item-button";
      path.set(["manage", ...path.get().slice(1), index]);
      externalRefresh(appStore);
  };

  class EditListItemComponent extends MintScope {
      constructor() {
          super();
          this.editItem = editItem$2;
      }
  }
  const EditListItem = component("<>", EditListItemComponent, null, node(ListItem, {
      icon: "pencil",
      "[onClick]": "editItem",
      "[index]": "index",
  }));

  const cutItem = (event, _, scope) => {
      event.stopPropagation();
      const { index } = scope;
      const item = listStore.list[index];
      appStore.rootData.pasteItems.push(item);
      listStore.list.splice(index, 1);
      saveData();
      externalRefresh(appButtonsStore);
      externalRefresh(listStore);
  };

  class CutListItemComponent extends MintScope {
      constructor() {
          super();
          this.cutItem = cutItem;
      }
  }
  const CutListItem = component("<>", CutListItemComponent, null, node(ListItem, {
      icon: "scissors",
      "[onClick]": "cutItem",
      "[index]": "index",
  }));

  const deleteItem = (event, _, scope) => {
      event.stopPropagation();
      const { index } = scope;
      const item = listStore.list[index];
      listStore.list.splice(index, 1);
      appStore.rootData.undo.addDelete(item, path.get());
      saveData();
      externalRefresh(listStore);
  };

  class DeleteListItemComponent extends MintScope {
      constructor() {
          super();
          this.deleteItem = deleteItem;
      }
  }
  const DeleteListItem = component("<>", DeleteListItemComponent, null, node(ListItem, {
      icon: "trash-o",
      "[onClick]": "deleteItem",
      "[index]": "index",
  }));

  const getItem = (url, item = appStore.rootData) => {
      if (item === null)
          return null;
      if (url.length === 0)
          return item;
      const nextIndex = url.at(0);
      if (nextIndex === "" || nextIndex === undefined)
          return item;
      const nextItem = item.items[nextIndex];
      return getItem(url.slice(1), nextItem);
  };

  class ListStore extends Store {
      constructor() {
          super({
              breadcrumbs: new Resolver(() => oreganoSettings.breadcrumbs),
              dragIndex: null,
              listElementRef: null,
              item: new Resolver(() => {
                  const item = getItem(path.get().slice(1));
                  if (item === null)
                      return {};
                  return item;
              }),
              list: new Resolver(() => {
                  const item = getItem(path.get().slice(1));
                  if (item === null)
                      return [];
                  return item.items;
              }),
              itemOptions: [
                  HasMessage,
                  ItemCount,
                  EditListItem,
                  CutListItem,
                  DeleteListItem,
              ],
              hasList: new Resolver(() => listStore.list.length > 0),
              getTextColour: new Resolver(function () {
                  return getTextColour(this.colour);
              }),
              messageClass: new Resolver(() => {
                  var _a;
                  return ((_a = listStore.item.actions) === null || _a === void 0 ? void 0 : _a.includes("message-to-side"))
                      ? "grid-6"
                      : "grid-12";
              }),
              selectItem: function () {
                  return __awaiter$1(this, void 0, void 0, function* () {
                      yield wait();
                      externalRefresh(appStore);
                  });
              },
              onDragStart() {
                  listStore.dragIndex = this._i;
              },
              onDragOver(event) {
                  event.preventDefault();
              },
              onDrop(_, __, scope) {
                  const index = scope._i;
                  const [holdItem] = listStore.list.splice(listStore.dragIndex, 1);
                  listStore.list.splice(index, 0, holdItem);
                  listStore.dragIndex = null;
                  saveData();
                  externalRefresh(listStore);
              },
          });
      }
  }
  const listStore = new ListStore();

  class TitleFieldComponent extends MintScope {
      constructor() {
          super();
          this.title = new Resolver(() => manageStore.title);
          this.setTitle = new Resolver(() => manageStore.setTitle);
      }
  }
  const TitleField = component("<>", TitleFieldComponent, null, node(Field, {
      name: "title",
      "[value]": "title",
      label: "Title",
      required: true,
      id: "title-field",
      "[onInput]": "setTitle",
  }));

  class MessageFieldComponent extends MintScope {
      constructor() {
          super();
          this.message = new Resolver(() => {
              const { message } = manageStore;
              return message;
          });
          this.setMessage = new Resolver(() => manageStore.setMessage);
          this.height = 23;
      }
  }
  const MessageField = component("<>", MessageFieldComponent, null, node(Field, {
      type: "textarea",
      name: "message",
      "[value]": "message",
      label: "Message",
      labelClass: "relative",
      class: "manage-form__message",
      id: "message-field",
      fieldStyles: styles({ height: "{height}rem" }),
      "[onInput]": "setMessage",
  }));

  class ColourSelectorComponent extends MintScope {
      constructor() {
          super();
          this.colours = manageStore.colours;
          this.currentColour = new Resolver(() => manageStore.currentColour);
          this.setColour = manageStore.setColour;
          this.radioStyles = new Resolver(function () {
              return styles({
                  "box-shadow": `inset 0 0 1px 5px ${this.value};`,
              });
          });
      }
  }
  const ColourSelector = component("div", ColourSelectorComponent, {}, node(Field, {
      type: "fieldset",
      name: "colour",
      legend: "Colour",
      "[value]": "currentColour",
      labelClass: "round",
      "[labelStyles]": "radioStyles",
      id: "colour-field",
      "[options]": "colours",
      "[onInput]": "setColour",
  }));

  class Tag {
      constructor(tag, tagColour = colours[1].colour) {
          this.tag = tag;
          this.tagColour = tagColour;
      }
  }

  class TagsComponents extends MintScope {
      constructor() {
          super();
          this.tags = new Resolver(() => manageStore.tags);
          this.tagInputRef = new UpwardRef(null);
          this.tagsValue = new Resolver(() => manageStore.tagsValue);
          this.setTagsValue = (_, node) => {
              manageStore.tagsValue = node.value;
          };
          this.addTab = function (event) {
              event.preventDefault();
              if (manageStore.tagsValue === "") {
                  toast("No value entered for Tab");
              }
              manageStore.tags.push(new Tag(manageStore.tagsValue));
              manageStore.tagsValue = "";
              externalRefresh(this);
              this.tagInputRef.ref.focus();
          };
          this.removeTab = function () {
              manageStore.tags.splice(this.index, 1);
              externalRefresh(manageStore.tagsScope);
          };
          this.oninit = function () {
              manageStore.tagsScope = this;
          };
      }
  }
  const Tags = component("form", TagsComponents, {
      "(submit)": "addTab",
  }, [
      div({ class: "relative" }, [
          node(Field, {
              label: "Tags",
              "[value]": "tagsValue",
              "[onInput]": "setTagsValue",
              class: "padding-right-large",
              "[ref]": "tagInputRef",
          }),
          node(Button, {
              type: "submit",
              theme: "blueberry",
              icon: "plus",
              class: "absolute right bottom",
              square: true,
          }),
      ]),
      node("ul", { class: "content-tags" }, node("li", {
          mFor: mFor("tags"),
          mKey: "tag",
          class: "content-tags__tag content-tags__tag--removable",
          style: "background-color: {tagColour};",
      }, [
          span("{tag}"),
          node(Button, {
              theme: "empty",
              icon: "trash-o",
              class: "absolute top right snow-text",
              "[onClick]": "removeTab",
              "[index]": "_i",
          }),
      ])),
  ]);

  class ActionsComponent extends MintScope {
      constructor() {
          super();
          this.actionButtons = actionButtons;
          actionStore.connect(this);
      }
  }
  const Actions = component("ul", ActionsComponent, { class: "list flex margin-bottom" }, node("li", {
      mFor: mFor("actionButtons"),
      mKey: "id",
      class: "margin-right-small",
  }, node(Button, {
      "[theme]": "getTheme",
      "[icon]": "icon",
      "[label]": "label",
      "[title]": "title",
      "[square]": "square",
      "[onClick]": "onClick",
      "[id]": "id",
  })));

  const defaultManageChildren = [
      div({ class: "grid-9 padding-right-small" }, [
          node(TitleField),
          node(MessageField),
      ]),
      div({ class: "grid-3 padding-left-small" }, [
          node(ColourSelector),
          node(Tags),
      ]),
      div({ class: "grid-12" }, node(Actions)),
  ];

  const createInsert = () => {
      manageStore.title = "";
      manageStore.message = "";
      manageStore.currentColour = manageStore.colours[0].value;
      manageStore.tags = [];
      actionButtons.forEach((x) => (x.active = false));
  };
  const editInsert = () => {
      var _a;
      manageStore.title = manageStore.editItem.title;
      {
          const message = manageStore.editItem.message;
          manageStore.message = message;
      }
      manageStore.currentColour = manageStore.editItem.colour;
      manageStore.tags = (_a = manageStore.editItem.tags) !== null && _a !== void 0 ? _a : [];
      actionButtons.forEach((x) => (x.active = false));
      (manageStore.editItem.actions || []).forEach((_action) => {
          const actionButton = actionButtons.find(({ id }) => id === _action);
          if (actionButton === undefined)
              return;
          actionButton.active = true;
      });
  };
  const oninsert = () => __awaiter$1(void 0, void 0, void 0, function* () {
      const isEdit = manageStore.editItem !== null;
      if (!isEdit) {
          createInsert();
      }
      else {
          editInsert();
      }
      yield wait();
      const form = manageStore.manageFormElementRef;
      if (form !== null) {
          const titleElementRef = [...form.elements].find((x) => x.name === "title");
          titleElementRef === null || titleElementRef === void 0 ? void 0 : titleElementRef.focus();
      }
      externalRefresh(manageStore);
  });
  const createItem = () => {
      const tags = manageStore.tags.length === 0 ? undefined : [...manageStore.tags];
      const newItem = new Item();
      const elements = [...manageStore.manageFormElementRef.elements];
      if (elements.find((x) => x.name === "title")) {
          newItem.title = manageStore.title;
      }
      if (elements.find((x) => x.name === "message")) {
          newItem.message = manageStore.message;
      }
      if (elements.find((x) => x.name === "colour")) {
          newItem.colour = manageStore.currentColour;
      }
      if (!!tags) {
          newItem.tags = tags;
      }
      newItem.actions = actionButtons
          .filter(({ active }) => active)
          .map(({ id }) => id);
      {
          const actions = getActionAbles(newItem.actions, ActionTypes.init);
          actions.forEach((x) => {
              if (x instanceof Function) {
                  x(newItem);
              }
          });
      }
      {
          // ** There should only be one action that matches this if any do.
          // ** We don't want several to run.
          const [action] = getActionAbles(listStore.item.actions, ActionTypes["add-to-list"]);
          if (action instanceof Function) {
              action(listStore.item, newItem);
          }
          else {
              listStore.list.push(newItem);
          }
      }
  };
  const editItem$1 = () => {
      const { editItem } = manageStore;
      {
          const actions = getActionAbles(editItem.actions || [], ActionTypes.init);
          actions.forEach((x) => {
              if (x instanceof Function) {
                  x(editItem);
              }
          });
      }
      const elements = [...manageStore.manageFormElementRef.elements];
      if (elements.find((x) => x.name === "title")) {
          editItem.title = manageStore.title;
      }
      if (elements.find((x) => x.name === "message")) {
          editItem.message = manageStore.message;
      }
      if (elements.find((x) => x.name === "colour")) {
          editItem.colour = manageStore.currentColour;
      }
      manageStore.editItem.actions = actionButtons
          .filter(({ active }) => active)
          .map(({ id }) => id);
      {
          const tags = manageStore.tags.length === 0 ? undefined : [...manageStore.tags];
          manageStore.editItem.tags = tags;
      }
      manageStore.editItem = null;
  };
  const onSubmit = (event) => {
      event.preventDefault();
      if (manageStore.editItem === null) {
          createItem();
      }
      else {
          editItem$1();
      }
      saveData();
      backToList();
      setFocusOnFirstMainButton();
  };
  class ManageStore extends Store {
      constructor() {
          super({
              defaultChildren: () => defaultManageChildren,
              manageFormElementRef: null,
              title: "",
              message: "",
              colours: colours.map((x) => ({
                  value: x.colour,
              })),
              currentColour: colours[0].colour,
              tagsValue: "",
              tags: [],
              tagsScope: null,
              toEditMethod: "main-button",
              editItem: null,
              mainLabel: new Resolver(() => manageStore.editItem !== null ? "Edit" : "Add"),
              saveButtonLabel: new Resolver(() => manageStore.editItem !== null ? "Edit" : "Add"),
              saveButtonTheme: new Resolver(() => manageStore.editItem !== null ? "apple" : "blueberry"),
              setTitle(_, element) {
                  manageStore.title = element.value;
              },
              setMessage(_, element) {
                  manageStore.message = element.value;
              },
              setColour(_, element) {
                  manageStore.currentColour = element.value;
              },
              oninsert,
              onSubmit,
              cancel() {
                  if (manageStore.toEditMethod === "item-button") {
                      path.set(path.get().slice(0, -1));
                  }
                  backToList();
              },
          });
      }
  }
  const manageStore = new ManageStore();

  const backToList = () => {
      manageStore.editItem = null;
      changePage("list");
      externalRefresh(appStore);
  };

  const appInit = () => __awaiter$1(void 0, void 0, void 0, function* () {
      const [url] = path.get();
      if (url === undefined) {
          path.set(["list"]);
      }
      loadData$1();
      yield wait();
      appStore.loaded = true;
      externalRefresh(appStore);
      // ** This communicates to node on Electron app, does nothing on Browser.
      window.dispatchEvent(new CustomEvent("initial-data-save", { detail: appStore.rootData }));
      // ** When pressing the Esc key on Manage form, return to list page.
      window.addEventListener("keydown", (event) => {
          if (event.code !== "Escape")
              return;
          if (path.get()[0] === "manage") {
              backToList();
          }
      });
  });

  class OreganoAppComponent extends MintScope {
      constructor() {
          super();
          this.oninsert = function () {
              appInit();
          };
          appStore.connect(this);
      }
  }

  class PagesComponent extends MintScope {
      constructor() {
          super();
          this.loaded = new Resolver(() => appStore.loaded);
      }
  }
  const Pages = component("div", PagesComponent, { class: "pages" }, node("div", Object.assign({}, mIf("loaded")), "_children"));

  const upLevel = () => {
      path.set(path.get().slice(0, path.get().length - 1));
      externalRefresh(appStore);
  };

  class BreadcrumbsComponent extends MintScope {
      constructor() {
          super();
          this.crumbs = new Resolver(() => {
              let output = [];
              if (appStore.rootData === null)
                  return output;
              const url = path.get();
              if (url.length === 1) {
                  output = [{ content: " -- root -- ", isLink: false }];
                  return output;
              }
              if (url.length === 1)
                  return [{ content: " ", isLink: false }];
              let data = appStore.rootData;
              const crumbs = url.reduce((a, b, i) => {
                  const index = i;
                  const target = url.slice(0, index + 1).join("/");
                  if (i === 0) {
                      a.push({
                          content: data.title,
                          isLink: true,
                          target,
                      });
                      return a;
                  }
                  data = data.items[b];
                  if (data === undefined) {
                      toast("Unable to find this item, returning to home.", "tomato");
                      (() => __awaiter$1(this, void 0, void 0, function* () {
                          yield wait();
                          upLevel();
                      }))();
                      return [];
                  }
                  a.push({ content: "/", isLink: false });
                  if (i !== url.length - 1) {
                      a.push({ content: data.title, isLink: true, target });
                  }
                  else {
                      a.push({ content: data.title, isLink: false });
                  }
                  return a;
              }, []);
              output = crumbs;
              return output;
          });
          this.isRoot = new Resolver(function () {
              return this.content === " -- root -- " ? "orange-text" : "";
          });
          this.goToLink = function () {
              return __awaiter$1(this, void 0, void 0, function* () {
                  yield wait();
                  externalRefresh(listStore);
              });
          };
      }
  }
  const Breadcrumbs = component("ul", BreadcrumbsComponent, { class: "breadcrumbs" }, node("li", { mFor: mFor("crumbs"), mKey: "_i", class: "breadcrumbs__item" }, [
      node("a", {
          mIf: mIf("isLink"),
          href: "#{target}",
          class: "breadcrumbs__item-link",
          "(click)": "goToLink",
      }, "{content}"),
      node("span", { mIf: mIf("!isLink"), class: "{isRoot}" }, "{content}"),
  ]));

  class ItemOptionsComponent extends MintScope {
      constructor() {
          super();
          this.getItemOptions = function () {
              return listStore.itemOptions.map((x) => node(x, { "[index]": "index" }));
          };
      }
  }
  const ItemOptions = component("<>", ItemOptionsComponent, null, [
      node(template({ conditionedBy: "index" }, "getItemOptions")),
  ]);

  class ItemTitleComponent extends MintScope {
      constructor() {
          super();
          this.onaftereach = function () {
              return __awaiter$1(this, void 0, void 0, function* () {
                  if (this._index === this.index)
                      return;
                  this._index = this.index;
                  yield wait();
                  externalRefresh(this);
              });
          };
          this.backgroundColor = "transparent";
          this.textColor = "#000";
          this.showOverflow = new Resolver(function () {
              const item = listStore.listElementRef.children[this.index];
              if (!item)
                  return false;
              const title = item.querySelector(".list-page__item-title");
              const p = item.querySelector(".list-page__item-title-p");
              if (!title || !p)
                  return false;
              {
                  const container = title.parentElement;
                  this.backgroundColor = container.style.backgroundColor;
                  this.textColor = container.style.color;
              }
              if (!p || p.offsetWidth === 0)
                  return false;
              if (p.offsetWidth < title.offsetWidth)
                  return false;
              return true;
          });
          this.url = new Resolver(() => path.get().join("/"));
      }
  }
  const ItemTitle = component("a", ItemTitleComponent, {
      href: "#{url}/{index}",
      class: "list-page__item-title",
      "(click)": "selectItem",
  }, [
      node("p", { class: "list-page__item-title-p" }, "{title}"),
      node("span", {
          mIf: mIf("showOverflow"),
          class: "list-page__item-title-overflow",
      }, "..."),
  ]);

  const checkHeatmapCheckbox = (item, message = item.message, date = new Date()) => {
      if (item.heatmap === undefined) {
          item.heatmap = {};
      }
      const lines = message.split("\n");
      const checkedLines = lines
          .filter((x) => x.includes("--c-c"))
          .map((x) => x.replace("--c-c", ""))
          .map((x) => x.trim());
      const d = getDate(date, "dd-mm-yyyy");
      item.heatmap[d] = checkedLines;
  };

  const resolveLeadingZeroes = (number) => {
      return number < 10 ? `0${number}` : number;
  };

  const getResolvedDate = (time = Date.now()) => {
      const date = new Date(time);
      const [minutes, hours, day, month, year] = [
          date.getMinutes(),
          date.getHours(),
          date.getDate(),
          date.getMonth() + 1,
          date.getFullYear(),
      ]
          .map((x) => resolveLeadingZeroes(x))
          .map((x) => Number(x + ""));
      return { minutes, hours, day, month, year };
  };

  const getTodaysDate = () => {
      return getDate(new Date(), "dd-mm-yyyy");
  };

  const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
  ];

  class HeatmapStore extends Store {
      constructor() {
          super({
              message: "",
              isEditing: false,
              editingDate: null,
              year: "",
              month: "",
              monthStartDay: 0,
              weekDays: ["M", "T", "W", "T", "F", "S", "S"],
              heatmap: new Resolver(() => {
                  var _a;
                  const { item } = listStore;
                  if (item === null)
                      return [];
                  const { month, year } = getResolvedDate();
                  const isToday = (day) => {
                      const { day: d, month: m, year: y } = getResolvedDate();
                      return d === day && m === month && y === year;
                  };
                  const message = item.message;
                  const checkboxMax = (_a = message.match(/--c/g)) === null || _a === void 0 ? void 0 : _a.length;
                  const days = Array(new Date(year, month, 0).getDate())
                      .fill(null)
                      .map((_, i) => {
                      var _a;
                      const d = resolveLeadingZeroes(i + 1);
                      const m = resolveLeadingZeroes(month);
                      const title = `${d}-${m}-${year}`;
                      const output = {
                          hidden: false,
                          title,
                          day: i + 1,
                      };
                      const _styles = {};
                      if (((_a = item.heatmap) === null || _a === void 0 ? void 0 : _a[title]) !== undefined) {
                          const checkedTotal = item.heatmap[title].length;
                          const shadow = Math.floor((checkedTotal / checkboxMax) * 100) / 100;
                          _styles["background-color"] = `rgba(25, 207, 73, ${shadow})`;
                      }
                      if (isToday(i + 1)) {
                          _styles.border = "2px solid orange";
                      }
                      output.style = styles(_styles);
                      return output;
                  });
                  let initialDay = new Date(year, month - 1, 1).getDay() - 1;
                  if (initialDay === -1) {
                      initialDay = 6;
                  }
                  {
                      let i = initialDay;
                      while (i > 0) {
                          days.unshift({ hidden: true });
                          i--;
                      }
                  }
                  return days;
              }),
              getShadow: new Resolver(function () {
                  return this.title === getTodaysDate()
                      ? "z-index shadow-block-orange"
                      : "";
              }),
              oninsert: function () {
                  return __awaiter$1(this, void 0, void 0, function* () {
                      heatmapStore.isEditing = false;
                      heatmapStore.message = listStore.item.message;
                      yield wait();
                      const { item } = listStore;
                      if (!item.actions.includes("heatmap")) {
                          path.set(["list", ...path.get().slice(1)]);
                          externalRefresh(appStore);
                          return;
                      }
                      const date = new Date();
                      const [month, year] = [date.getMonth(), date.getFullYear()];
                      heatmapStore.year = year.toString();
                      heatmapStore.month = months[month];
                      heatmapStore.monthStartDay = new Date(year, month + 1, 1).getDay() - 1;
                      externalRefresh(this);
                  });
              },
              editHeatmap(_, element) {
                  if (listStore.item.heatmap === undefined)
                      return;
                  heatmapStore.isEditing = true;
                  heatmapStore.editingDate = element.title;
                  heatmapStore.message = listStore.item.message.replace(/--c-c/g, "--c");
                  const heatmap = listStore.item.heatmap[heatmapStore.editingDate];
                  if (heatmap !== undefined) {
                      heatmapStore.message = heatmapStore.message
                          .split("\n")
                          .map((x) => {
                          const value = x.replace("--c", "").trim();
                          if (heatmap.includes(value)) {
                              return x.replace("--c", "--c-c");
                          }
                          return x;
                      })
                          .join("\n");
                  }
                  externalRefresh(heatmapStore);
              },
          });
      }
  }
  const heatmapStore = new HeatmapStore();

  const checkItem = (splits, line, index, scope) => {
      const newSplits = [...splits];
      newSplits.splice(index, 1, line.includes("--c-c")
          ? line.replace("--c-c", "--c")
          : line.replace("--c", "--c-c"));
      if (path.get().at(0) === "list") {
          listStore.item.message = newSplits.join("\n");
          if (listStore.item.actions.includes("heatmap")) {
              checkHeatmapCheckbox(listStore.item);
          }
      }
      else if (path.get().at(0) === "heatmap") {
          const [d, m, y] = heatmapStore.editingDate.split("-");
          heatmapStore.message = newSplits.join("\n");
          checkHeatmapCheckbox(listStore.item, heatmapStore.message, new Date(`${y}/${m}/${d}`));
      }
      saveData();
      externalRefresh(scope);
  };
  const resolveCheckbox = (splits, lineContent, index, scope) => {
      return node(Field, {
          type: "checkbox",
          checked: lineContent.includes("--c-c"),
          label: lineContent.replace(/--c-c/g, "").replace(/--c/g, ""),
          onInput: () => checkItem(splits, lineContent, index, scope),
      });
  };
  const getTemplate = (message, scope) => {
      const splits = message.split("\n");
      const output = splits.map((x, i) => {
          let element = "p";
          const classes = ["reset-margin"];
          const _styles = {};
          // ** Order is important below
          // ** Checkbox
          if (x.includes("--c")) {
              return resolveCheckbox(splits, x, i, scope);
          }
          // ** Code
          if (x.substring(0, 4) === "--<>") {
              x = x.replace("--<>", "");
              element = "code";
          }
          // ** Font size
          if (/--fs[0-9]{2}/g.test(x.substring(0, 6))) {
              const size = x.substring(4, 6);
              x = x.replace(/--fs[0-9]{2}/, "");
              _styles["font-size"] = size + "px";
          }
          // ** Font Bold
          if (x.substring(0, 3) === "--b") {
              x = x.replace("--b", "");
              classes.push("bold");
          }
          // ** Font Underline
          if (x.substring(0, 3) === "--u") {
              x = x.replace("--u", "");
              classes.push("underline");
          }
          // ** Font Italic
          if (x.substring(0, 3) === "--i") {
              x = x.replace("--i", "");
              classes.push("italic");
          }
          // ** Add gap before and after
          if (x.substring(0, 5) === "--gap") {
              x = x.replace("--gap", "");
              classes.push("margin-top margin-bottom");
          }
          if (x.substring(0, 2) === "--") {
              x = x.replace("--", "");
              return node(element, { class: classes.join(" ") }, [
                  span({ class: "fa fa-circle list-page__message-bullet" }),
                  span(x),
              ]);
          }
          let content = x;
          // ** Here we day that any empty line should be a BR instead of an empty P Element.
          // ** This is because an empty P does not have any height.
          // ** We also check if there are more than one lines.
          // ** This is to stop the situation where there is no message to show but we add a BR, which is not what we want.
          if (content === "" && splits.length > 1)
              return node("br");
          return node(element, { class: classes.join(" "), style: styles(_styles) }, content);
      });
      return output;
  };
  class MessageComponent extends MintScope {
      constructor() {
          super();
          this.message = "";
          this.messageClass = "";
          this.currentStyles = new Resolver(() => {
              const { item } = listStore;
              let str = "";
              const actions = item.actions || [];
              // ** For each action
              actions.forEach((x) => {
                  var _a;
                  // ** Find the action.
                  const action = actionButtons.find((y) => y.id === x);
                  // ** Only check actions that affect styles.
                  if (((_a = action.action) === null || _a === void 0 ? void 0 : _a.type) !== ActionTypes.style)
                      return;
                  str += action.action.value;
              });
              return str;
          });
          this.messageTemplate = function () {
              return getTemplate(this.message, this);
          };
      }
  }
  const Message = component("div", MessageComponent, { class: "list-page__message {messageClass}" }, [node(template({ conditionedBy: "message" }, "messageTemplate"))]);

  class TitleComponent extends MintScope {
      constructor() {
          super();
          this.item = new Resolver(() => listStore.item);
          this.filteredActionButtons = new Resolver(() => {
              if (!listStore.item.actions)
                  return [];
              const actions = listStore.item.actions
                  .map((x) => {
                  const action = actionButtons.find((y) => y.id === x);
                  if (!action)
                      return;
                  const { title, icon, id } = action;
                  return { title, icon, id };
              })
                  .filter((x) => !!x);
              return actions;
          });
          this.hasIcon = new Resolver(function () {
              return this.icon !== null;
          });
      }
  }
  const Title = component("div", TitleComponent, {
      class: "list-page__title",
  }, [
      node("h2", null, "{item.title}"),
      node("ul", { class: "list flex align-centre" }, node("li", {
          mFor: mFor("filteredActionButtons"),
          mKey: "id",
          class: "padding-left",
      }, node("span", { "[title]": "title" }, [
          node("span", { mIf: mIf("hasIcon"), class: "fa fa-{icon}" }),
      ]))),
  ]);

  const dragDrop = {
      draggable: true,
      "(dragstart)": "onDragStart",
      "(dragover)": "onDragOver",
      "(drop)": "onDrop",
  };

  class ListComponent extends MintScope {
      constructor() {
          super();
          listStore.connect(this);
      }
  }
  const List = component("section", ListComponent, { class: "list-page" }, [
      node("div", { class: "list-page__container" }, node("div", { class: "list-page__container-items" }, [
          node(Breadcrumbs, { mIf: mIf("breadcrumbs") }),
          node(Title),
          node("ul", { mIf: mIf("item.tags"), class: "content-tags" }, node("li", {
              mFor: mFor("item.tags"),
              mKey: "tag",
              class: "content-tags__tag",
              style: "background-color: {tagColour};",
          }, [span("{tag}")])),
          node("div", { class: "flex" }, [
              node(Message, {
                  "[message]": "item.message",
                  "[messageClass]": "messageClass",
              }),
              div({ class: "list-page__list-container {messageClass}" }, node("ul", {
                  mIf: mIf("hasList"),
                  mRef: mRef("listElementRef"),
                  class: "list list-page__list",
                  id: "list-items",
              }, node("li", {
                  mFor: mFor("list"),
                  mKey: "index",
                  class: "list-page__item",
                  style: styles({
                      "background-color": "{colour}",
                      color: "{getTextColour}",
                  }),
                  mExtend: mExtend(dragDrop),
              }, node("div", {
                  class: "list-page__item-container",
              }, [
                  node(ItemTitle, {
                      "[title]": "title",
                      "[index]": "_i",
                      "[selectItem]": "selectItem",
                  }),
                  node(ItemOptions, {
                      "[index]": "_i",
                  }),
              ])))),
          ]),
      ])),
  ]);

  class ManageComponent extends MintScope {
      constructor() {
          super();
          manageStore.connect(this);
      }
  }
  const Manage = component("section", ManageComponent, null, node("form", {
      mRef: mRef("manageFormElementRef"),
      class: "form manage-form",
      name: "manage-form",
      autocomplete: "off",
      "(submit)": "onSubmit",
  }, [
      node("h2", null, "{mainLabel} item"),
      node("div", { class: "flex" }, [
          node("<>", Object.assign({}, mIf("_children")), "_children"),
          node("<>", Object.assign({}, mIf("!_children")), node(template({ onevery: false }, "defaultChildren"))),
          node("div", { class: "grid-12" }, [
              node(Button, {
                  type: "submit",
                  "[theme]": "saveButtonTheme",
                  "[label]": "saveButtonLabel",
                  class: "margin-right padded-small",
                  large: true,
                  "[saveButtonTheme]": "saveButtonTheme",
              }),
              node(Button, {
                  theme: "smoke",
                  label: "Cancel",
                  class: "large padded-small",
                  "[onClick]": "cancel",
              }),
          ]),
      ]),
  ]));

  const simiplifyData = (data) => {
      data = JSON.parse(JSON.stringify(data));
      if (data.message === "")
          delete data.message;
      if (data.colour === colours[0].colour)
          delete data.colour;
      data.items.forEach(simiplifyData);
      return data;
  };
  class ExportStore extends Store {
      constructor() {
          super({
              currentTitle: new Resolver(() => {
                  return listStore.item.title;
              }),
              currentValue: new Resolver(() => {
                  if (exportStore.onlyItems) {
                      const { items } = listStore.item;
                      const _items = items.map(simiplifyData);
                      return JSON.stringify(_items);
                  }
                  const { item } = listStore;
                  const _item = simiplifyData(item);
                  return JSON.stringify(_item);
              }),
              onlyItems: false,
              formElementRef: null,
              oninsert: () => __awaiter$1(this, void 0, void 0, function* () {
                  const form = exportStore.formElementRef;
                  yield wait();
                  const input = form["export-data"];
                  input.select();
              }),
              onChangeOnlyItems: (_, element) => {
                  exportStore.onlyItems = element.checked;
                  externalRefresh(exportStore);
              },
          });
      }
  }
  const exportStore = new ExportStore();

  const ExportData = component("<>", class ExportDataComponent extends MintScope {
      constructor() {
          super();
          exportStore.connect(this);
      }
  }, null, [
      node("section", { class: "other-content__container" }, [
          node("form", {
              name: "export-data",
              class: "form flex",
              mRef: mRef("formElementRef"),
          }, [
              node("h2", { class: "width-full reset-margin margin-bottom-small" }, "{currentTitle}"),
              div(node(Field, {
                  type: "checkbox",
                  label: "Only items",
                  "[checked]": "onlyItems",
                  "[onInput]": "onChangeOnlyItems",
              })),
              node(Field, {
                  type: "textarea",
                  label: "Export data",
                  name: "export-data",
                  wrapperClasses: "width-full",
                  "[value]": "currentValue",
                  fieldStyles: styles({
                      height: "300px",
                      "font-size": "1rem",
                      "line-height": "1.1rem",
                      resize: "none",
                  }),
              }),
          ]),
      ]),
  ]);

  const extractData = (object) => {
      const obj = new Item();
      const { title, message, items, colour } = object;
      // ** Be specific about properties to catch errors.
      obj.title = title !== null && title !== void 0 ? title : "";
      obj.message = message !== null && message !== void 0 ? message : "";
      items && (obj.items = items.map(extractData));
      obj.colour = colour !== null && colour !== void 0 ? colour : colours[0].colour;
      return obj;
  };
  class ImportStore extends Store {
      constructor() {
          super({
              importValue: "",
              currentTitle: new Resolver(() => {
                  const item = getItem(path.get().slice(1));
                  if (item === null)
                      return "";
                  return item.title;
              }),
              importFormElement: null,
              oninsert() {
                  importStore.importValue = "";
                  (() => __awaiter$1(this, void 0, void 0, function* () {
                      var _a, _b;
                      yield wait();
                      (_b = (_a = this.importFormElement) === null || _a === void 0 ? void 0 : _a["importValue"]) === null || _b === void 0 ? void 0 : _b.focus();
                  }))();
              },
              onInput(_, element) {
                  importStore.importValue = element.value;
              },
              onSubmit(event) {
                  event.preventDefault();
                  if (importStore.importValue === "") {
                      toast("No data input", "orange");
                      return;
                  }
                  try {
                      const parsed = JSON.parse(importStore.importValue);
                      const currentItem = getItem(path.get().slice(1));
                      if (parsed instanceof Array) {
                          const resolved = parsed.map(extractData);
                          currentItem.items.push(...resolved);
                      }
                      else {
                          const obj = extractData(parsed);
                          currentItem.items.push(obj);
                      }
                      saveData();
                      backToList();
                  }
                  catch (error) {
                      console.error(error);
                      toast("Could not parse this data", "tomato");
                  }
              },
          });
      }
  }
  const importStore = new ImportStore();

  class ImportDataComponent extends MintScope {
      constructor() {
          super();
          importStore.connect(this);
      }
  }
  const ImportData = component("div", ImportDataComponent, { class: "common-page" }, [
      node("div", { class: "other-content" }, node("section", { class: "other-content__container" }, [
          node("h2", { class: "no-margin" }, "Import into - {currentTitle}"),
          node("form", {
              class: "form",
              "(submit)": "onSubmit",
              mRef: mRef("importFormElement"),
          }, [
              node(Field, {
                  type: "textarea",
                  name: "importValue",
                  label: "Enter JSON data here",
                  "[value]": "importValue",
                  fieldStyles: styles({
                      height: "12rem",
                  }),
                  "[onInput]": "onInput",
              }),
              node(Button, {
                  type: "submit",
                  theme: "apple",
                  class: "button large padded",
                  label: "Import data",
              }),
          ]),
      ])),
  ]);

  class TreeStore extends Store {
      constructor() {
          super({
              showMessage: false,
              currentTitle: new Resolver(() => {
                  return listStore.item.title;
              }),
              currentList: new Resolver(() => {
                  return listStore.item.items;
              }),
              toggleShowMessage() {
                  treeStore.showMessage = !treeStore.showMessage;
                  externalRefresh(treeStore);
              },
          });
      }
  }
  const treeStore = new TreeStore();

  class TreeComponent extends MintScope {
      constructor() {
          super();
          this.tree = [];
          this.hasTree = new Resolver(function () {
              var _a;
              return ((_a = this.items) === null || _a === void 0 ? void 0 : _a.length) > 0;
          });
          this.showMessage = new Resolver(() => treeStore.showMessage);
          this.titleClasses = new Resolver(function () {
              return this.showMessage ? "bold" : "";
          });
          this.treeRepeater = () => node(Tree, { mIf: mIf("hasTree"), "[tree]": "items" });
      }
  }
  const Tree = component("ul", TreeComponent, { class: "tree" }, node("li", { mFor: mFor("tree"), mKey: "_i" }, [
      node("p", { "[class]": "titleClasses" }, "{title}"),
      node("p", { mIf: mIf("showMessage"), class: "tree__message font-size-small" }, "{message}"),
      node(template({ conditionedBy: "showMessage" }, "treeRepeater")),
  ]));

  class TreeViewComponent extends MintScope {
      constructor() {
          super();
          treeStore.connect(this);
      }
  }
  const TreeView = component("section", TreeViewComponent, { class: "other-content__container" }, [
      node(Field, {
          type: "checkbox",
          wrapperClasses: "margin-bottom",
          label: "Show message",
          "[checked]": "showMessage",
          id: "show-messages-field",
          "[onInput]": "toggleShowMessage",
      }),
      node("h2", { class: "other-content__title" }, "{currentTitle}"),
      node(Tree, { "[tree]": "currentList" }),
  ]);

  class SearchByTitleComponent extends MintScope {
      constructor() {
          super();
          this.includeMessage = new Resolver(() => searchStore.includeMessage);
          this.onCheckIncludeMessage = new Resolver(() => searchStore.onCheckIncludeMessage);
          this.showNoItemFound = new Resolver(() => searchStore.showNoItemFound);
          this.results = new Resolver(() => searchStore.results);
          this.fromMessageClass = new Resolver(() => searchStore.fromMessageClass);
          this.selectRoute = new Resolver(() => searchStore.selectRoute);
      }
  }
  const SearchByTitle = component("div", SearchByTitleComponent, { class: "padding" }, [
      div({ class: "padding-bottom" }, node(Field, {
          type: "checkbox",
          label: "Include message",
          name: "include-message",
          "[checked]": "includeMessage",
          "[onInput]": "onCheckIncludeMessage",
      })),
      div({ mIf: mIf("showNoItemFound") }, "-- No items found --"),
      node("ul", { class: "list" }, node("li", {
          mFor: mFor("results"),
          mKey: "_i",
          class: "card relative pointer hover {fromMessageClass}",
          style: styles({ "margin-bottom": "2px" }),
          "(click)": "selectRoute",
      }, [
          span({
              class: "absolute smoke-text font-size-small",
              style: styles({ top: "2px", left: "2px" }),
          }, "{path}"),
          span("{title}"),
      ])),
  ]);

  class SearchByTagComponent extends MintScope {
      constructor() {
          super();
          this.showNoTabItemFound = new Resolver(() => searchStore.showNoTabItemFound);
          this.tagSearchResults = new Resolver(() => searchStore.tagSearchResults);
          this.fromMessageClass = new Resolver(() => searchStore.fromMessageClass);
          this.selectRoute = new Resolver(() => searchStore.selectRoute);
      }
  }
  const SearchByTag = component("div", SearchByTagComponent, { class: "padding" }, [
      div({ mIf: mIf("showNoTabItemFound") }, "-- No items found --"),
      node("ul", { class: "list" }, node("li", {
          mFor: mFor("tagSearchResults"),
          mKey: "_i",
          class: "card relative pointer hover {fromMessageClass}",
          style: styles({ "margin-bottom": "2px" }),
          "(click)": "selectRoute",
      }, [
          span({
              class: "absolute smoke-text font-size-small",
              style: styles({ top: "2px", left: "2px" }),
          }, "{path}"),
          span("{title}"),
      ])),
  ]);

  const resolveIsOnMessage = (message, includeMessage, value) => {
      if (!includeMessage)
          return false;
      if (message instanceof Array)
          return false;
      return message.toLowerCase().includes(value.toLowerCase());
  };
  const getPath$1 = (route) => {
      // ** We start at the current Item we're in.
      let currentItem = listStore.item;
      // ** We will output a collection of titles that represent the route.
      const outputPath = [currentItem.title];
      for (let locationIndex of route) {
          const newItem = currentItem.items[locationIndex];
          outputPath.push(newItem.title);
          currentItem = newItem;
      }
      return outputPath.join(" / ");
  };
  // ** Recursive function that looks through each item and its items to match against the
  // ** title or the title AND message.
  const searchItems = (list, value, { includeMessage }, output = [], currentRoute = []) => {
      for (let [index, { title, message, items }] of list.entries()) {
          const isOnTitle = title.toLowerCase().includes(value.toLowerCase());
          const isOnMessage = resolveIsOnMessage(message, includeMessage, value);
          if (isOnTitle || isOnMessage) {
              // ** Current route defines the path to get to this item e.g. [0,2,1].
              // ** Here we extend the currentRoute to get to this item.
              const route = [...currentRoute, index];
              // ** The path is the word representation of the route.
              const path = getPath$1(route);
              output.push({ title, route, path, isOnTitle });
          }
          if (items instanceof Array) {
              searchItems(items, value, { includeMessage }, output, [
                  ...currentRoute,
                  index,
              ]);
          }
      }
      return output;
  };

  const getPath = (route) => {
      // ** We start at the current Item we're in.
      let currentItem = listStore.item;
      // ** We will output a collection of titles that represent the route.
      const outputPath = [currentItem.title];
      for (let locationIndex of route) {
          const newItem = currentItem.items[locationIndex];
          outputPath.push(newItem.title);
          currentItem = newItem;
      }
      return outputPath.join(" / ");
  };
  // ** Recursive function that looks through each item and its items to match against the
  // ** title or the title AND message.
  const searchItemTags = (list, value, output = [], currentRoute = []) => {
      for (let [index, { title, items, tags = [] }] of list.entries()) {
          if (!!tags.find(({ tag }) => tag.includes(value))) {
              // ** Current route defines the path to get to this item e.g. [0,2,1].
              // ** Here we extend the currentRoute to get to this item.
              const route = [...currentRoute, index];
              // ** The path is the word representation of the route.
              const path = getPath(route);
              output.push({ title, route, path });
          }
          if (items instanceof Array) {
              searchItemTags(items, value, output, [...currentRoute, index]);
          }
      }
      return output;
  };

  const tabs = [new Tab("By title", () => node(SearchByTitle)), new Tab("By Tag", () => node(SearchByTag))];
  const update = (_, element) => {
      searchStore.value = element.value;
  };
  const runSearch = (event) => {
      event.preventDefault();
      const { value } = searchStore;
      if (value === "") {
          searchStore.value = "";
          searchStore.results = [];
          searchStore.tagSearchResults = [];
          externalRefresh(searchStore);
          return;
      }
      const { items } = getItem(path.get().slice(1));
      const { includeMessage } = searchStore;
      const results = searchItems(items, value, { includeMessage });
      searchStore.results = results;
      const tagSearchResults = searchItemTags(items, value);
      searchStore.tagSearchResults = tagSearchResults;
      searchStore.searchRun = true;
      externalRefresh(searchStore);
  };
  const selectRoute = function () {
      path.set(["list", ...path.get().slice(1), ...this.route]);
      searchStore.value = "";
      searchStore.results = [];
      searchStore.tagSearchResults = [];
      externalRefresh(appStore);
  };
  class SearchStore extends Store {
      constructor() {
          super({
              value: "",
              results: [],
              tagSearchResults: [],
              formElementRef: null,
              searchRun: false,
              includeMessage: true,
              tabs,
              currentTab: tabs[0],
              currentTitle: new Resolver(() => {
                  const item = getItem(path.get().slice(1));
                  if (item === null)
                      return "";
                  return item.title;
              }),
              showNoItemFound: new Resolver(() => {
                  return searchStore.searchRun && searchStore.results.length === 0;
              }),
              showNoTabItemFound: new Resolver(() => {
                  return searchStore.searchRun && searchStore.tagSearchResults.length === 0;
              }),
              fromMessageClass: new Resolver(function () {
                  return this.isOnTitle ? "" : "border-left-blueberry";
              }),
              update,
              runSearch,
              selectRoute,
              onCheckIncludeMessage(_, element) {
                  searchStore.includeMessage = element.checked;
              },
              oninsert: function () {
                  var _a, _b;
                  return __awaiter$1(this, void 0, void 0, function* () {
                      searchStore.value = "";
                      searchStore.results = [];
                      searchStore.tagSearchResults = [];
                      searchStore.searchRun = false;
                      yield wait();
                      (_b = (_a = searchStore.formElementRef) === null || _a === void 0 ? void 0 : _a.search) === null || _b === void 0 ? void 0 : _b.focus();
                  });
              },
          });
      }
  }
  const searchStore = new SearchStore();

  class SearchComponent extends MintScope {
      constructor() {
          super();
          searchStore.connect(this);
      }
  }
  const Search = component("<>", SearchComponent, null, [
      node("section", { class: "other-content__container" }, [
          node("h2", { class: "reset-margin margin-bottom-small" }, "{currentTitle}"),
          node("form", {
              class: "flex",
              "(submit)": "runSearch",
              autocomplete: "off",
              mRef: mRef("formElementRef"),
          }, [
              div({ class: "flex width-full" }, [
                  node(Field, {
                      name: "search",
                      placeholder: "Search ...",
                      wrapperClasses: "flex-grow margin-right-small",
                      "[value]": "value",
                      "[onInput]": "update",
                  }),
                  node(Button, {
                      type: "submit",
                      icon: "search",
                      class: "square",
                  }),
              ]),
          ]),
          node(Tabs, {
              "[tabs]": "tabs",
          }),
      ]),
  ]);

  const createLine = (svgElement, attributes) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      Object.entries(attributes).forEach(([key, value]) => {
          line.setAttribute(key, String(value));
      });
      svgElement.append(line);
  };

  // import { createRect } from "./create-rect.service";
  const addBorder = function () {
      const that = this;
      const { x: x1, y } = that.offset;
      const y1 = that.graphHeight + y;
      const common = {
          x1,
          y1,
          style: `stroke-width: 1px; stroke: ${that.options.borderColour};`,
          // style: `stroke-width: 5px; stroke: pink;`,
      };
      // Vertical
      createLine(that.element, Object.assign(Object.assign({}, common), { x2: x1, y2: y }));
      // Horizontal
      createLine(that.element, Object.assign(Object.assign({}, common), { x2: x1 + that.graphWidth, y2: y1 }));
      // createRect(that.element, {
      //   x: that.offset.x,
      //   y: that.offset.y,
      //   width: that.graphWidth,
      //   height: that.graphHeight,
      //   style: "fill: rgba(0, 100, 0, 0.2);",
      // });
  };

  const isValidElement = (element) => {
      const valid = element.nodeName === "svg" || element.nodeName === "canvas";
      return valid;
  };

  const createRect = (svgElement, attributes) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      Object.entries(attributes).forEach(([key, value]) => {
          rect.setAttribute(key, String(value));
      });
      svgElement.append(rect);
      return rect;
  };

  const defaultTextHeight = 16;
  const textLineHeight = 1.2;
  const defaultXTextSize = (defaultTextHeight * 7) / 16;
  const defaultPointColour = "#000";
  const defaultLineColour = "#000";
  const defaultPointSize = 2;
  const defaultLinkThickness = 1;
  const defaultBorderColour = "#000";
  const defaultInterval = 0.2;

  const createText = (svgElement, attributes = {}, textContent = "") => {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("font-size", defaultTextHeight.toString());
      Object.entries(attributes).forEach(([key, value]) => {
          text.setAttribute(key, String(value));
      });
      text.textContent = textContent;
      svgElement.append(text);
      return text;
  };

  const reset = function () {
      const that = this;
      Array.from(that.element.children).forEach((x) => that.element.removeChild(x));
  };

  const getMax = (data, property) => {
      return data.reduce((a, b) => (b[property] > a ? b[property] : a), -Infinity);
  };

  const getMin = (data, property) => {
      return data.reduce((a, b) => (b[property] < a ? b[property] : a), Infinity);
  };

  const resolveInformation = function () {
      const that = this;
      const element = that.element;
      const data = that.lineData;
      const { clientWidth: width, clientHeight: height } = element;
      // This is the edge around the SVG elements and the SVG Element.
      const gap = that.options.pointSize * 2;
      that.graphWidth = width * 0.9 - gap;
      this.graphHeight = height * 0.9 - gap;
      that.minX = getMin(data, "x");
      that.maxX = getMax(data, "x");
      this.minY = this.options.minY;
      this.maxY = (() => {
          const maxY = this.options.maxY;
          return this.minY === maxY ? this.minY + 1 : maxY;
      })();
      this.offset = { x: width * 0.1, y: gap };
      const deltaX = that.maxX - that.minX;
      const deltaY = that.maxY - that.minY;
      that.xPart = that.graphWidth / deltaX;
      that.yPart = that.graphHeight / deltaY;
  };

  const generateChartLines = function () {
      const that = this;
      const data = that.lineData;
      that.addLines.apply(that, [data]);
      that.addCircles.apply(that, [data]);
  };

  const transform = (x, y) => `transform-origin: ${x}px ${y}px; transform: rotate(90deg);`;
  const addLabels = function () {
      const that = this;
      const data = that.lineData;
      // ** Top and bottom of y labels
      // createText(that.element, { x: 0, y: defaultTextHeight }, String(that.maxY));
      // createText(that.element, { x: 0, y: that.graphHeight }, String(that.minY));
      const textSize = defaultXTextSize;
      // let pacing = 0;
      const delta = that.graphWidth / (data.length - 1);
      data.forEach((point, index) => {
          // if (index === data.length - 1) return;
          // const x = point.x * that.xPart - that.xPart * that.minX + that.offset.x + 0;
          // const y = that.graphHeight;
          // if (pacing < textSize) {
          //   pacing += textSize;
          //   createText(
          //     that.element,
          //     {
          //       x,
          //       y,
          //       "font-size": defaultXTextSize,
          //       style: that.options.xLabelsAreVertical ? transform(x, y) : "",
          //     },
          //     point.label
          //   );
          // } else {
          //   pacing = 0;
          // }
          const x = that.offset.x + delta * index - textSize / 2;
          const y = that.offset.y + that.graphHeight + textSize / 2;
          createText(that.element, {
              x,
              y,
              "font-size": textSize,
              style: that.options.xLabelsAreVertical ? transform(x, y) : "",
          }, point.label);
          if (index !== 0) {
              const x1 = x + textSize / 2;
              createLine(that.element, {
                  x1: x1,
                  y1: y,
                  x2: x1,
                  y2: that.offset.y,
                  style: `stroke-width: 1px; stroke: ${that.options.borderColour};`,
              });
          }
      });
  };

  const toSignificantFigures = (num, figures) => {
      const str = String(num);
      const digits = str.split("");
      if (digits[0] === "0" && digits[1] !== ".") {
          throw "Whoops";
      }
      let i = 0;
      let added = 0;
      const output = [];
      while (i < digits.length && added < figures) {
          const item = digits[i];
          i++;
          output.push(item);
          if (item === ".")
              continue;
          if (item === "0" && added === 0)
              continue;
          added++;
      }
      return output.join("");
  };

  const addIntervals = function () {
      const that = this;
      // const yTextsWeCanHave = Math.floor(
      //   (that.element.clientHeight - defaultTextHeight) / (defaultTextHeight * 2)
      // );
      // const interval = Number(
      //   toSignificantFigures(String((that.maxY - that.minY) / yTextsWeCanHave), 3)
      // );
      // const intervals = [0];
      // const delta = that.maxY - that.minY;
      const intervals = [];
      {
          let i = that.minY;
          while (i < that.maxY) {
              intervals.push(i);
              i = Number(toSignificantFigures(i + that.options.interval, 3));
          }
      }
      const spacing = that.graphHeight / intervals.length;
      intervals.push(that.maxY);
      // {
      //   let i = interval;
      //   while (i <= delta) {
      //     intervals.push(i);
      //     i += interval;
      //   }
      // }
      const x1 = that.offset.x;
      const x2 = that.offset.x + that.graphWidth;
      intervals.reverse().forEach((interval, index) => {
          //   const yIndexPart = (that.minY + i) * that.yPart;
          //   const yIndexPartPrevious = that.yPart * that.minY;
          //   const offset = that.offset.y;
          //   const y = that.graphHeight - (yIndexPart - yIndexPartPrevious + offset);
          const y = that.offset.y + spacing * index;
          if (index !== intervals.length - 1) {
              createLine(that.element, {
                  x1,
                  y1: y,
                  x2,
                  y2: y,
                  style: `stroke-width: 1px; stroke: ${that.options.borderColour};`,
              });
          }
          //   const value = round(that.minY + i);
          createText(that.element, { x: that.options.pointSize, y: y + defaultTextHeight / 2 }, String(interval));
      });
  };

  // import { defaultXTextSize } from "../../data/default-data";
  const addLines = function (data) {
      const that = this;
      const lineColour = that.options.lineColour;
      const lineThickness = that.options.lineThickness;
      // const textSize = defaultXTextSize;
      // let pacing = 0;
      data.forEach((point, index) => {
          if (index === 0) {
              // pacing += textSize;
              return;
          }
          const [cx, cy] = [
              point.x * that.xPart - that.xPart * that.minX + that.offset.x,
              that.graphHeight -
                  (point.y * that.yPart - that.yPart * that.minY + that.offset.y),
          ];
          const previous = data[index - 1];
          const [previousCX, previousCY] = [
              previous.x * that.xPart - that.xPart * that.minX + that.offset.x,
              that.graphHeight -
                  (previous.y * that.yPart - that.yPart * that.minY + that.offset.y),
          ];
          // if (pacing < textSize) {
          //   pacing += textSize;
          //   createLine(that.element, {
          //     x1: cx,
          //     y1: 0,
          //     x2: cx,
          //     y2: that.graphHeight,
          //     style: `stroke-width:1px;stroke:lightgrey;`,
          //   });
          // } else {
          //   pacing = 0;
          // }
          createLine(that.element, {
              x1: previousCX,
              y1: previousCY,
              x2: cx,
              y2: cy,
              style: `stroke-width: ${lineThickness}px; stroke: ${lineColour};`,
          });
      });
  };

  const createCircle = (svgElement, attributes) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      Object.entries(attributes).forEach(([key, value]) => {
          circle.setAttribute(key, String(value));
      });
      svgElement.append(circle);
      return circle;
  };

  const addCircles = function (data) {
      const that = this;
      const pointColour = that.options.pointColour;
      const pointSize = that.options.pointSize;
      data.forEach((point) => {
          const [cx, cy] = [
              point.x * that.xPart - that.xPart * that.minX + that.offset.x,
              that.graphHeight -
                  (point.y * that.yPart - that.yPart * that.minY + that.offset.y),
          ];
          const circle = createCircle(that.element, {
              cx,
              cy,
              r: pointSize,
              // style: `stroke: ${pointColour}; fill: transparent;`,
              style: `stroke: ${pointColour}; fill: ${pointColour};`,
          });
          circle.addEventListener("mouseenter", () => {
              const [rect, text] = that.tooltip;
              that.element.append(rect);
              that.element.append(text);
              const x = cx + 140 + 10 + 5 > that.element.clientWidth
                  ? that.element.clientWidth - (140 + 10)
                  : cx + 10;
              rect.setAttribute("x", String(x));
              rect.setAttribute("y", String(cy + 10));
              text.setAttribute("x", String(x + 5));
              text.setAttribute("y", String(cy + 10 + defaultTextHeight));
              text.textContent = `${point.label} -- ${point.y}`;
          });
          circle.addEventListener("mouseleave", () => {
              const [rect, text] = that.tooltip;
              rect.parentElement.removeChild(rect);
              text.parentElement.removeChild(text);
          });
      });
  };

  const resolveOptions = (_options, lineData) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
      const options = {
          tooltip: (_a = _options.tooltip) !== null && _a !== void 0 ? _a : false,
          minY: (_b = _options.minY) !== null && _b !== void 0 ? _b : getMin(lineData, "y"),
          maxY: (_c = _options.maxY) !== null && _c !== void 0 ? _c : getMax(lineData, "y"),
          borderColour: (_d = _options.borderColour) !== null && _d !== void 0 ? _d : defaultBorderColour,
          lineColour: (_e = _options.lineColour) !== null && _e !== void 0 ? _e : defaultLineColour,
          lineThickness: (_f = _options.lineThickness) !== null && _f !== void 0 ? _f : defaultLinkThickness,
          pointColour: (_g = _options.pointColour) !== null && _g !== void 0 ? _g : defaultPointColour,
          pointSize: (_h = _options.pointSize) !== null && _h !== void 0 ? _h : defaultPointSize,
          xLabelsAreVertical: (_j = _options.xLabelsAreVertical) !== null && _j !== void 0 ? _j : true,
          interval: (_k = _options.interval) !== null && _k !== void 0 ? _k : defaultInterval,
      };
      return options;
  };

  class Line {
      constructor(element, lineData, options = {}) {
          this.reset = reset;
          this.resolveInformation = resolveInformation;
          this.generateChartLines = generateChartLines;
          this.addBorder = addBorder;
          this.addLabels = addLabels;
          this.addIntervals = addIntervals;
          this.addLines = addLines;
          this.addCircles = addCircles;
          if (!isValidElement(element))
              throw new Error("Element provided to Line not a HTMLElement");
          this.element = element;
          this.lineData = lineData;
          this.options = resolveOptions(options, lineData);
          this.tooltip = null;
          if (this.options.tooltip === true) {
              this.tooltip = [
                  createRect(element, {
                      width: 140,
                      height: defaultTextHeight * textLineHeight + 2,
                      style: "stroke: #000; stroke-width: 1px; fill: #fff;",
                  }),
                  createText(element),
              ];
          }
          this.graphWidth = null;
          this.graphHeight = null;
          this.xPart = null;
          this.yPart = null;
          this.minX = null;
          this.maxX = null;
          this.minY = null;
          this.maxY = null;
          (function init() {
              this.reset();
              this.resolveInformation();
              this.addBorder();
              this.addIntervals();
              this.addLabels();
              this.generateChartLines();
          }).apply(this);
      }
  }

  const flattenData = (() => {
      let index = 0;
      return (list, arr) => {
          if (!(arr instanceof Array)) {
              arr = [];
              index = 0;
          }
          list.forEach((item) => {
              if (item.title.includes(" -- ")) {
                  const [label, y] = item.title.split(" -- ");
                  arr.push({ x: index++, y: parseFloat(y), label });
              }
              item.items instanceof Array && flattenData(item.items, arr);
          });
          return arr;
      };
  })();
  const loadData = () => {
      const data = flattenData(graphStore.currentList);
      const maxY = Math.ceil(data.reduce((a, b) => (b.y > a ? b.y : a), -Infinity));
      const minY = Math.floor(data.reduce((a, b) => (b.y < a ? b.y : a), Infinity));
      new Line(graphStore.svgElementRef, data, {
          xLabelsAreVertical: true,
          borderColour: "lightgrey",
          pointColour: "#3d7fe3",
          lineColour: "#3d7fe3",
          pointSize: 3,
          tooltip: true,
          maxY,
          minY,
          interval: 0.5,
      });
  };
  class GraphStore extends Store {
      constructor() {
          super({
              currentTitle: new Resolver(() => {
                  const item = getItem(path.get().slice(1));
                  if (item === null)
                      return "";
                  return item.title;
              }),
              currentList: new Resolver(() => {
                  const item = getItem(path.get().slice(1));
                  if (item === null)
                      return [];
                  return item.items;
              }),
              svgClass: new Resolver(() => {
                  return `visibility: ${graphStore.showGraph ? "visible" : "hidden"};`;
              }),
              showGraph: false,
              svgElementRef: null,
              oninsert: function () {
                  return __awaiter$1(this, void 0, void 0, function* () {
                      graphStore.showGraph = false;
                      yield wait();
                      externalRefresh(graphStore);
                      yield wait(300);
                      graphStore.showGraph = true;
                      externalRefresh(graphStore);
                      loadData();
                  });
              },
          });
      }
  }
  const graphStore = new GraphStore();

  class GraphviewComponent extends MintScope {
      constructor() {
          super();
          graphStore.connect(this);
      }
  }
  const GraphView = component("section", GraphviewComponent, { class: "common-page" }, [
      node("div", { class: "other-content__container" }, [
          node("div", { class: "other-content__title margin-bottom" }, "{currentTitle}"),
          div({
              mIf: mIf("!showGraph"),
          }, "Loading..."),
          node("svg", {
              mIf: mIf("showGraph"),
              class: "svgClass",
              viewBox: "0 0 836 420",
              style: styles({
                  width: "836px",
                  height: "420px",
              }),
              mRef: mRef("svgElementRef"),
          }),
      ]),
  ]);

  class HeatmapComponent extends MintScope {
      constructor() {
          super();
          heatmapStore.connect(this);
      }
  }
  const Heatmap = component("section", HeatmapComponent, { class: "common-page" }, [
      node("h2", { class: "reset-margin margin-bottom" }, "Heat map"),
      div({ mIf: mIf("!isEditing") }, [
          node("p", { class: "reset-margin margin-bottom" }, "{month} - {year}"),
          node("ul", { class: "list flex", style: "width:224px;" }, node("li", {
              mFor: mFor("weekDays"),
              mKey: "_i",
              class: "relative width height",
          }, span({ class: "block absolute middle bold" }, "{_x}"))),
          node("ul", { class: "list flex", style: "width:224px;" }, node("li", {
              mFor: mFor("heatmap"),
              mKey: "_i",
              class: "relative width height",
          }, [
              node("span", {
                  mIf: mIf("hidden"),
                  class: "block absolute middle width height smoke-bg border rounded unselect",
              }),
              node("span", {
                  mIf: mIf("!hidden"),
                  class: "block absolute middle width height border rounded {getShadow} text-centre line-height bold font-size-small hover pointer unselect",
                  "[title]": "title",
                  "[style]": "style",
                  "(click)": "editHeatmap",
              }, "{day}"),
          ])),
      ]),
      div({ mIf: mIf("isEditing") }, [
          div({ class: "margin-bottom" }, node(Button, {
              icon: "level-up",
              square: true,
              large: true,
              onClick() {
                  heatmapStore.isEditing = false;
                  externalRefresh(heatmapStore);
              },
          })),
          node("p", { class: "reset-margin margin-bottom" }, "Edit date: {editingDate}"),
          node(Message, { "[message]": "message" }),
      ]),
  ]);

  class AltButtonsComponent extends MintScope {
      constructor() {
          super();
          this.backToList = () => {
              if (manageStore.toEditMethod === "item-button") {
                  path.set(path.get().slice(0, -1));
                  manageStore.toEditMethod = "main-button";
              }
              backToList();
          };
      }
  }
  const AltButtons = component("div", AltButtonsComponent, { class: "alt-buttons" }, node("ul", { class: "list" }, node("li", null, node(Button, {
      theme: "blueberry",
      icon: "arrow-left",
      large: true,
      square: true,
      "[onClick]": "backToList",
  }))));

  class PrimaryButtonsComponent extends MintScope {
      constructor() {
          super();
          appButtonsStore.connect(this);
      }
  }
  const PrimaryButtons = component("div", PrimaryButtonsComponent, null, [
      div({
          mIf: mIf("isList"),
          mRef: mRef("appButtonsElement"),
          class: "list-page__main-buttons",
      }, "_children"),
      node(AltButtons, { mIf: mIf("!isList") }),
  ]);

  const addItem = () => {
      changePage("manage");
      externalRefresh(appStore);
  };

  class AddAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.addItem = addItem;
      }
  }
  const AddAppButton = component("<>", AddAppButtonComponent, {}, node(Button, {
      theme: "blueberry",
      icon: "plus",
      title: "Add",
      large: true,
      square: true,
      class: "main-button--add margin-right-small",
      id: "add-button",
      "[onClick]": "addItem",
  }));

  const editItem = () => {
      if (!(listStore.item instanceof Item) &&
          listStore.item.root !== true)
          return;
      manageStore.editItem = listStore.item;
      path.set(["manage", ...path.get().slice(1)]);
      manageStore.toEditMethod = "main-button";
      externalRefresh(appStore);
  };

  const appButtonProps = {
      large: true,
      square: true,
      class: "margin-right-small",
  };

  class EditAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.editItem = editItem;
      }
  }
  const EditAppButton = component("<>", EditAppButtonComponent, null, node(Button, {
      theme: "apple",
      icon: "pencil",
      title: "Edit this item",
      mExtend: mExtend(appButtonProps),
      "[onClick]": "editItem",
  }));

  class UpLevelAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.showButton = new Resolver(() => {
              return path.get().length > 1;
          });
          this.upLevel = upLevel;
      }
  }
  const UpLevelAppButton = component("<>", UpLevelAppButtonComponent, {}, node(Button, {
      mIf: mIf("showButton"),
      theme: "snow",
      icon: "level-up",
      title: "Up one level",
      mExtend: mExtend(appButtonProps),
      id: "up-level-button",
      "[onClick]": "upLevel",
  }));

  const upToRoot = () => {
      path.set(path.get().slice(0, 1));
      externalRefresh(appButtonsStore);
      externalRefresh(listStore);
  };

  class UpToRootAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.upToRoot = upToRoot;
          this.disabled = () => path.get().length === 1;
      }
  }
  const UpToRootAppButton = component("<>", UpToRootAppButtonComponent, {}, node(Button, {
      theme: "orange",
      icon: "home",
      title: "Up to root",
      mExtend: mExtend(appButtonProps),
      id: "up-to-root",
      "[onClick]": "upToRoot",
      "[disabled]": "disabled",
  }));

  const pasteItems = () => {
      const { pasteItems } = appStore.rootData;
      listStore.list.push(...pasteItems);
      pasteItems.length = 0;
      saveData();
      externalRefresh(appButtonsStore);
      externalRefresh(listStore);
  };

  class PasteAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.hasPasteItems = new Resolver(() => { var _a; return !!((_a = appStore.rootData) === null || _a === void 0 ? void 0 : _a.pasteItems.length); });
          this.pasteItems = pasteItems;
          this.pastItemsCount = new Resolver(() => {
              return appStore.rootData.pasteItems.length.toString();
          });
      }
  }
  const PasteAppButton = component("<>", PasteAppButtonComponent, null, node(Button, {
      mIf: mIf("hasPasteItems"),
      theme: "apple",
      icon: "paint-brush",
      extraButtonLabel: [node("span", null, "{pastItemsCount}")],
      title: "Paste items",
      id: "paste-item-button",
      mExtend: mExtend(appButtonProps),
      "[onClick]": "pasteItems",
      "[pastItemsCount]": "pastItemsCount",
  }));

  const saveToFile = () => {
      window.dispatchEvent(new CustomEvent("saveToFile", { detail: appStore.rootData }));
  };

  class SaveAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.save = saveToFile;
      }
  }
  const SaveAppButton = component("<>", SaveAppButtonComponent, null, node(Button, {
      theme: "blueberry",
      icon: "floppy-o",
      title: "Save data to file",
      mExtend: mExtend(appButtonProps),
      "[onClick]": "save",
  }));

  class SecondaryButtonsComponent extends MintScope {
      constructor() {
          super();
          this.isList = new Resolver(() => appButtonsStore.isList);
      }
  }
  const SecondaryButtons = component("div", SecondaryButtonsComponent, null, [
      div({
          mIf: mIf("isList"),
          class: "list-page__main-buttons",
      }, "_children"),
  ]);

  class ExportAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.openExport = function () {
              path.set(["export", ...path.get().slice(1)]);
              externalRefresh(appStore);
          };
      }
  }
  const ExportAppButton = component("<>", ExportAppButtonComponent, null, node(Button, {
      theme: "apple",
      icon: "upload",
      title: "Export",
      mExtend: mExtend(appButtonProps),
      "[onClick]": "openExport",
  }));

  class ImportAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.openImport = function () {
              path.set(["import", ...path.get().slice(1)]);
              externalRefresh(appStore);
          };
      }
  }
  const ImportAppButton = component("<>", ImportAppButtonComponent, null, node(Button, {
      theme: "snow",
      icon: "download",
      title: "Import",
      mExtend: mExtend(appButtonProps),
      "[onClick]": "openImport",
  }));

  class TreeAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.openTreeView = function () {
              path.set(["tree", ...path.get().slice(1)]);
              externalRefresh(appStore);
          };
      }
  }
  const TreeAppButton = component("<>", TreeAppButtonComponent, null, node(Button, {
      theme: "snow",
      icon: "list",
      title: "Show tree view",
      id: "tree-button",
      mExtend: mExtend(appButtonProps),
      "[onClick]": "openTreeView",
  }));

  class SearchAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.openSearch = function () {
              path.set(["search", ...path.get().slice(1)]);
              externalRefresh(appStore);
          };
      }
  }
  const SearchAppButton = component("<>", SearchAppButtonComponent, null, node(Button, {
      theme: "blueberry",
      icon: "search",
      title: "Search",
      mExtend: mExtend(appButtonProps),
      "[onClick]": "openSearch",
  }));

  class GraphAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.showButton = new Resolver(() => {
              var _a;
              return (_a = listStore.item.actions) === null || _a === void 0 ? void 0 : _a.includes("charts");
          });
          this.openGraph = function () {
              path.set(["graph-view", ...path.get().slice(1)]);
              externalRefresh(appStore);
          };
      }
  }
  const GraphAppButton = component("<>", GraphAppButtonComponent, null, node(Button, {
      mIf: mIf("showButton"),
      theme: "snow",
      icon: "line-chart",
      title: "Graph",
      mExtend: mExtend(appButtonProps),
      "[onClick]": "openGraph",
  }));

  class HeatmapAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.showButton = new Resolver(() => {
              var _a;
              return (_a = listStore.item.actions) === null || _a === void 0 ? void 0 : _a.includes("heatmap");
          });
          this.openHeatmap = function () {
              path.set(["heatmap", ...path.get().slice(1)]);
              externalRefresh(appStore);
          };
      }
  }
  const HeatmapAppButton = component("<>", HeatmapAppButtonComponent, null, node(Button, {
      mIf: mIf("showButton"),
      theme: "blueberry",
      icon: "list",
      title: "Heatmap",
      mExtend: mExtend(appButtonProps),
      "[onClick]": "openHeatmap",
  }));

  // ** Make sure non of these are ids on any elements or the page will scroll there.
  const allRoutes = [
      ["list", node(List)],
      ["manage", node(Manage)],
      ["export", node(ExportData)],
      ["import", node(ImportData)],
      ["tree", node(TreeView)],
      ["search", node(Search)],
      ["graph-view", node(GraphView)],
      ["heatmap", node(Heatmap)],
  ];

  const allPrimaryButtons = [
      node(AddAppButton),
      node(EditAppButton),
      node(UpLevelAppButton),
      node(UpToRootAppButton),
      node(PasteAppButton),
  ];
  const AllPrimaryButtons = component("<>", null, null, [
      node(PrimaryButtons, null, [...allPrimaryButtons]),
  ]);

  const cutAllItems = () => {
      const { item } = listStore;
      const { items } = item;
      appStore.rootData.pasteItems.push(...items);
      item.items.length = 0;
      saveData();
      externalRefresh(appButtonsStore);
      externalRefresh(listStore);
  };

  class CutAllAppButtonComponent extends MintScope {
      constructor() {
          super();
          this.cutAllItems = cutAllItems;
      }
  }
  const CutAllAppButton = component("<>", CutAllAppButtonComponent, null, node(Button, {
      theme: "orange",
      icon: "scissors",
      title: "Cut all items",
      id: "cut-all-item-button",
      mExtend: mExtend(appButtonProps),
      "[onClick]": "cutAllItems",
  }));

  const allSecondaryButtons = [
      node(ExportAppButton),
      node(ImportAppButton),
      node(TreeAppButton),
      node(SearchAppButton),
      node(GraphAppButton),
      node(HeatmapAppButton),
      node(CutAllAppButton),
      node(SaveAppButton),
  ];
  const AllSecondaryButtons = component("<>", null, null, [
      node(SecondaryButtons, null, [...allSecondaryButtons]),
  ]);

  oreganoSettings.sessionStorageKey = "oregano-5-key";
  oreganoSettings.breadcrumbs = true;
  const routes = allRoutes.map(([target, content]) => new Route({ target, type: RouteType$1["^"] }, content));
  const App = component("main", OreganoAppComponent, null, [
      node(Header, {
          headerTitle: "Oregano",
          version: _package.version,
      }),
      node(Content, null, [
          node(AllPrimaryButtons),
          node(AllSecondaryButtons),
          node(Pages, null, node(Router, { routes })),
      ]),
  ]);
  app(document.body, {}, node(App));

})();
