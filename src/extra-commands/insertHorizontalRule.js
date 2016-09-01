wysihtml.commands.insertHorizontalRule = (function() {
  return {
    exec: function(composer) {
      var node = composer.selection.getSelectedNode(),
          phrasingOnlyParent = wysihtml.dom.getParentElement(node, { query: wysihtml.PERMITTED_PHRASING_CONTENT_ONLY }, null, composer.editableArea),
          elem = document.createElement('hr'),
          range, idx;

      // HR is not allowed into some elements (where only phrasing content is allowed)
      // thus the HR insertion must break out of those https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories
      if (phrasingOnlyParent) {
        composer.selection.splitElementAtCaret(phrasingOnlyParent, elem);
      } else {
        composer.selection.insertNode(elem);
      }

      if (elem.nextSibling) {
        composer.selection.setBefore(elem.nextSibling);
      } else {
        composer.selection.setAfter(elem);
      }
    },
    state: function() {
      return false; // :(
    }
  };
})();
