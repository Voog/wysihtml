if (wysihtml5.browser.supported()) {
  module("wysihtml5.Editor.commands", {
    setup: function() {
        
      this.editableArea1        = document.createElement("div");
      this.editableArea1.id     = "wysihtml5-test-editable1";
      this.editableArea1.className = "wysihtml5-test-class1";
      this.editableArea1.title  = "Please enter your foo";
      this.editableArea1.innerHTML  = "hey tiff, what's up?";
      
      document.body.appendChild(this.editableArea1);
      
    },

    setCaretTo: function(editor, el, offset) {
        var r1 = editor.composer.selection.createRange();

        r1.setEnd(el, offset);
        r1.setStart(el, offset);
        editor.composer.selection.setSelection(r1);
    },

    setSelection: function(editor, el, offset, el2, offset2) {
      var r1 = editor.composer.selection.createRange();
      r1.setEnd(el2, offset2);
      r1.setStart(el, offset);
      editor.composer.selection.setSelection(r1);
    },

    teardown: function() {
      var leftover;
      this.editableArea1.parentNode.removeChild(this.editableArea1);
      while (leftover = document.querySelector("div.wysihtml5-test-class1, iframe.wysihtml5-sandbox, div.wysihtml5-sandbox")) {
        leftover.parentNode.removeChild(leftover);
      }
      document.body.className = this.originalBodyClassName;
    },

    equal: function(actual, expected, message) {
      return QUnit.assert.htmlEqual(actual, expected, message);
    },
  });
  
  
// bold, italic, underline
  asyncTest("Basic formating tests", function() {
     expect(12);
    var that = this,
        text = "once upon a time there was an unformated text.",
        parserRules = {
          tags: {
            b: true,
            i: true,
            u: true
          }
        },
        editor = new wysihtml5.Editor(this.editableArea1, {
          parserRules: parserRules
        });
        
    editor.on("load", function() {
      var editableElement   = that.editableArea1,
          sel;
      
      // basic bold
      
      editor.setValue(text, true);
      editor.composer.selection.selectNode(editableElement);
      
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase(), "<b>" + text + "</b>", "Command bold sets text as bold correctly");

      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase(), text, "Command bold unset text from bold correctly");

      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase(), "<b>" + text + "</b>", "Command bold toggle works 1");
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase(), text, "Command bold toggle works 2");

      equal(editableElement.childNodes.length, 1, "No empty textnodes left behind");
      equal(editableElement.firstChild.nodeType, 3, "Only node is textnode");
      sel = editor.composer.selection.getSelection();
      equal(sel.anchorNode, editableElement.firstChild, "Selction anchor node correct");
      equal(sel.anchorOffset, 0, "Selction anchor offset correct");
      equal(sel.focusNode, editableElement.firstChild, "Selction afocus node correct");
      equal(sel.focusOffset,editableElement.firstChild.data.length, "Selction focus offset correct");

      // basic italic
      editor.setValue(text, true);
      editor.composer.selection.selectNode(editableElement);
      editor.composer.commands.exec('italic');
      equal(editableElement.innerHTML.toLowerCase(), "<i>" + text + "</i>", "Command italic sets text as italic correctly");

      // basic underline
      editor.setValue(text, true);
      editor.composer.selection.selectNode(editableElement);
      editor.composer.commands.exec('underline');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<u>" + text + "</u>", "Command underline sets text as underline correctly");

      start();
    });
  });

