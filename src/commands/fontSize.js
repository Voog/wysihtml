/**
 * Set font size css class
 */
(function(wysihtml5) {
  var REG_EXP = /wysiwyg-font-size-[0-9a-z\-]+/g;

  wysihtml5.commands.fontSize = {
    exec: function(composer, command, size) {
      wysihtml5.commands.formatInline.exec(composer, command, {className: "wysiwyg-font-size-" + size, classRegExp: REG_EXP, toggle: true});
    },

    state: function(composer, command, size) {
      return wysihtml5.commands.formatInline.state(composer, command, {className: "wysiwyg-font-size-" + size});
    }
  };
})(wysihtml5);
