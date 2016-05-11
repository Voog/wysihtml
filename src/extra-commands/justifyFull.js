wysihtml.commands.justifyFull = (function() {
  var nodeOptions = {
    className: "wysiwyg-text-align-justify",
    classRegExp: /wysiwyg-text-align-[0-9a-z]+/g,
    toggle: true
  };

  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
})();
