// 标签页中的内容脚本
let max_zIndex = 10000;
let setIntervalDelay = 10000;
let setIntervalCtrl;
let zIndexOverflowHistory = [];
let pageAds = []; // 页面被隐藏的广告
const constTypes = {
  static: "static"
};
class HistoryElement {
  constructor(el, oldDisplay) {
    this.el = el;
    this.oldDisplay = oldDisplay;
  }

  update() {
    this.el.style["display"] = this.oldDisplay;
  }
}

function removePopUpsEvent() {
  let allElement = document.body.querySelectorAll("*");
  // 遍历页面上所有的元素
  for (let i = 0; i < allElement.length; i++) {
    const el = allElement[i];
    const position = getPV(el, "position");
    const zIndex = getPV(el, "z-index");
    if (
      position === constTypes.static ||
      !Number.isFinite(Number(zIndex)) ||
      !zIndex ||
      zIndex < max_zIndex
    ) {
      continue;
    }
    const oldDisplay = getPV(el, "display");
    zIndexOverflowHistory.push(new HistoryElement(el, oldDisplay));
    el.style["display"] = "none";
  }
}

function startRemovePopUpsEvent() {
  removePopUpsEvent();
  setIntervalCtrl = setInterval(removePopUpsEvent, setIntervalDelay);
}
startRemovePopUpsEvent();

// 需要移除的类名
let filters = [];
// 监听后台发来的消息
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.zIndex && msg.delay) {
    clearInterval(setIntervalCtrl);
    setIntervalCtrl = null;
    max_zIndex = Number(msg.zIndex);
    setIntervalDelay = Number(msg.delay);

    for (const el of zIndexOverflowHistory) el.update();
    zIndexOverflowHistory = [];
    startRemovePopUpsEvent();
  }

  if (msg.event === "filters") {
    filters = msg.data;
  }
});

setInterval(() => {
  for (const f of filters) {
    Array.from(document.querySelectorAll(f)).forEach(el => el.remove());
  }
}, 2000);

/**
 * * 干掉百度推广广告
 * * 每两秒检查一次
 */
setInterval(() => {
  Array.from(document.querySelectorAll("iframe"))
    .filter(e => e.src.includes("pos.baidu.com"))
    .forEach(e => {
      e.remove();
    });
}, 2000);
