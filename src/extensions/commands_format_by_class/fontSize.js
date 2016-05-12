wysihtml.commands.fontSize = (function() {
  var REG_EXP = /wysiwyg-font-size-[0-9a-z\-]+/g;

  return {
    exec: function(composer, command, size) {
      wysihtml.commands.formatInline.exec(composer, command, {className: "wysiwyg-font-size-" + size, classRegExp: REG_EXP, toggle: true});
    },

    state: function(composer, command, size) {
      return wysihtml.commands.formatInline.state(composer, command, {className: "wysiwyg-font-size-" + size});
    }
  };
})();
