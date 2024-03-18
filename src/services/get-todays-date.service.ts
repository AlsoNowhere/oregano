// import { getDate } from "./get-date.service";

import { getDate } from "sage";

export const getTodaysDate = () => {
  // return getDate(Date.now());

  // const { day, month, year } = getDate(Date.now());

  // return `${day}-${month}-${year}`;
  return getDate(new Date(), "dd-mm-yyyy");
};
