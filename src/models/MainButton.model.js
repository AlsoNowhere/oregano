export const MainButton = function (
  name,
  title,
  icon,
  theme,
  onClick,
  options = {}
) {
  this.name = name;
  this.title = title;
  this.icon = icon;
  this.theme = theme;
  this.onClick = onClick;

  this.disabled =
    options.disabled instanceof Function ? options.disabled : false;
  this.condition =
    options.condition instanceof Function ? options.condition : true;
  this.extraButtonLabel = options.extraButtonLabel;
};
