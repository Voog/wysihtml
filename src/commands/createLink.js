(function(wysihtml5) {

  var nodeOptions = {
    nodeName: "A",
    toggle: false
  };

  function getOptions(value) {
    var options = typeof value === 'object' ? value : {'href': value};
    return wysihtml5.lang.object({}).merge(nodeOptions).merge({'attribute': value}).get();
  }

  wysihtml5.commands.createLink  = {
    exec: function(composer, command, value) {
      var opts = getOptions(value);

      if (composer.selection.isCollapsed() && !this.state(composer, command)) {
        var textNode = composer.doc.createTextNode(opts.attribute.href);
        composer.selection.insertNode(textNode);
        composer.selection.selectNode(textNode);
      }
      wysihtml5.commands.formatInline.exec(composer, command, opts);
    },

    state: function(composer, command) {
      return wysihtml5.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})(wysihtml5);
