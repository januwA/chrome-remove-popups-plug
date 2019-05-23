// 标签页中的内容脚本
let max_zIndex = 10000;
let setIntervalDelay = 1000;
let zIndexOverflowHistory = [];
const constTypes = {
  static: "static",
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
    const element = allElement[i];
    const position = getPV(element, "position");
    const zIndex = getPV(element, "z-index");
    const isFlter =
      zIndex && Number.isInteger(Number(zIndex)) && zIndex >= max_zIndex;
    if (position !== constTypes.static && isFlter) {
      const oldDisplay = getPV(element, "display");
      zIndexOverflowHistory.push(new HistoryElement(element, oldDisplay));
      element.style["display"] = "none";
    }
  }
}

removePopUpsEvent();
setInterval(removePopUpsEvent, setIntervalDelay);

function getPV(el, prop) {
  return document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
}

chrome.runtime.onMessage.addListener(gotMessage);
function gotMessage(msg, sender, sendResponse) {
  max_zIndex = msg.data;
  setIntervalDelay = Number(msg.delay);
  for (const el of zIndexOverflowHistory) {
    el.update();
  }
  removePopUpsEvent();
}

// 向扩展脚本发送消息 popup.js
// 只有打开了pupup页面，才能收到消息
// chrome.runtime.sendMessage(chrome.runtime.id, { data: max_zIndex });


// 尽量隐藏掉页面上的广告.
function hidePageAds() {
  document.querySelectorAll('*').forEach(el => {
    let cl = Array.from(el.classList);
    if (cl.some(clItem => /ads/ig.test(clItem))) {
      el.style['display'] = 'none';
    }
  });
};
hidePageAds();
