wysihtml.commands.alignCenterStyle = (function() {
  var nodeOptions = {
    styleProperty: "textAlign",
    styleValue: "center",
    toggle: true
  };
  
  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
})();
