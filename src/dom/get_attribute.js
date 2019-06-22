/**
 * Get a set of attribute from one element
 *
 * IE gives wrong results for hasAttribute/getAttribute, for example:
 *    var td = document.createElement("td");
 *    td.getAttribute("rowspan"); // => "1" in IE
 *
 * Therefore we have to check the element's outerHTML for the attribute
*/

wysihtml.dom.getAttribute = function(node, attributeName) {
  var HAS_GET_ATTRIBUTE_BUG = !wysihtml.browser.supportsGetAttributeCorrectly();
  attributeName = attributeName.toLowerCase();
  var nodeName = node.nodeName;
  if (HAS_GET_ATTRIBUTE_BUG && "outerHTML" in node) {
    // Don't trust getAttribute/hasAttribute in IE 6-8, instead check the element's outerHTML
    var outerHTML      = node.outerHTML.toLowerCase(),
        // TODO: This might not work for attributes without value: <input disabled>
        hasAttribute   = outerHTML.indexOf(" " + attributeName +  "=") != -1;

    return hasAttribute ? node.getAttribute(attributeName) : null;
  } else{
    return node.getAttribute(attributeName);
  }
};
