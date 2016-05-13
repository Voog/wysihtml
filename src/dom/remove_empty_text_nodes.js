/**
 * Checks for empty text node childs and removes them
 *
 * @param {Element} node The element in which to cleanup
 * @example
 *    wysihtml.dom.removeEmptyTextNodes(element);
 */
wysihtml.dom.removeEmptyTextNodes = function(node) {
  var childNode,
      childNodes        = wysihtml.lang.array(node.childNodes).get(),
      childNodesLength  = childNodes.length,
      i                 = 0;

  for (; i<childNodesLength; i++) {
    childNode = childNodes[i];
    if (childNode.nodeType === wysihtml.TEXT_NODE && (/^[\n\r]*$/).test(childNode.data)) {
      childNode.parentNode.removeChild(childNode);
    }
  }
};
