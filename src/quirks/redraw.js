/**
 * Force rerendering of a given element
 * Needed to fix display misbehaviors of IE
 *
 * @param {Element} element The element object which needs to be rerendered
 * @example
 *    wysihtml.quirks.redraw(document.body);
 */
(function(wysihtml) {
  var CLASS_NAME = "wysihtml-quirks-redraw";

  wysihtml.quirks.redraw = function(element) {
    wysihtml.dom.addClass(element, CLASS_NAME);
    wysihtml.dom.removeClass(element, CLASS_NAME);

    // Following hack is needed for firefox to make sure that image resize handles are properly removed
    try {
      var doc = element.ownerDocument;
      doc.execCommand("italic", false, null);
      doc.execCommand("italic", false, null);
    } catch(e) {}
  };
})(wysihtml);
