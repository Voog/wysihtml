wysihtml5.dom.removeInvisibleSpaces = function(node) {
  var textNodes = wysihtml5.dom.getTextNodes(node);
  for (var n = textNodes.length; n--;) {
    textNodes[n].nodeValue = textNodes[n].nodeValue.replace(wysihtml5.INVISIBLE_SPACE_REG_EXP, "");
  }
};
