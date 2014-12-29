(function(wysihtml5){
  wysihtml5.commands.insertUnorderedList = {
    exec: function(composer, command) {
      wysihtml5.commands.insertList.exec(composer, command, "UL");
    },

    state: function(composer, command) {
      return wysihtml5.commands.insertList.state(composer, command, "UL");
    }
  };
}(wysihtml5));
