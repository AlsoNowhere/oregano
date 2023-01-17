export const path = {
  get() {
    return window.location.hash
      .slice(1)
      .split("/")
      .filter((x) => x !== "");
  },
  set(url) {
    window.location.hash = url.join("/");
  },
};
