/* Unwraps element and returns list of childNodes that the node contained.
 *
 * Example:
 *    var childnodes = wysihtml.dom.unwrap(document.querySelector('.unwrap-me'));
*/

wysihtml.dom.unwrap = function(node) {
  var children = [];
  if (node.parentNode) {
    while (node.lastChild) {
      children.unshift(node.lastChild);
      wysihtml.dom.insert(node.lastChild).after(node);
    }
    node.parentNode.removeChild(node);
  }
  return children;
};
