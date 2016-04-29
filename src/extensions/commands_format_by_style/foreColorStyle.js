/* Sets text color by inline styles */
wysihtml.commands.foreColorStyle = (function() {
  return {
    exec: function(composer, command, color) {
      var colorVals, colString;

      if (!color) { return; }

      colorVals = wysihtml.quirks.styleParser.parseColor("color:" + (color.color || color), "color");

      if (colorVals) {
        colString = (colorVals[3] === 1 ? "rgb(" + [colorVals[0], colorVals[1], colorVals[2]].join(", ") : "rgba(" + colorVals.join(', ')) + ')';
        wysihtml.commands.formatInline.exec(composer, command, {styleProperty: "color", styleValue: colString});
      }
    },

    state: function(composer, command, color) {
      var colorVals  = color ? wysihtml.quirks.styleParser.parseColor("color:" + (color.color || color), "color") : null,
          colString;


      if (colorVals) {
        colString = (colorVals[3] === 1 ? "rgb(" + [colorVals[0], colorVals[1], colorVals[2]].join(", ") : "rgba(" + colorVals.join(', ')) + ')';
      }

      return wysihtml.commands.formatInline.state(composer, command, {styleProperty: "color", styleValue: colString});
    },

    remove: function(composer, command) {
      return wysihtml.commands.formatInline.remove(composer, command, {styleProperty: "color"});
    },

    stateValue: function(composer, command, props) {
      var st = this.state(composer, command),
          colorStr,
          val = false;

      if (st && wysihtml.lang.object(st).isArray()) {
        st = st[0];
      }

      if (st) {
        colorStr = st.getAttribute("style");
        if (colorStr) {
          val = wysihtml.quirks.styleParser.parseColor(colorStr, "color");
          return wysihtml.quirks.styleParser.unparseColor(val, props);
        }
      }
      return false;
    }
  };
})();
