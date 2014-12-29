/* Unwraps element and returns list of childNodes that the node contained.
 *
 * Example:
 *    var childnodes = wysihtml5.dom.unwrap(document.querySelector('.unwrap-me'));
*/

wysihtml5.dom.unwrap = function(node) {
  var children = [];
  if (node.parentNode) {
    while (node.lastChild) {
      children.unshift(node.lastChild);
      wysihtml5.dom.insert(node.lastChild).after(node);
    }
    node.parentNode.removeChild(node);
  }
  return children;
};
