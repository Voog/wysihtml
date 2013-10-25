wysihtml5.commands.insertHTML = {
  exec: function(composer, command, html) {
    // for getting source returned from dialog
    if (html.source) { html = html.source; }
    
    if (composer.commands.support(command)) {
      composer.doc.execCommand(command, false, html);
    } else {
      composer.selection.insertHTML(html);
    }
  },

  state: function() {
    return false;
  }
};
