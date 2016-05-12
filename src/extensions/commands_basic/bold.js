wysihtml.commands.bold = (function() {
  var nodeOptions = {
    nodeName: "B",
    toggle: true
  };
  
  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };
})();
