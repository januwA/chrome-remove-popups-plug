const btn = document.querySelector("#js-ok-btn");
const input = document.querySelector("#js-input-zIndex");
const inputDelay = document.querySelector("#js-input-delay");

// click buttin
btn.addEventListener("click", function(e) {
  handleMessageEvent();
});

// click Enter
input.addEventListener("keydown", e => {
  if (e.keyCode === 13) {
    handleMessageEvent();
  }
});

function handleMessageEvent() {
  let text = input.value;
  let delay = Number(inputDelay.value);
  if (text && delay >= 0) {
    text = Math.round(Number(text));
    const cfg = {
      active: true,
      currentWindow: true,
    };
    chrome.tabs.query(cfg, tabs => {
      // 向内容脚本发送消息 content.js
      chrome.tabs.sendMessage(tabs[0].id, {
        data: text,
        delay,
      });
    });
  }
}

chrome.runtime.onMessage.addListener(gotMessage);
function gotMessage(msg, sender, sendResponse) {
  input.value = msg.data;
}
