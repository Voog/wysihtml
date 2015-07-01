(function(wysihtml5) {

  var nodeOptions = {
    nodeName: "BLOCKQUOTE"
  };

  wysihtml5.commands.exitBlockQuote = {
    exec: function(composer, command) {
      var node = composer.selection.getSelectedNode();
      if(node) {
        var blockNode = node.parentNode;
        var pblock = blockNode.parentNode.insertBefore(document.createElement('p'), blockNode.nextSibling);
        node.parentNode.removeChild(node);
        composer.selection.selectNode(pblock);
      }
      return false;
    },

    state: function(composer, command) {
      return wysihtml5.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };

})(wysihtml5);