// Format code
  asyncTest("Format code", function() {
       expect(2);
      var that = this,
          editor = new wysihtml5.Editor(this.editableArea1),
          text = "once upon a time there was an unformated text.";
        
      editor.on("load", function() {
        var editableElement   = that.editableArea1;
        editor.setValue(text, true);

        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.commands.exec('formatCode', 'language-html');
        equal(editableElement.innerHTML.toLowerCase(), '<pre><code class="language-html">' + text + '</code></pre>', "Text corectly wrapped in pre and code and classname addded");
    
        editor.composer.commands.exec('formatCode', 'language-html');
        equal(editableElement.innerHTML.toLowerCase(), text, "Code block correctly removed");

        start();
      });
    });
    
 //createLink/removeLink
  asyncTest("Create/remove link", function() {
     expect(5);
     
    var that = this,
        editor = new wysihtml5.Editor(this.editableArea1),
        text = "text";
  
    editor.on("load", function() {
      var editableElement   = that.editableArea1;
      editor.setValue(text, true);
      editor.composer.selection.selectNode(editor.editableElement);
      
      // Create
      editor.composer.commands.exec('createLink', {
        "href": "http://test.com", "title": "test"
      });
      that.equal(editableElement.innerHTML.toLowerCase(), '<a href="http://test.com" title="test">' + text + '</a>', "Link added correctly");
      
      // Change
      editor.composer.selection.selectNode(editor.editableElement);
      editor.composer.commands.exec('createLink', {
        "href": "http://changed.com"
      });
      that.equal(editableElement.innerHTML.toLowerCase(), '<a href="http://changed.com" title="test">' + text + '</a>', "Link attributes changed correctly when createLink is executed on existing link");
      
      //Remove
      editor.composer.selection.selectNode(editor.editableElement);
      editor.composer.commands.exec('removeLink');
      that.equal(editableElement.innerHTML, text, "Link remove correctly");
      
      // Create with caret
      editor.composer.selection.selectNode(editor.editableElement);
      editor.composer.selection.getSelection().collapseToStart();
      editor.composer.commands.exec('createLink', {
        "href": "http://test.com", "title": "test"
      });
      that.equal(editableElement.innerHTML.toLowerCase(), '<a href="http://test.com" title="test">http://test.com</a>' + text + '', "Link with caret added correctly");


      editor.setValue("this is a short text", true);
      that.setSelection(editor, editableElement.firstChild, 2 , editableElement.firstChild, 7);
      editor.composer.commands.exec('createLink', {
        "href": "http://test.com", "title": "test"
      });
      that.setSelection(editor, editableElement.querySelector('a').firstChild, 2 , editableElement.childNodes[2], 5);
      editor.composer.commands.exec('createLink', {
        "href": "http://test.com", "title": "test"
      });
      that.equal(editableElement.innerHTML.toLowerCase(), 'th<a href="http://test.com" title="test">is is a sh</a>ort text', 'extending link selection correctly');
                                                   
      start();
    });
  });

  // create table
    asyncTest("Create table", function() {
       expect(1);
      var that = this,
          editor = new wysihtml5.Editor(this.editableArea1),
          text = "test";
        
      editor.on("load", function() {
        editor.focus();
        var editableElement   = that.editableArea1,
            expectText = '<table style="width: 100%;">' +
                           '<tbody>' +
                              '<tr>' +
                                '<td><br></td>' +
                                '<td><br></td>' +
                              '</tr>' +
                              '<tr>' +
                                '<td><br></td>' +
                                '<td><br></td>' +
                              '</tr>' +
                            '</tbody>' +
                          '</table><br>';
        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement.firstChild);
        editor.composer.commands.exec('createTable', {
          cols: 2,
          rows: 2,
          tableStyle: "width: 100%;"
        });
        equal(editableElement.innerHTML.toLowerCase(), expectText, "Table correctly created");
        start();
      });
    });

  // create table
    asyncTest("Create lists", function() {
      expect(7);
      var that = this,
          editor = new wysihtml5.Editor(this.editableArea1),
          text = "";
        
      editor.on("load", function() {
        editor.focus();
        var editableElement   = that.editableArea1,
            expectText = '<ul><li></li></ul>',
            expectTextBr = '<ul><li><br></li></ul>',
            expectTextWithContents = '<ul><li>text</li></ul>',
            expectTextWithContentsBr = '<ul><li>text<br></li></ul>',
            expectOrdText = '<ol><li></li></ol>',
            expectOrdTextBr = '<ol><li><br></li></ol>',
            expectOrdTextWithContents = '<ol><li>text</li></ol>',
            expectOrdTextWithContentsBr = '<ol><li>text<br></li></ol>';

        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.commands.exec('insertUnorderedList');
        ok(editableElement.innerHTML.toLowerCase() == expectText || editableElement.innerHTML.toLowerCase() == expectTextBr, "Unordered list created");

        editor.composer.commands.exec('insertHTML', 'text');
        ok(editableElement.innerHTML.toLowerCase() == expectTextWithContents || editableElement.innerHTML.toLowerCase() == expectTextWithContentsBr , "In unordered list placed caret correctly");

        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.commands.exec('insertOrderedList');
        ok(editableElement.innerHTML.toLowerCase() == expectOrdText || editableElement.innerHTML.toLowerCase() == expectOrdTextBr, "Ordered list created");

        editor.composer.commands.exec('insertHTML', 'text');
        ok(editableElement.innerHTML.toLowerCase() == expectOrdTextWithContents || editableElement.innerHTML.toLowerCase() == expectOrdTextWithContentsBr, "In ordered list placed caret correctly");

        editableElement.innerHTML = '<ul><li>test</li><li class="second">test</li><li>test</li></ul>';
        editor.composer.selection.selectNode(editor.editableElement.querySelector('.second'));
        editor.composer.commands.exec('indentList');
        equal(editableElement.innerHTML.toLowerCase(), '<ul><li>test<ul><li class="second">test</li></ul></li><li>test</li></ul>', "List indent increases level correctly");

        editor.composer.commands.exec('outdentList');
        equal(editableElement.innerHTML.toLowerCase(), '<ul><li>test</li><li class="second">test</li><li>test</li></ul>', "List outdent decreases level correctly");

        editor.composer.commands.exec('outdentList');
        equal(editableElement.innerHTML.toLowerCase(), '<ul><li>test</li></ul><br>test<ul><li>test</li></ul>', "List outdent escapes current list item correctly out of list");
        start();
      });
    });

  // sub/super script
    asyncTest("Create subscript / superscript", function() {
      expect(2);
      var that = this,
        editor = new wysihtml5.Editor(this.editableArea1, {
          parserRules: {
            tags: {
              sub: true,
              sup: true
            }
          }
        }),
        text = "this is a text";

      editor.on("load", function() {
        var editableElement   = that.editableArea1;

        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.commands.exec('subscript');
        equal(editableElement.innerHTML.toLowerCase(), "<sub>" + text + "</sub>" , "Subscript added sucessfully.");

        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.commands.exec('superscript');
        equal(editableElement.innerHTML.toLowerCase(), "<sup>" + text + "</sup>" , "Superscript added sucessfully.");

        start();
      });
    });


  
}
