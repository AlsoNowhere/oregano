import { actionButtons } from "../data/action-buttons.data";

import { TAction } from "../types/TAction.type";

export const getActions = () =>
  actionButtons.reduce(
    (a, { active, id }) => (active && a.push(id), a),
    [] as Array<string>
  );

export const getActionAbles = (actions: Array<string>, match: string) => {
  const _actions: Array<TAction | string> = [];
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
