/**
 * Walks the dom tree from the given node up until it finds a match
 *
 * @param {Element} node The from which to check the parent nodes
 * @param {Object} matchingSet Object to match against, Properties for filtering element:
 *   {
 *     query: selector string,
 *     classRegExp: regex,
 *     styleProperty: string or [],
 *     styleValue: string, [] or regex
 *   }
 * @param {Number} [levels] How many parents should the function check up from the current node (defaults to 50)
 * @param {Element} Optional, defines the container that limits the search
 *
 * @return {null|Element} Returns the first element that matched the desiredNodeName(s)
*/

wysihtml5.dom.getParentElement = (function() {

  return function(node, properties, levels, container) {
    levels = levels || 50;
    while (levels-- && node && node.nodeName !== "BODY" && (!container || node !== container)) {
      if (wysihtml5.dom.domNode(node).test(properties)) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };

})();
