(function(wysihtml5) {

  var nodeOptions = {
    nodeName: "A"
  };

  wysihtml5.commands.removeLink = {
    exec: function(composer, command) {
      wysihtml5.commands.formatInline.remove(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml5.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})(wysihtml5);
