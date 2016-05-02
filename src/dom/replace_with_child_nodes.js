/**
 * Takes an element, removes it and replaces it with its children
 *
 * @param {Object} node The node which to replace with its child nodes
 * @example
 *    <div id="foo">
 *      <span>hello</span>
 *    </div>
 *    <script>
 *      // Remove #foo and replace with its children
 *      wysihtml.dom.replaceWithChildNodes(document.getElementById("foo"));
 *    </script>
 */
wysihtml.dom.replaceWithChildNodes = function(node) {
  if (!node.parentNode) {
    return;
  }

  while (node.firstChild) {
    node.parentNode.insertBefore(node.firstChild, node);
  }
  node.parentNode.removeChild(node);
};
