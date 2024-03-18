export const resolveLeadingZeroes = (number: number) => {
  return number < 10 ? `0${number}` : number;
};
