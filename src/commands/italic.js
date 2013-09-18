wysihtml5.commands.italic = {
  exec: function(composer, command) {
      var that = this;
      if (this.state(composer, command) && composer.selection.isCollapsed()) {
          // collapsed caret in an italic area indicates italic as text formatting.
          // so clicking on italic again should unformat style
          composer.selection.executeAndRestore(function() {
              composer.selection.selectNode(that.state(composer, command)[0]);
              wysihtml5.commands.formatInline.exec(composer, command, "i");
          });
      } else {
          wysihtml5.commands.formatInline.exec(composer, command, "i");
      }
  },

  state: function(composer, command) {
    // element.ownerDocument.queryCommandState("italic") results:
    // firefox: only <i>
    // chrome:  <i>, <em>, <blockquote>, ...
    // ie:      <i>, <em>
    // opera:   only <i>
    return wysihtml5.commands.formatInline.state(composer, command, "i");
  }
};