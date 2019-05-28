// 标签页中的内容脚本
let max_zIndex = 10000;
let setIntervalDelay = 10000;
let setIntervalCtrl;
let zIndexOverflowHistory = [];
let pageAds = []; // 页面被隐藏的广告
const constTypes = {
  static: 'static',
};
class HistoryElement {
  constructor(el, oldDisplay) {
    this.el = el;
    this.oldDisplay = oldDisplay;
  }

  update() {
    this.el.style['display'] = this.oldDisplay;
  }
}

function removePopUpsEvent() {
  let allElement = document.body.querySelectorAll('*');
  // 遍历页面上所有的元素
  for (let i = 0; i < allElement.length; i++) {
    const el = allElement[i];
    const position = getPV(el, 'position');
    const zIndex = getPV(el, 'z-index');
    if (
      position === constTypes.static ||
      !Number.isFinite(Number(zIndex)) ||
      !zIndex ||
      zIndex < max_zIndex
    ) {
      continue;
    }
    const oldDisplay = getPV(el, 'display');
    zIndexOverflowHistory.push(new HistoryElement(el, oldDisplay));
    el.style['display'] = 'none';
  }
}

function startRemovePopUpsEvent() {
  removePopUpsEvent();
  setIntervalCtrl = setInterval(removePopUpsEvent, setIntervalDelay);
}
startRemovePopUpsEvent();

function getPV(el, prop) {
  return document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
}

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

  if (msg.isDelAds) {
    hidePageAds();
  } else {
    for (const el of pageAds) {
      el.update();
    }
  }
});

// 向扩展脚本发送消息 popup.js
// 只有打开了pupup页面，才能收到消息
// chrome.runtime.sendMessage(chrome.runtime.id, { data: max_zIndex });

// 尽量隐藏掉页面上的广告.
function hidePageAds() {
  pageAds = [];
  document.querySelectorAll('*').forEach(el => {
    let cl = Array.from(el.classList);
    if (cl.some(clItem => /ads/gi.test(clItem))) {
      const oldDisplay = getPV(el, 'display');
      pageAds.push(new HistoryElement(el, oldDisplay));
      el.style['display'] = 'none';
    }
  });
}
hidePageAds();
