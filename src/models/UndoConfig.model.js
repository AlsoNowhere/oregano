export const UndoConfig = function (type, { item, path, items }) {
  this.type = type;

  this.item = item;
  this.path = path;
  this.items = items;
};
