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

  asyncTest("Format inline", function() {
    expect(19);
    var that = this,
        parserRules = {
          "classes": "any",
          tags: {
            span: {
              "check_attributes": {
                "style": "any"
              }
            },
            button: {
              "check_attributes": {
                "style": "any"
              }
            },
            strong: 1
          }
        },
        editor = new wysihtml5.Editor(this.editableArea1, {
          parserRules: parserRules
        });

    var blankCaretStart = function(editor) {
      editor.setValue("", true);
      editor.composer.selection.selectNode(editor.composer.element);
      editor.composer.selection.getSelection().collapseToStart();
    }

    var blankSelectionStart = function(editor) {
      editor.setValue("test this text", true);
      editor.composer.selection.selectNode(editor.composer.element);
    }
        
    editor.on("load", function() {
      var editableElement  = that.editableArea1;
     
      blankCaretStart(editor);
      editor.composer.commands.exec("formatInline", "strong");
      ok((/^<strong><\/strong>(<\/?br>)?$/).test(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, '')), "FormatInline given string as parameter creates empty node with that tagName");
      editor.composer.commands.exec("formatInline", "strong");
      equal(!!editableElement.querySelector('strong'), false, "Previous Insert is toggleable");

      blankCaretStart(editor);
      editor.composer.commands.exec("formatInline", {className : "test-class"});
      ok((/^<span class="test-class"><\/span>(<\/?br>)?$/).test(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, '')), "FormatInline given only className maks span with that name");
      editor.composer.commands.exec("formatInline", {className : "test-class"});
      equal(!!editableElement.querySelector('span.test-class'), false, "Previous Insert is toggleable");
      
      blankCaretStart(editor);
      editor.composer.commands.exec("formatInline", {nodeName: "button", className : "test-class"});
      ok((/^<button class="test-class"><\/button>(<\/?br>)?$/).test(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, '')), "FormatInline given classname and nodeName works correctly");
      editor.composer.commands.exec("formatInline", {className : "test-class"});
      ok((/^<button><\/button>(<\/?br>)?$/).test(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, '')), "If no nodename given and node is not span, classname is removed but tag remains");

      blankSelectionStart(editor);
      editor.composer.commands.exec("formatInline", "strong");
      equal(editableElement.innerHTML.toLowerCase(), "<strong>test this text</strong>", "FormatInline wrapping selection correctly");
      editor.composer.commands.exec("formatInline", "strong");
      equal(editableElement.innerHTML, "test this text", "Previous Insert is toggleable");

      blankSelectionStart(editor);
      editor.composer.commands.exec("formatInline", "strong");
      equal(editableElement.innerHTML.toLowerCase(), "<strong>test this text</strong>", "FormatInline wrapping selection correctly");
      editor.composer.commands.exec("formatInline", "strong");
      equal(editableElement.innerHTML, "test this text", "Previous Insert is toggleable");

      blankSelectionStart(editor);
      editor.composer.commands.exec("formatInline", {nodeName: "button", className : "test-class"});
      equal(editableElement.innerHTML.toLowerCase(), '<button class="test-class">test this text</button>', "FormatInline wrapping selection with tag and class correctly");
      editor.composer.commands.exec("formatInline", {className : "test-class"});
      equal(editableElement.innerHTML.toLowerCase(), '<button>test this text</button>', "FormatInline removing class but keeping tag if tag not configured in options");

      blankSelectionStart(editor);
      editor.composer.commands.exec("formatInline", {nodeName: "button", styleProperty: "color", styleValue: "red" });
      equal(editableElement.innerHTML.toLowerCase(), '<button style="color: red;">test this text</button>', "FormatInline wrapping selection with tag and style correctly");
      editor.composer.commands.exec("formatInline", {nodeName: "button", styleProperty: "color", styleValue: "red" });
      equal(editableElement.innerHTML, "test this text", "Previous Insert is toggleable");

      blankSelectionStart(editor);
      editor.composer.commands.exec("formatInline", {nodeName: "button", styleProperty: "color", styleValue: "red" });
      equal(editableElement.innerHTML.toLowerCase(), '<button style="color: red;">test this text</button>', "FormatInline wrapping selection with tag and style correctly");
      editor.composer.commands.exec("formatInline", {nodeName: "button", styleProperty: "color", styleValue: "blue" });
      equal(editableElement.innerHTML.toLowerCase(), '<button style="color: blue;">test this text</button>', "FormatInline changing selection style correctly");
      editor.composer.commands.exec("formatInline", {styleProperty: "color", styleValue: "blue"});
      equal(editableElement.innerHTML.toLowerCase(), '<button>test this text</button>', "FormatInline removing style but keeping tag if tag not configured in options");
      editor.composer.commands.exec("formatInline", {nodeName: "button", styleProperty: "color", styleValue: "blue" });
      equal(editableElement.innerHTML.toLowerCase(), '<button style="color: blue;">test this text</button>', "Style is added to tag if not present and node not removed even if defined");

      editor.composer.commands.exec("formatInline", {nodeName: "button", styleProperty: "color", styleValue: "blue" });
      equal(editableElement.innerHTML.toLowerCase(), 'test this text', "Exact state toggles");
     
      start();
    });
  });

  asyncTest("Format inline caret/word-mode handling", function() {
     expect(15);
    var that = this,
        text = "once upon a time there was an unformated text.",
        parserRules = {
          tags: {
            b: true
          }
        },
        editor = new wysihtml5.Editor(this.editableArea1, {
          parserRules: parserRules
        });

    var initString = function(editor, command, tag, txt, offset) {
      var editable = that.editableArea1,
          el;
      editor.setValue(txt, true);
      editor.composer.selection.selectNode(editable);
      if (command) {
        editor.composer.commands.exec(command);
      }
      el = (tag) ? editable.querySelector(tag).firstChild : editable.firstChild;
      that.setCaretTo(editor, el, offset);
    }
        
    editor.on("load", function() {
      var editableElement   = that.editableArea1;
      
      editor.setValue(text, true);
      editor.composer.selection.selectNode(editableElement);
      editor.composer.commands.exec('bold');
      editor.composer.selection.getSelection().collapseToEnd();
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret is collapsed");
      editor.composer.commands.exec('bold');
      editor.composer.commands.exec('insertHtml', 'test');
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>" + text + "</b>test", "With caret at last position bold is not removed but set to notbold at caret");

      initString(editor, 'bold', 'b', text, 7);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once </b>upon<b> a time there was an unformated text.</b>" , "Bold is correctly removed from word that caret was in");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, 'bold', 'b', text, 5);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once </b><b>upon a time there was an unformated text.</b>" , "Bold is correctly removed from caret but not word when caret first in word");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, 'bold', 'b', text, 9);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once upon</b><b> a time there was an unformated text.</b>" , "Bold is correctly removed from caret but not word when caret last in word");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, false, false, text, 7);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "once <b>upon</b> a time there was an unformated text." , "Bold is correctly added to word that caret was in");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, false, false, text, 5);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "once <b></b>upon a time there was an unformated text." , "Bold is correctly added to caret but not to word when caret first in word");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, false, false, text, 9);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "once upon<b></b> a time there was an unformated text." , "Bold is correctly added to caret but not to word when caret last in wor");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");


      start();
    });
  });
  
