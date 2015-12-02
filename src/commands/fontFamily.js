/**
 * Set font family class
 */

(function(wysihtml5) {
  var REG_EXP = /wysiwyg-font-family-[0-9a-z]+/g;

  wysihtml5.commands.fontFamily = {
    exec: function(composer, command, v) {
      wysihtml5.commands.formatInline.exec(composer, command, {className: "wysiwyg-font-family-" + v, classRegExp: REG_EXP, toggle: true});
    },

    state: function(composer, command, v) {
      return wysihtml5.commands.formatInline.state(composer, command, {className: "wysiwyg-font-family-" + v});
    }
  };
})(wysihtml5);
