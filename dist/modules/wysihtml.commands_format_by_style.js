(function (root, factory) {
  if(typeof define === 'function' && define.amd) {
    define(['wysihtml'], factory);
  } else if(typeof module === 'object' && module.exports) {
    module.exports = factory(require('wysihtml'));
  } else {
    factory(root.wysihtml);
  }
})(this, function(wysihtml) {

wysihtml.commands.alignCenterStyle = (function() {
  var nodeOptions = {
    styleProperty: "textAlign",
    styleValue: "center",
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

wysihtml.commands.alignJustifyStyle = (function() {
  var nodeOptions = {
    styleProperty: "textAlign",
    styleValue: "justify",
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

wysihtml.commands.alignLeftStyle = (function() {
  var nodeOptions = {
    styleProperty: "textAlign",
    styleValue: "left",
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

wysihtml.commands.alignRightStyle = (function() {
  var nodeOptions = {
    styleProperty: "textAlign",
    styleValue: "right",
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

/* Sets text background color by inline styles */
wysihtml.commands.bgColorStyle = (function() {
  return {
    exec: function(composer, command, color) {
      var colorVals  = wysihtml.quirks.styleParser.parseColor("background-color:" + (color.color || color), "background-color"),
          colString;

      if (colorVals) {
        colString = (colorVals[3] === 1 ? "rgb(" + [colorVals[0], colorVals[1], colorVals[2]].join(', ') : "rgba(" + colorVals.join(', ')) + ')';
        wysihtml.commands.formatInline.exec(composer, command, {styleProperty: 'backgroundColor', styleValue: colString});
      }
    },

    state: function(composer, command, color) {
      var colorVals  = color ? wysihtml.quirks.styleParser.parseColor("background-color:" + (color.color || color), "background-color") : null,
          colString;

      if (colorVals) {
        colString = (colorVals[3] === 1 ? "rgb(" + [colorVals[0], colorVals[1], colorVals[2]].join(', ') : "rgba(" + colorVals.join(', ')) + ')';
      }

      return wysihtml.commands.formatInline.state(composer, command, {styleProperty: 'backgroundColor', styleValue: colString});
    },

    remove: function(composer, command) {
      return wysihtml.commands.formatInline.remove(composer, command, {styleProperty: 'backgroundColor'});
    },

    stateValue: function(composer, command, props) {
      var st = this.state(composer, command),
          colorStr,
          val = false;

      if (st && wysihtml.lang.object(st).isArray()) {
        st = st[0];
      }

      if (st) {
        colorStr = st.getAttribute('style');
        if (colorStr) {
          val = wysihtml.quirks.styleParser.parseColor(colorStr, "background-color");
          return wysihtml.quirks.styleParser.unparseColor(val, props);
        }
      }
      return false;
    }
  };
})();

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

});
