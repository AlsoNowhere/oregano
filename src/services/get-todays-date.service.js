import { resolveLeadingZeroes } from "./resolve-leading-zeroes.service";

export const getTodaysDate = () => {
  const date = new Date();
  const [day, month, year] = [
    date.getDate(),
    date.getMonth() + 1,
    date.getFullYear(),
  ];
  return `${day}-${resolveLeadingZeroes(month)}-${resolveLeadingZeroes(year)}`;
};
