wysihtml.commands.foreColor = (function() {
  var REG_EXP = /wysiwyg-color-[0-9a-z]+/g;

  return {
    exec: function(composer, command, color) {
      wysihtml.commands.formatInline.exec(composer, command, {className: "wysiwyg-color-" + color, classRegExp: REG_EXP, toggle: true});
    },

    state: function(composer, command, color) {
      return wysihtml.commands.formatInline.state(composer, command, {className: "wysiwyg-color-" + color});
    }
  };
})();
