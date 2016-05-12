(function(wysihtml) {

  var nodeOptions = {
    nodeName: "A"
  };

  wysihtml.commands.removeLink = {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.remove(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})(wysihtml);
