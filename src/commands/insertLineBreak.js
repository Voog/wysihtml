(function(wysihtml5) {
  var LINE_BREAK = "<br>" + (wysihtml5.browser.needsSpaceAfterLineBreak() ? " " : "");

  wysihtml5.commands.insertLineBreak = {
    exec: function(composer, command) {
      composer.selection.insertHTML(LINE_BREAK);
    },

    state: function() {
      return false;
    }
  };
})(wysihtml5);
