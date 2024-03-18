// import { getCheckbox } from "../services/render-message.service";

// const getNext = (str, i, x) => str.substr(i, x);

// export const extractHeatmap1 = (message: string) => {
//   const indexes = [];
//   {
//     let i = 0;
//     while (i < message.length) {
//       const next4 = getNext(message, i, 4);
//       if (next4 === "--c ") {
//         const endIndex = message.slice(i).indexOf("\n");
//         indexes.push({
//           start: i,
//           label: message
//             .slice(i)
//             .substr(4, endIndex === -1 ? Infinity : endIndex - 4),
//           state: false,
//         });
//       }

//       const next6 = getNext(message, i, 6);
//       if (next6 === "--c-c ") {
//         const endIndex = message.slice(i).indexOf("\n");
//         indexes.push({
//           start: i,
//           label: message
//             .slice(i)
//             .substr(6, endIndex === -1 ? Infinity : endIndex - 6),
//           state: true,
//         });
//       }

//       i++;
//     }
//   }

//   return indexes;
// };

export const extractHeatmap = (message: string, heat) => {
  const output: Array<string> = [];

  const splits = message.split("\n");

  splits.forEach((x) => {
    if (x === "") return;
    if (x.includes("--c")) {
      const start =
        x.indexOf("--c-c") !== -1
          ? x.indexOf("--c-c") + 6
          : x.indexOf("--c") + 4;
      const label = x.substring(start);
      if (heat[label] === 1) {
        output.push("--c-c " + label);
      } else {
        output.push("--c " + label);
      }
    }
  });

  return output.join("\n");

  // let _message = "";
  // let i = 0;
  // while (i < message.length) {
  //   const next4 = getNext(message, i, 4);
  //   if (next4 !== "--c ") {
  //     _message += message.charAt(i);
  //     i++;
  //     continue;
  //   }
  //   const endIndex = message.slice(i).indexOf("\n");
  //   const label = message
  //     .slice(i)
  //     .substr(4, endIndex === -1 ? Infinity : endIndex - 4);
  //   if (heat[label] === 1) {
  //     _message += "--c-c ";
  //   } else {
  //     _message += "--c ";
  //   }
  //   i += 4;

  //   // i++;
  // }
  // return _message;
};
