wysihtml5.commands.subscript = {
  exec: function(composer, command) {
    wysihtml5.commands.formatInline.execWithToggle(composer, command, "sub");
  },

  state: function(composer, command) {
    return wysihtml5.commands.formatInline.state(composer, command, "sub");
  }
};
