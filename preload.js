
const remote = require('electron').remote;

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

window.addEventListener('DOMContentLoaded', () => {



  // const replaceText = (selector, text) => {
  //   const element = document.getElementById(selector)
  //   if (element) element.innerText = text
  // }

  // for (const type of ['chrome', 'node', 'electron']) {
  //   replaceText(`${type}-version`, process.versions[type])
  // }

  const minimiseButton = document.body.children[0].children[1].children[0];
  minimiseButton.addEventListener("click",()=>{
    var window = remote.BrowserWindow.getFocusedWindow();
    window.minimize();
  });

  const headerButton = document.body.children[0].children[1].children[1];
  headerButton.addEventListener("click",()=>{
    var window = remote.getCurrentWindow();
    window.close();
  });




})
