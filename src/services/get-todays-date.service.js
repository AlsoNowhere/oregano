import { getDate } from "./get-date.service";

export const getTodaysDate = () => {
  // return getDate(Date.now());

  const { day, month, year } = getDate(Date.now());

  return `${day}-${month}-${year}`;
};
