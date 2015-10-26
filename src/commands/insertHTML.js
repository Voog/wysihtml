(function(wysihtml5){
  wysihtml5.commands.insertHTML = {
    exec: function(composer, command, html) {
        composer.selection.insertHTML(html);
    },

    state: function() {
      return false;
    }
  };
}(wysihtml5));
