/**
 * Get all attributes of an element
 *
 * IE gives wrong results for hasAttribute/getAttribute, for example:
 *    var td = document.createElement("td");
 *    td.getAttribute("rowspan"); // => "1" in IE
 *
 * Therefore we have to check the element's outerHTML for the attribute
*/

wysihtml5.dom.getAttributes = function(node) {
  var HAS_GET_ATTRIBUTE_BUG = !wysihtml5.browser.supportsGetAttributeCorrectly(),
      nodeName = node.nodeName,
      attributes = [],
      attr;

  for (attr in node.attributes) {
    if ((node.attributes.hasOwnProperty && node.attributes.hasOwnProperty(attr)) || (!node.attributes.hasOwnProperty && Object.prototype.hasOwnProperty.call(node.attributes, attr)))  {
      if (node.attributes[attr].specified) {
        if (nodeName == "IMG" && node.attributes[attr].name.toLowerCase() == "src" && wysihtml5.dom.isLoadedImage(node) === true) {
          attributes['src'] = node.src;
        } else if (wysihtml5.lang.array(['rowspan', 'colspan']).contains(node.attributes[attr].name.toLowerCase()) && HAS_GET_ATTRIBUTE_BUG) {
          if (node.attributes[attr].value !== 1) {
            attributes[node.attributes[attr].name] = node.attributes[attr].value;
          }
        } else {
          attributes[node.attributes[attr].name] = node.attributes[attr].value;
        }
      }
    }
  }
  return attributes;
};