// formatblock (alignment, headings, paragraph, pre, blockquote)
    asyncTest("Format block", function() {
       expect(14);
      var that = this,
          parserRules = {
              tags: {
                h1: true,
                h2: true,
                p: true,
                div: true,
                br: true
              }
            },
          editor = new wysihtml5.Editor(this.editableArea1, {
            parserRules: parserRules
          }),
          text = "once upon a time<br>there was an unformated text<br>spanning many lines.";

      var prepareMutipleBlocks = function(shiftEnds) {
        var text2 = "<h1>once upon a time</h1><p>there was a formated text</p>spanning many lines.";
        editor.setValue(text2, true);
        var heading = editor.editableElement.querySelector('h1'),
            paragraph = editor.editableElement.querySelector('p'),
            range = editor.composer.selection.createRange();

        if (!shiftEnds) {
          range.setStartBefore(heading);
          range.setEndAfter(paragraph);
        } else {
          range.setStart(heading.firstChild, 5);
          range.setEnd(paragraph.firstChild, 5);
        }

        editor.composer.selection.setSelection(range);
      };
        
      editor.on("load", function() {
        var editableElement   = that.editableArea1;
        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.commands.exec('justifyRight');
        equal(editableElement.innerHTML.toLowerCase(), '<div class="wysiwyg-text-align-right">' + text + '</div>', "Text corectly wrapped in one aligning div");

        editor.composer.selection.selectNode(editor.editableElement.querySelector('.wysiwyg-text-align-right'));
        editor.composer.commands.exec('formatBlock');
        equal(editableElement.innerHTML.toLowerCase(), text, "Aligning div correctly removed");

        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.commands.exec('alignRightStyle');
        equal(editableElement.innerHTML.toLowerCase(), '<div style="text-align: right;">' + text + '</div>', "Text corectly wrapped in one aligning div with style");

        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.selection.getSelection().collapseToStart();
        editor.composer.commands.exec('justifyRight');
        equal(editableElement.innerHTML.toLowerCase(), '<div class="wysiwyg-text-align-right">once upon a time</div><br>there was an unformated text<br>spanning many lines.', "Only first line correctly wrapped in aligning div");

        var node = editor.editableElement.querySelector('.wysiwyg-text-align-right').firstChild;
        editor.composer.selection.selectNode(node);
        editor.composer.commands.exec('justifyLeft');
        equal(editableElement.innerHTML.toLowerCase(), '<div class="wysiwyg-text-align-left">once upon a time</div><br>there was an unformated text<br>spanning many lines.', "First line wrapper class changed correctly");
        
        editor.composer.commands.exec('formatBlock', "h1");
        equal(editableElement.innerHTML.toLowerCase(), '<h1 class="wysiwyg-text-align-left">once upon a time</h1><br>there was an unformated text<br>spanning many lines.', "Alignment div changed to heading ok");
        
        editor.composer.commands.exec('justifyRight');
        editor.composer.commands.exec('formatBlock', "h1");
        editor.composer.commands.exec('justifyRight');
        equal(editableElement.innerHTML.toLowerCase(), '<h1>once upon a time</h1><br>there was an unformated text<br>spanning many lines.', "heading alignment removed sucessfully");
     
        
        editor.composer.commands.exec('alignRightStyle');
        editor.composer.commands.exec('alignRightStyle');
        equal(editableElement.innerHTML.toLowerCase(), '<h1>once upon a time</h1><br>there was an unformated text<br>spanning many lines.', "heading alignment with style removed sucessfully");
        
        editor.composer.commands.exec('formatBlock', "p");
        equal(editableElement.innerHTML.toLowerCase(), '<p>once upon a time</p><br>there was an unformated text<br>spanning many lines.', "heading changed to paragraph");

        
        // Tests covering multiple block elements

        prepareMutipleBlocks();
        editor.composer.commands.exec('formatBlock', "h2");
        equal(editableElement.innerHTML.toLowerCase(), '<h2>once upon a time</h2><h2>there was a formated text</h2>spanning many lines.', "Two block elements changed to heading 2");

        prepareMutipleBlocks();
        editor.composer.commands.exec('formatBlock', null);
        equal(editableElement.innerHTML.toLowerCase(), 'once upon a time<br>there was a formated text<br>spanning many lines.', "Two block elements removed");

        prepareMutipleBlocks(true);
        editor.composer.commands.exec('formatBlock', "h2");
        equal(editableElement.innerHTML.toLowerCase(), '<h1>once </h1><h2>upon a time</h2><h2>there</h2><p> was a formated text</p>spanning many lines.', "Selection covering 2 blocks escaped to heading 2");

        prepareMutipleBlocks(true);
        editor.composer.commands.exec('formatBlock');
        equal(editableElement.innerHTML.toLowerCase(), '<h1>once </h1>upon a time<br>there<br><p> was a formated text</p>spanning many lines.', "Format removed from Selection covering 2 blocks");


        prepareMutipleBlocks(true);
        editor.composer.commands.exec('formatBlock', "h1");
        editor.composer.commands.exec('formatBlock', "h2");
        equal(editableElement.innerHTML.toLowerCase(), '<h1>once </h1><h2>upon a time</h2><h2>there</h2><p> was a formated text</p>spanning many lines.', "Selection covering multiple blocks preserved fot subsequent modifications");


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
    
// createLink/removeLink
     /*   asyncTest("Create/remove link", function() {
           expect(4);
           
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
            that.equal(editableElement.innerHTML.toLowerCase(), '<a href="http://changed.com">' + text + '</a>', "Link attributes changed correctly when createLink is executed on existing link");
            
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
            that.equal(editableElement.innerHTML.toLowerCase(), '<a href="http://test.com" title="test">http://test.com/</a> ' + text + '', "Link with caret added correctly");
            
            start();
          });
        });*/

  // create table
    asyncTest("Create table", function() {
       expect(1);
      var that = this,
          editor = new wysihtml5.Editor(this.editableArea1),
          text = "test";
        
      editor.on("load", function() {
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
                          '</table>';
        editor.setValue(text, true);
        editor.composer.selection.selectNode(editor.editableElement);
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


  // create blockQuote
    asyncTest("Create blockquote", function() {
      expect(4);
      var that = this,
        editor = new wysihtml5.Editor(this.editableArea1, {
          parserRules: {
            tags: {
              h1: true,
              p: true,
              blockquote: true
            }
          }
        }),
        text = "<h1>heading</h1><p>text</p>",
        text2 = "test<h1>heading</h1>test";

      editor.on("load", function() {
        var editableElement   = that.editableArea1;

        editor.setValue(text, true);

        editor.composer.selection.selectNode(editor.editableElement);
        editor.composer.commands.exec('insertBlockQuote');
        equal(editableElement.innerHTML.toLowerCase(), "<blockquote>" + text + "</blockquote>" , "Blockquote created with headings and paragraphs preserved.");

        editor.composer.commands.exec('insertBlockQuote');
        equal(editableElement.innerHTML.toLowerCase(), text, "Blockquote removed with headings and paragraphs preserved.");


        editor.setValue(text2, true);
        editor.composer.selection.selectNode(editor.editableElement.querySelector('h1'));
        editor.composer.commands.exec('insertBlockQuote');
        equal(editableElement.innerHTML.toLowerCase(), "test<blockquote><h1>heading</h1></blockquote>test" , "Blockquote created.");

        editor.composer.commands.exec('insertBlockQuote');
        equal(editableElement.innerHTML.toLowerCase(), "test<h1>heading</h1>test" , "Blockquote removed.");

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
