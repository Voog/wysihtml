(function (root, factory) {
  if(typeof define === 'function' && define.amd) {
    define(['wysihtml'], factory);
  } else if(typeof module === 'object' && module.exports) {
    module.exports = factory(require('wysihtml'));
  } else {
    factory(root.wysihtml);
  }
})(this, function(wysihtml) {

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

wysihtml.commands.justifyCenter = (function() {
  var nodeOptions = {
    className: "wysiwyg-text-align-center",
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

wysihtml.commands.justifyLeft = (function() {
  var nodeOptions = {
    className: "wysiwyg-text-align-left",
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

wysihtml.commands.justifyRight = (function() {
  var nodeOptions = {
    className: "wysiwyg-text-align-right",
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

});
