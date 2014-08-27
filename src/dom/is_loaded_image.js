/**
   * Check whether the given node is a proper loaded image
   * FIXME: Returns undefined when unknown (Chrome, Safari)
*/

wysihtml5.dom.isLoadedImage = function (node) {
  try {
    return node.complete && !node.mozMatchesSelector(":-moz-broken");
  } catch(e) {
    if (node.complete && node.readyState === "complete") {
      return true;
    }
  }
};
