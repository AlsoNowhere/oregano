import { actionButtons } from "../data/action-buttons.data";

export const getActions = () =>
  actionButtons.reduce((a, { active, id }) => (active && a.push(id), a), []);

export const getActionAbles = (actions, match) => {
  const _actions = [];
  let i = 0;
  while (i < actions.length) {
    const x = actions[i];
    const a = actionButtons.find(({ id }) => id === x)?.action;
    if (a?.type === match) {
      _actions.push(a.value);
    }
    i++;
  }
  return _actions;
};
