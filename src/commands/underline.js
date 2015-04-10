(function(wysihtml5){

  var nodeOptions = {
    nodeName: "U",
    toggle: true
  };

  wysihtml5.commands.underline = {
    exec: function(composer, command) {
      wysihtml5.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml5.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

}(wysihtml5));
