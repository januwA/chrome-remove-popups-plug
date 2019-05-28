const qs = s => document.querySelector(s);
const localStorage = window.localStorage;
const btn = qs('#js-ok-btn');
const input = qs('#js-input-zIndex');
const inputDelay = qs('#js-input-delay');
const adsCtrl = qs('#adsCtrl');

window.addEventListener('load', e => {
  const zIndex = localStorage.getItem('zIndex');
  const delay = localStorage.getItem('delay');
  const isDelAds = localStorage.getItem('isDelAds');
  input.value = !!zIndex ? Number(zIndex) : 10000;
  inputDelay.value = !!delay ? Number(delay) : 1000;

  if (isDelAds && isDelAds === 'true') {
    adsCtrl.setAttribute('checked', true);
  } else {
    adsCtrl.removeAttribute('checked');
  }
});

// click buttin
btn.addEventListener('click', handleMessageEvent);

function handleMessageEvent() {
  let zIndex = input.value;
  let delay = Number(inputDelay.value);
  if (zIndex && delay >= 0) {
    zIndex = Math.round(Number(zIndex));
    localStorage.setItem('zIndex', zIndex);
    localStorage.setItem('delay', delay);
    sendMessage({
      zIndex: zIndex,
      delay,
    });
  }
}

adsCtrl.addEventListener('change', e => {
  const message = {
    isDelAds: adsCtrl.checked,
  };
  localStorage.setItem('isDelAds', adsCtrl.checked);
  sendMessage(message);
});

function sendMessage(msgObj, cb = null) {
  const cfg = {
    active: true,
    currentWindow: true,
  };
  chrome.tabs.query(cfg, tabs => {
    // 向内容脚本发送消息 content.js
    chrome.tabs.sendMessage(tabs[0].id, msgObj, null, cb);
  });
}
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   console.log(msg);
// });
