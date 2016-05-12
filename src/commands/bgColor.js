/**
 * Set text background color class
 */
(function(wysihtml5) {
  var REG_EXP = /wysiwyg-bg-color-[0-9a-z]+/g;

  wysihtml5.commands.bgColor = {
    exec: function(composer, command, color) {
      wysihtml5.commands.formatInline.exec(composer, command, {className: "wysiwyg-bg-color-" + color, classRegExp: REG_EXP, toggle: true});
    },

    state: function(composer, command, color) {
      return wysihtml5.commands.formatInline.state(composer, command, {className: "wysiwyg-bg-color-" + color});
    }
  };
})(wysihtml5);
