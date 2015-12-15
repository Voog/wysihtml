if (wysihtml5.browser.supported()) {
  
  module("wysihtml5.view.composer", {
    setup: function() {
      this.editableArea        = document.createElement("div");
      this.editableArea.id     = "wysihtml5-test-editable";
      this.editableArea.innerHTML  = "";
      this.rules = {
        parserRules: { tags: {
          "strong": true,
          "p": true,
          "ul": true,
          "li": true,
          "h1": true,
          "h2": true
        } }
      }
      
      document.body.appendChild(this.editableArea);
    },

    teardown: function() {
      var leftover;
      if (this.editableArea && this.editableArea.parentNode) {
        this.editableArea.parentNode.removeChild(this.editableArea);
      }
    },
    
    setCaretTo: function(editor, el, offset) {
      var r1 = editor.composer.selection.createRange();

      r1.setEnd(el, offset);
      r1.setStart(el, offset);
      editor.composer.selection.setSelection(r1);
    },
  });
  
// Editor initiation tests
  asyncTest("fixDeleteInTheBeginningOfBlock", function() {
    expect(3);
    var that = this;
    var editor = new wysihtml5.Editor(this.editableArea, this.rules);
    editor.on("load", function() {
      var e = that.editableArea,
          composer = editor.composer;
      
      e.innerHTML = "<p>test</p><p>line1<br>line2</p>";
      that.setCaretTo(editor, e.childNodes[1].childNodes[0], 0);
      composer.observeActions.fixDeleteInTheBeginningOfBlock(composer);
      equal(e.innerHTML, "<p>testline1<br>line2</p>", "Merges previous and current paragraph node correctly");
      
      e.innerHTML = "<p>test</p><p><br>line1<br>line2</p>";
      that.setCaretTo(editor, e.childNodes[1], 0);
      composer.observeActions.fixDeleteInTheBeginningOfBlock(composer);
      equal(e.innerHTML, "<p>test<br>line1<br>line2</p>", "Merges previous and current paragraph node correctly");
      
      e.innerHTML = "<pre>test<br>ing</pre>";
      that.setCaretTo(editor, e.childNodes[0], 2);
      composer.observeActions.doLineBreaksModeEnterWithCaret(composer);
      equal(e.innerHTML, "<pre>test</pre><br><pre>ing</pre>", "Splits block node with double blank lines");
      
      start();
    });
  });

  
}
