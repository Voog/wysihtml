wysihtml.commands.insertHorizontalRule = (function() {
  return {
    exec: function(composer) {
      var node = composer.selection.getSelectedNode(),
          phrasingOnlyParent = wysihtml.dom.getParentElement(node, { query: wysihtml.PERMITTED_PHRASING_CONTENT_ONLY }, null, composer.editableArea),
          elem, range;

      // HR is not allowed into some elements (where only phrasing content is allowed)
      // thus the HR insertion must break out of those https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories
      if (phrasingOnlyParent) {
        elem = document.createElement('hr');
        composer.selection.splitElementAtCaret(phrasingOnlyParent, elem);
        composer.selection.selectNode(elem.nextSibling || elem);
        range = composer.selection.getSelection();
        range.collapseToStart();
      } else {
        composer.selection.insertHTML('<hr>');
      }
    },
    state: function() {
      return false; // :(
    }
  };
})();
