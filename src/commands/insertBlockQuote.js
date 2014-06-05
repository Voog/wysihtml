(function(wysihtml5) {
  wysihtml5.commands.insertBlockQuote = {
    exec: function(composer, command) {
      var state = this.state(composer, command);
      composer.selection.executeAndRestoreRangy(function() {
        if (state) {
          if (composer.config.useLineBreaks) {
             wysihtml5.dom.insert(state.ownerDocument.createElement("br")).after(state);
             wysihtml5.dom.insert(state.ownerDocument.createElement("br")).before(state);
          }
          wysihtml5.dom.unwrap(state);
        } else {
          tempElement = composer.selection.deblockAndSurround({ "nodeName": "blockquote"  });
        }
      });
    },
    state: function(composer, command) {
      var selectedNode  = composer.selection.getSelectedNode(),
        node = wysihtml5.dom.getParentElement(selectedNode, { nodeName: "BLOCKQUOTE" }, false, composer.element);

      return (node) ? node : false;
    }
  };

})(wysihtml5);