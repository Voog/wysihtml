(function(wysihtml){
  wysihtml.commands.insertHTML = {
    exec: function(composer, command, html) {
        composer.selection.insertHTML(html);
    },

    state: function() {
      return false;
    }
  };
}(wysihtml));
