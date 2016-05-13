wysihtml.dom.removeInvisibleSpaces = function(node) {
  var textNodes = wysihtml.dom.getTextNodes(node);
  for (var n = textNodes.length; n--;) {
    textNodes[n].nodeValue = textNodes[n].nodeValue.replace(wysihtml.INVISIBLE_SPACE_REG_EXP, "");
  }
};
