(function(wysihtml) {
  var LINE_BREAK = "<br>" + (wysihtml.browser.needsSpaceAfterLineBreak() ? " " : "");

  wysihtml.commands.insertLineBreak = {
    exec: function(composer, command) {
      composer.selection.insertHTML(LINE_BREAK);
    },

    state: function() {
      return false;
    }
  };
})(wysihtml);
