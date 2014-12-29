(function(wysihtml5){
  wysihtml5.commands.superscript = {
    exec: function(composer, command) {
      wysihtml5.commands.formatInline.execWithToggle(composer, command, "sup");
    },

    state: function(composer, command) {
      return wysihtml5.commands.formatInline.state(composer, command, "sup");
    }
  };
}(wysihtml5));

