import { resolveLeadingZeroes } from "./resolve-leading-zeroes.service";

export const getDate = (time) => {
  const date = new Date(time);
  const [minutes, hours, day, month, year] = [
    date.getMinutes(),
    date.getHours(),
    date.getDate(),
    date.getMonth() + 1,
    date.getFullYear(),
  ].map((x) => resolveLeadingZeroes(x));
  //   return `${day}-${month}-${year}`;
  return { minutes, hours, day, month, year };
};
