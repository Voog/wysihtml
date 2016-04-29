/* Set font size by inline style */
wysihtml.commands.fontSizeStyle = (function() {
  return {
    exec: function(composer, command, size) {
      size = size.size || size;
      if (!(/^\s*$/).test(size)) {
        wysihtml.commands.formatInline.exec(composer, command, {styleProperty: "fontSize", styleValue: size, toggle: false});
      }
    },

    state: function(composer, command, size) {
      return wysihtml.commands.formatInline.state(composer, command, {styleProperty: "fontSize", styleValue: size || undefined});
    },

    remove: function(composer, command) {
      return wysihtml.commands.formatInline.remove(composer, command, {styleProperty: "fontSize"});
    },

    stateValue: function(composer, command) {
      var styleStr,
          st = this.state(composer, command);

      if (st && wysihtml.lang.object(st).isArray()) {
          st = st[0];
      }
      if (st) {
        styleStr = st.getAttribute("style");
        if (styleStr) {
          return wysihtml.quirks.styleParser.parseFontSize(styleStr);
        }
      }
      return false;
    }
  };
})();
