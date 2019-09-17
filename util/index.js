function getPV(el, prop) {
  return document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
}
