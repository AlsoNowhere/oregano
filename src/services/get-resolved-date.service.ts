import { resolveLeadingZeroes } from "./resolve-leading-zeroes.service";

export const getResolvedDate = (time = Date.now()) => {
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
