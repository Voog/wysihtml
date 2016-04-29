// TODO: Refactor dom tree traversing here
(function(wysihtml) {
  wysihtml.dom.lineBreaks = function(node) {

    function _isLineBreak(n) {
      return n.nodeName === "BR";
    }

    /**
     * Checks whether the elment causes a visual line break
     * (<br> or block elements)
     */
    function _isLineBreakOrBlockElement(element) {
      if (_isLineBreak(element)) {
        return true;
      }

      if (wysihtml.dom.getStyle("display").from(element) === "block") {
        return true;
      }

      return false;
    }

    return {

      /* wysihtml.dom.lineBreaks(element).add();
       *
       * Adds line breaks before and after the given node if the previous and next siblings
       * aren't already causing a visual line break (block element or <br>)
       */
      add: function(options) {
        var doc             = node.ownerDocument,
          nextSibling     = wysihtml.dom.domNode(node).next({ignoreBlankTexts: true}),
          previousSibling = wysihtml.dom.domNode(node).prev({ignoreBlankTexts: true});

        if (nextSibling && !_isLineBreakOrBlockElement(nextSibling)) {
          wysihtml.dom.insert(doc.createElement("br")).after(node);
        }
        if (previousSibling && !_isLineBreakOrBlockElement(previousSibling)) {
          wysihtml.dom.insert(doc.createElement("br")).before(node);
        }
      },

      /* wysihtml.dom.lineBreaks(element).remove();
       *
       * Removes line breaks before and after the given node
       */
      remove: function(options) {
        var nextSibling     = wysihtml.dom.domNode(node).next({ignoreBlankTexts: true}),
            previousSibling = wysihtml.dom.domNode(node).prev({ignoreBlankTexts: true});

        if (nextSibling && _isLineBreak(nextSibling)) {
          nextSibling.parentNode.removeChild(nextSibling);
        }
        if (previousSibling && _isLineBreak(previousSibling)) {
          previousSibling.parentNode.removeChild(previousSibling);
        }
      }
    };
  };
})(wysihtml);