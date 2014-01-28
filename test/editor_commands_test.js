if (wysihtml5.browser.supported()) {
  module("wysihtml5.Editor.commands", {
    setup: function() {
        
      this.editableArea        = document.createElement("div");
      this.editableArea.id     = "wysihtml5-test-editable";
      this.editableArea.className = "wysihtml5-test-class";
      this.editableArea.title  = "Please enter your foo";
      this.editableArea.innerHTML  = "hey tiff, what's up?";
      
      document.body.appendChild(this.editableArea);
      
    },

    teardown: function() {
      var leftover;
      while (leftover = document.querySelector("div.wysihtml5-sandbox")) {
        leftover.parentNode.removeChild(leftover);
      }
      document.body.className = this.originalBodyClassName;
    }
  });
  
  
// bold, italic, underline
  asyncTest("Basic formating tests", function() {
     expect(10);
    var that = this,
        text = "once upon a time there was an unformated text.",
        parserRules = {
          tags: {
            b: true,
            i: true,
            u: true
          }
        },
        editor = new wysihtml5.Editor(this.editableArea, {
          parserRules: parserRules
        });
        
    editor.on("load", function() {
      var editableElement   = that.editableArea;
      editor.setValue(text, true);
      
      // basic bold
      editor.composer.selection.selectNode(editor.editableElement);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase(), "<b>" + text + "</b>", "Command bold sets text as bold correctly");
      
      editor.composer.selection.getSelection().collapseToStart();
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret is collapsed");
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase(), text, "Bold is correctly removed when text caret is inside bold");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");
      
      // basic italic
      editor.composer.selection.selectNode(editor.editableElement);
      editor.composer.commands.exec('italic');
      equal(editableElement.innerHTML.toLowerCase(), "<i>" + text + "</i>", "Command italic sets text style correctly");
      
      editor.composer.selection.getSelection().collapseToStart();
      editor.composer.commands.exec('italic');
      equal(editableElement.innerHTML.toLowerCase(), text, "Italic is correctly removed when text caret is inside italic");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");
      
      // basic underline
      editor.composer.selection.selectNode(editor.editableElement);
      editor.composer.commands.exec('underline');
      equal(editableElement.innerHTML.toLowerCase(), "<u>" + text + "</u>", "Command underline sets text style correctly");
      
      editor.composer.selection.getSelection().collapseToStart();
      editor.composer.commands.exec('underline');
      equal(editableElement.innerHTML.toLowerCase(), text, "Underline is correctly removed when text caret is inside underline");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");
      
      start();
    });
  });
  
