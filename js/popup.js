const qs = s => document.querySelector(s);
const localStorage = window.localStorage;
const input = qs("#js-input-zIndex");
const inputDelay = qs("#js-input-delay");
const adsCtrl = qs("#adsCtrl");

window.addEventListener("load", e => {
  const zIndex = localStorage.getItem("zIndex");
  const delay = localStorage.getItem("delay");
  input.value = !!zIndex ? Number(zIndex) : 10000;
  inputDelay.value = !!delay ? Number(delay) : 1000;

  setFiltersBox(getFilters());
});

// click buttin
qs("#js-ok-btn").addEventListener("click", () => {
  let zIndex = input.value;
  let delay = Number(inputDelay.value);
  if (zIndex && delay >= 0) {
    zIndex = Math.round(Number(zIndex));
    localStorage.setItem("zIndex", zIndex);
    localStorage.setItem("delay", delay);
    sendMessage({
      zIndex: zIndex,
      delay
    });
  }
});

function sendMessage(meg, cb = null) {
  const cfg = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(cfg, tabs => {
    // 向内容脚本发送消息 content.js
    chrome.tabs.sendMessage(tabs[0].id, meg, null, cb);
  });
}
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   console.log(msg);
// });

const filtersBox = document.querySelector("#js-filters");
const addFilterInput = document.querySelector("#js-add-input");
document.querySelector("#js-add").addEventListener("click", e => {
  const value = addFilterInput.value.trim();
  if (value) {
    addFilterInput.value = "";
    const filters = getFilters();
    filters.push(value);
    setFilters(filters);
    setFiltersBox(filters);
    sendMessage({
      event: "filters",
      data: filters
    });
  }
});

function getFilters() {
  let filters = localStorage.getItem("filters");
  return filters ? JSON.parse(filters) : [];
}

function setFilters(filters) {
  localStorage.setItem("filters", JSON.stringify(filters));
}

function setFiltersBox(filters) {
  let innerHTML = "";
  filtersBox.innerHTML = innerHTML;
  for (const f of filters) {
    innerHTML += `<span style="padding: 4px;display: inline-block;">${f}<button  style="margin-left: 4px;" data-f="${f}" class="remove-filter-btn">x</button></span>`;
  }
  filtersBox.insertAdjacentHTML("beforeend", innerHTML);
  Array.from(document.querySelectorAll(".remove-filter-btn")).forEach(el => {
    el.addEventListener("click", e => {
      filters = filters.filter(i => i !== el.dataset.f);
      setFilters(filters);
      setFiltersBox(filters);
    });
  });
}
