wysihtml.commands.insertUnorderedList = (function() {
  return {
    exec: function(composer, command) {
      wysihtml.commands.insertList.exec(composer, command, "UL");
    },

    state: function(composer, command) {
      return wysihtml.commands.insertList.state(composer, command, "UL");
    }
  };
})();