// formatblock (alignment, headings, paragraph, pre, blockquote)
    asyncTest("Format block", function() {
       expect(8);
      var that = this,
          editor = new wysihtml5.Editor(this.editableArea),
          text = "once upon a time<br>there was an unformated text<br>spanning many lines.";
        
      editor.on("load", function() {
        var editableElement   = that.editableArea;
        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.commands.exec('justifyRight');
        equal(editableElement.innerHTML.toLowerCase(), '<div class="wysiwyg-text-align-right">' + text + '</div>', "Text corectly wrapped in one aligning div");
    
        editor.composer.commands.exec('justifyRight');
        equal(editableElement.innerHTML.toLowerCase(), text, "Aligning div correctly removed");
        
        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.selection.getSelection().collapseToStart();
        
        editor.composer.commands.exec('justifyRight');
        equal(editableElement.innerHTML.toLowerCase(), '<div class="wysiwyg-text-align-right">once upon a time</div>there was an unformated text<br>spanning many lines.', "Only first line correctly wrapped in aligning div");
        
        var node = editor.editableElement.querySelectorAll('.wysiwyg-text-align-right');
        editor.composer.selection.selectNode(node[0].childNodes[0]);
        editor.composer.commands.exec('justifyLeft');
        equal(editableElement.innerHTML.toLowerCase(), '<div class="wysiwyg-text-align-left">once upon a time</div>there was an unformated text<br>spanning many lines.', "First line wrapper class changed correctly");
        
        editor.composer.commands.exec('formatBlock', "h1");
        equal(editableElement.innerHTML.toLowerCase(), '<h1 class="wysiwyg-text-align-left">once upon a time</h1>there was an unformated text<br>spanning many lines.', "Alignment div changed to heading ok");
        
        editor.composer.commands.exec('formatBlock', "h1");
        equal(editableElement.innerHTML.toLowerCase(), '<div class="wysiwyg-text-align-left">once upon a time</div>there was an unformated text<br>spanning many lines.', "heading back to div ok");
        
        editor.composer.commands.exec('justifyRight');
        editor.composer.commands.exec('formatBlock', "h1");
        editor.composer.commands.exec('justifyRight');
        equal(editableElement.innerHTML.toLowerCase(), '<h1>once upon a time</h1>there was an unformated text<br>spanning many lines.', "heading alignment removed sucessfully");
        
        editor.composer.commands.exec('justifyRight');
        editor.composer.commands.exec('formatBlock', "p");
        editor.composer.commands.exec('justifyRight');
        equal(editableElement.innerHTML.toLowerCase(), '<p>once upon a time</p>there was an unformated text<br>spanning many lines.', "heading alignment removed sucessfully");
        
        start();
      });
    });
    
// createLink/removeLink
        asyncTest("Create/remove link", function() {
           expect(4);
           
          var that = this,
              editor = new wysihtml5.Editor(this.editableArea),
              text = "text";
        
          editor.on("load", function() {
            var editableElement   = that.editableArea;
            editor.setValue(text, true);
            editor.composer.selection.selectNode(editor.editableElement);
            
            // Create
            editor.composer.commands.exec('createLink', {
              "href": "http://test.com", "title": "test"
            });
            equal(editableElement.innerHTML.toLowerCase(), '<a href="http://test.com" title="test">' + text + '</a>', "Link added correctly");
            
            // Change
            editor.composer.selection.selectNode(editor.editableElement);
            editor.composer.commands.exec('createLink', {
              "href": "http://changed.com"
            });
            equal(editableElement.innerHTML.toLowerCase(), '<a href="http://changed.com">' + text + '</a>', "Link attributes changed correctly when createLink is executed on existing link");
            
            //Remove
            editor.composer.selection.selectNode(editor.editableElement);
            editor.composer.commands.exec('removeLink');
            equal(editableElement.innerHTML, text, "Link remove correctly");
            
            // Create with caret
            editor.composer.selection.selectNode(editor.editableElement);
            editor.composer.selection.getSelection().collapseToStart();
            editor.composer.commands.exec('createLink', {
              "href": "http://test.com", "title": "test"
            });
            equal(editableElement.innerHTML.toLowerCase(), '<a href="http://test.com" title="test">http://test.com/</a> ' + text + '', "Link with caret added correctly");
            
            start();
          });
        });

  // create table
    asyncTest("Create table", function() {
       expect(1);
      var that = this,
          editor = new wysihtml5.Editor(this.editableArea),
          text = "test";
        
      editor.on("load", function() {
        var editableElement   = that.editableArea,
            expectText = '<table style="width: 100%;">' +
                           '<tbody>' +
                              '<tr>' +
                                '<td>&nbsp;</td>' +
                                '<td>&nbsp;</td>' +
                              '</tr>' +
                              '<tr>' +
                                '<td>&nbsp;</td>' +
                                '<td>&nbsp;</td>' +
                              '</tr>' +
                            '</tbody>' +
                          '</table>';
        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.commands.exec('createTable', {
          cols: 2,
          rows: 2,
          tableStyle: "width: 100%;" 
        });
        equal(editableElement.innerHTML.toLowerCase(), expectText, "Text corectly wrapped in one aligning div");
        start();
      });
    });
  
}