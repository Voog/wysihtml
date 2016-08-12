wysihtml.commands.insertHorizontalRule = (function() {
  return {
    exec: function(composer) {
        var node = composer.selection.getSelectedNode(),
            parent = wysihtml.dom.getParentElement(node, { query: "*" }, null, composer.editableArea),
            elem;
        if (parent) {
          elem = document.createElement('hr');
          composer.selection.splitElementAtCaret(parent, elem);
          composer.selection.selectNode(elem.nextSibling || elem);
          var range = composer.selection.getSelection();
          range.collapseToStart();
        } else {
          composer.selection.insertHTML("<hr>");
        }
    },
    state: function() {
      return false; // :(
    }
  };
})();
