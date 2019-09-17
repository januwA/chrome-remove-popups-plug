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

  if (msg.isDelAds) {
    hidePageAds();
  } else {
    for (const el of pageAds) {
      el.update();
    }
  }
});

// 向扩展脚本(popup.js)发送消息
// 只有打开了pupup页面，才能收到消息
// chrome.runtime.sendMessage(chrome.runtime.id, { data: max_zIndex });
/**
 * * 尽量屏蔽掉页面上和广告字眼相关的
 */
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

/**
 * * 干掉百度推广广告
 * * 每两秒检查一次
 */

function removePosBaiduCom() {
  Array.from(document.querySelectorAll('iframe'))
    .filter(e => e.src.includes('pos.baidu.com'))
    .forEach(e => {
      e.remove();
    });
}

setInterval(() => {
  removePosBaiduCom();
}, 2000);
