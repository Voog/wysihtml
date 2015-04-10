(function(wysihtml5){
  
  var nodeOptions = {
    nodeName: "SUB",
    toggle: true
  };

  wysihtml5.commands.subscript = {
    exec: function(composer, command) {
      wysihtml5.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml5.commands.formatInline.state(composer, command, nodeOptions);
    }
  };
}(wysihtml5));
