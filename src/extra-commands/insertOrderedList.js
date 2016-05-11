wysihtml.commands.insertOrderedList = (function() {
  return {
    exec: function(composer, command) {
      wysihtml.commands.insertList.exec(composer, command, "OL");
    },

    state: function(composer, command) {
      return wysihtml.commands.insertList.state(composer, command, "OL");
    }
  };
})();
