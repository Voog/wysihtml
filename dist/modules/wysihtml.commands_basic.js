(function (root, factory) {
  if(typeof define === 'function' && define.amd) {
    define(['wysihtml'], factory);
  } else if(typeof module === 'object' && module.exports) {
    module.exports = factory(require('wysihtml'));
  } else {
    factory(root.wysihtml);
  }
})(this, function(wysihtml) {

wysihtml.commands.bold = (function() {
  var nodeOptions = {
    nodeName: "B",
    toggle: true
  };
  
  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };
})();

wysihtml.commands.insertBlockQuote = (function() {
  var nodeOptions = {
    nodeName: "BLOCKQUOTE",
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

wysihtml.commands.insertOrderedList = (function() {
  return {
    exec: function(composer, command) {
      wysihtml.commands.insertList.exec(composer, command, "OL");
    },

    state: function(composer, command) {
      return wysihtml.commands.insertList.state(composer, command, "OL");
    }
  };
})();

wysihtml.commands.insertUnorderedList = (function() {
  return {
    exec: function(composer, command) {
      wysihtml.commands.insertList.exec(composer, command, "UL");
    },

    state: function(composer, command) {
      return wysihtml.commands.insertList.state(composer, command, "UL");
    }
  };
})();

wysihtml.commands.italic = (function() { 
  var nodeOptions = {
    nodeName: "I",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})();

wysihtml.commands.subscript = (function() {
  var nodeOptions = {
    nodeName: "SUB",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})();

wysihtml.commands.superscript = (function() {
  var nodeOptions = {
    nodeName: "SUP",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})();

wysihtml.commands.underline = (function() {
  var nodeOptions = {
    nodeName: "U",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})();

});
