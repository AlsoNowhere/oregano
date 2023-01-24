const { ipcRenderer } = require("electron");

const fileService = require("fs");

window.addEventListener("DOMContentLoaded", () => {
  const selection = document.body.querySelector("main header div").children;
  const [minimiseButton, closeButton] = selection;

  minimiseButton.addEventListener("click", () => {
    ipcRenderer.send("minimize");
  });

  closeButton.addEventListener("click", () => {
    ipcRenderer.send("close");
  });
});

const getDateFileName = (function () {
  const resolveLeadingZeroes = (number) => {
    const string = number.toString();
    if (string.length === 2) return string;
    return "0" + string;
  };

  return () => {
    const { day, month, year } = (function () {
      const date = new Date();
      const _day = date.getDate();
      const _month = date.getMonth() + 1;
      const year = date.getFullYear();
      const day = resolveLeadingZeroes(_day);
      const month = resolveLeadingZeroes(_month);
      return { day, month, year };
    })();
    return `/data-save-${day}-${month}-${year}.json`;
  };
})();

const dataSavesFolderName = "data-saves";

const saveDataLocally = (function () {
  return (detail) => {
    const dir = fileService.readdirSync(__dirname);
    if (!dir.includes(dataSavesFolderName)) {
      fileService.mkdirSync(__dirname + "/" + dataSavesFolderName);
    }
    fileService.writeFileSync(
      __dirname + "/" + dataSavesFolderName + getDateFileName(),
      JSON.stringify(detail)
    );
  };
})();

window.addEventListener("saveToFile", ({ detail }) => {
  saveDataLocally(detail);
});

window.addEventListener("initial-data-save", ({ detail }) => {
  const dir = fileService.readdirSync(__dirname);
  if (!dir.includes(dataSavesFolderName)) {
    saveDataLocally(detail);
    return;
  }
  const dirContents = fileService.readdirSync(
    __dirname + "/" + dataSavesFolderName
  );
  if (dirContents.includes(getDateFileName())) return;
  saveDataLocally(detail);
});
