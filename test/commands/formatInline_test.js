if (wysihtml5.browser.supported()) {
  module("wysihtml5.Editor.commands.formatInline", {

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

  asyncTest("Format inline", function() {
    expect(30);
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
    };

    var blankSelectionStart = function(editor) {
      editor.setValue("test this text", true);
      editor.composer.selection.selectNode(editor.composer.element);
    };
        
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
      editableElement.firstChild.innerHTML = "test"; // empty nodes will be removed thus add some text for testing
      editor.composer.selection.selectNode(editableElement.firstChild);
      editor.composer.commands.exec("formatInline", {className : "test-class"});
      ok((/^<button>test<\/button>(<\/?br>)?$/).test(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, '')), "If no nodename given and node is not span, classname is removed but tag remains");

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

      blankCaretStart(editor);
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : "href", attributeValue: "http://www.google.com"});
      ok((/^<a href="http:\/\/www.google.com"><\/a>(<\/?br>)?$/).test(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, '')), "FormatInline given tag and attribute makes node with that name and attribute at caret");
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : "href", attributeValue: "http://www.google.com"});
      equal(!!editableElement.querySelector('a'), false, "Previous Insert is toggleable");

      blankSelectionStart(editor);
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : "href", attributeValue: "http://www.google.com"});
      equal(editableElement.innerHTML.toLowerCase(), '<a href="http://www.google.com">test this text</a>', "FormatInline wrapping selection with tag and attribute");
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : "href", attributeValue: "http://www.google.com"});
      equal(editableElement.innerHTML, "test this text", "Previous Insert is toggleable");

      blankCaretStart(editor);
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : {"href": "http://www.google.com", "target": "_blank"}});
      that.equal(('<a href="http://www.google.com" target="_blank"></a>'), editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, '').replace(/<br\/?>/gi, ''), "FormatInline given tag and attribute makes node with that name and attribute at caret");
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : {"href": "http://www.google.com", "target": "_self"}});
      that.equal(('<a href="http://www.google.com" target="_self"></a>'), editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, '').replace(/<br\/?>/gi, ''), "FormatInline given different attribute at first changes to new attribute");
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : {"href": "http://www.google.com", "target": "_self"}});
      equal(!!editableElement.querySelector('a'), false, "Previous Insert is toggleable");
     
      blankSelectionStart(editor);
      editor.composer.commands.exec("formatInline", "strong");
      editor.composer.commands.exec("formatInline", "b");
      equal(editableElement.innerHTML, "test this text", "Bold and strong are analogs");

      editor.setValue("this is a short text", true);
      that.setSelection(editor, editableElement.firstChild, 2 , editableElement.firstChild, 7);
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : {"href": "http://www.google.com", "target": "_blank"}});
      that.setSelection(editor, editableElement.querySelector('a').firstChild, 2 , editableElement.childNodes[2], 5);
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : {"href": "http://www.google.com", "target": "_blank"}});
      that.equal(editableElement.innerHTML.toLowerCase(), 'th<a href="http://www.google.com" target="_blank">is is a sh</a>ort text', 'extending link selection correctly');

      blankCaretStart(editor);
      editor.composer.commands.exec("formatInline", {nodeName: "button", styleProperty: "color", styleValue: "red", toggle: false});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, '').replace(/<br\/?>/gi, ''), '<button style="color: red;"></button>', "Adds custom button to curet");
      editor.composer.commands.exec("formatInline", {nodeName: "button", styleProperty: "color", styleValue: "red", toggle: false});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, '').replace(/<br\/?>/gi, ''), '<button style="color: red;"></button>', "Will not toggle if set to false");

      start();
    });
  });

  asyncTest("Format inline - caret/word-mode handling", function() {
     expect(17);
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

    var initString = function(editor, command, val, tag, txt, offset) {
      var editable = that.editableArea1,
          el;
      editor.setValue(txt, true);
      editor.composer.selection.selectNode(editable);
      if (command) {
        editor.composer.commands.exec(command, val);
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
      editor.composer.commands.exec('insertHTML', 'test');
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>" + text + "</b>test", "With caret at last position bold is not removed but set to notbold at caret");

      initString(editor, 'bold', null, 'b', text, 7);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once </b>upon<b> a time there was an unformated text.</b>" , "Bold is correctly removed from word that caret was in");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, 'bold', null, 'b', text, 5);
      editor.composer.commands.exec('bold');
      editor.composer.commands.exec('insertHTML','x');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once </b>x<b>upon a time there was an unformated text.</b>" , "Bold is correctly removed from caret but not word when caret first in word");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, 'bold', null, 'b', text, 9);
      editor.composer.commands.exec('bold');
      editor.composer.commands.exec('insertHTML','x');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once upon</b>x<b> a time there was an unformated text.</b>" , "Bold is correctly removed from caret but not word when caret last in word");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, false, null, false, text, 7);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "once <b>upon</b> a time there was an unformated text." , "Bold is correctly added to word that caret was in");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, false, null, false, text, 5);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "once <b></b>upon a time there was an unformated text." , "Bold is correctly added to caret but not to word when caret first in word");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, false, null, false, text, 9);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "once upon<b></b> a time there was an unformated text." , "Bold is correctly added to caret but not to word when caret last in wor");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      initString(editor, 'formatInline', {nodeName: "a", attribute : "href", attributeValue: "http://www.google.com"}, 'a', text, 7);
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : "href", attributeValue: "http://www.google.com"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), '<a href="http://www.google.com">once </a>upon<a href="http://www.google.com"> a time there was an unformated text.</a>' , "Link tag and href attribute is correctly removed from word that caret was in");
      ok(editor.composer.selection.getSelection().isCollapsed, "Text caret did remain collapsed");

      start();
    });
  });

  asyncTest("Format inline - similar cosequent tags merge", function() {
    expect(24);
    var that = this,
        text = "once upon a time there was an unformated text.",
        parserRules = {
          tags: {
            b: true,
            span: {
              "check_attributes": {
                "style": "any"
              }
            }
          }
        },
        editor = new wysihtml5.Editor(this.editableArea1, {
          parserRules: parserRules
        });

    var initString = function(editor, command, val, tag, txt, offset) {
      var editable = that.editableArea1,
          el;
      editor.setValue(txt, true);
      editor.composer.selection.selectNode(editable);
      if (command) {
        editor.composer.commands.exec(command, val);
      }
      el = (tag) ? editable.querySelector(tag).firstChild : editable.firstChild;
      if (offset === false) {
        editor.composer.selection.selectNode(el);
      } else {
        that.setCaretTo(editor, el, offset);
      }
    };
        
    editor.on("load", function() {
      var editableElement   = that.editableArea1;

      initString(editor, 'bold', null, 'b', text, 7);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once </b>upon<b> a time there was an unformated text.</b>" , "Tag of nodeName is correctly removed from word that caret was in");
      editor.composer.selection.selectNode(editor.composer.element);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once upon a time there was an unformated text.</b>" , "Tag of nodeName is reapplied and similar consequent tags merged on expanding selection");
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "once upon a time there was an unformated text." , "Selection preserved and toggleable");

      initString(editor, 'bold', null, 'b', text, 7);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once </b>upon<b> a time there was an unformated text.</b>" , "Tag of nodeName is correctly removed from word that caret was in");
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once upon a time there was an unformated text.</b>" , "Tag of nodeName is reapplied and similar consequent tags merged on toggle");
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once </b>upon<b> a time there was an unformated text.</b>" , "Caret preserved and toggleable");

      initString(editor, false, null, false, text, 7);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "once <b>upon</b> a time there was an unformated text." , "Bold added to word");
      editor.composer.selection.selectNode(editor.composer.element);
      editor.composer.commands.exec('bold');
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), "<b>once upon a time there was an unformated text.</b>" , "Tags extended on both ends and merged");

      initString(editor, false, null, false, text, 7);
      editor.composer.commands.exec('formatInline', {className: "test"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), 'once <span class="test">upon</span> a time there was an unformated text.' , "Class added to word");
      editor.composer.selection.selectNode(editor.composer.element);
      editor.composer.commands.exec('formatInline', {className: "test"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), '<span class="test">once upon a time there was an unformated text.</span>' , "Tag extended on both ends and merged");

      initString(editor, false, null, false, text, 7);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"rgb(255, 0, 0)"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), 'once <span style="color: rgb(255, 0, 0);">upon</span> a time there was an unformated text.' , "Style added to word");
      editor.composer.selection.selectNode(editor.composer.element);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"rgb(255, 0, 0)"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), '<span style="color: rgb(255, 0, 0);">once upon a time there was an unformated text.</span>' , "Tag extended on both ends and merged");

      initString(editor, 'formatInline', {className: "test"}, 'span', text, 7);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"red"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), '<span class="test">once <span style="color: red;">upon</span> a time there was an unformated text.</span>' , "Style added to word");
      editor.composer.selection.selectNode(editor.composer.element);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"red"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), '<span class="test"><span style="color: red;">once upon a time there was an unformated text.</span></span>' , "Tag extended on both ends and merged");

      initString(editor, false, null, false, text, 7);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"rgb(255, 0, 0)"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), 'once <span style="color: rgb(255, 0, 0);">upon</span> a time there was an unformated text.' , "Color added to word");
      that.setSelection(editor, editor.composer.element.childNodes[1].firstChild, 2, editor.composer.element.childNodes[2], 2);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"rgb(0, 255, 0)"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), 'once <span style="color: rgb(255, 0, 0);">up</span><span style="color: rgb(0, 255, 0);">on a</span> time there was an unformated text.' , "Different color partly changed and merged");
      
      initString(editor, false, null, false, text, 7);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"rgb(255, 0, 0)"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), 'once <span style="color: rgb(255, 0, 0);">upon</span> a time there was an unformated text.' , "Color added to word");
      that.setSelection(editor, editor.composer.element.childNodes[1].firstChild, 2, editor.composer.element.childNodes[2], 2);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"rgb(0, 255, 0)"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), 'once <span style="color: rgb(255, 0, 0);">up</span><span style="color: rgb(0, 255, 0);">on a</span> time there was an unformated text.' , "Different color partly changed and merged");
      
      initString(editor, 'formatInline', {styleProperty: "color", styleValue:"rgb(255, 0, 0)"}, 'span', text, 7);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"rgb(0, 255, 0)"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), '<span style="color: rgb(255, 0, 0);">once </span><span style="color: rgb(0, 255, 0);">upon</span><span style="color: rgb(255, 0, 0);"> a time there was an unformated text.</span>' , "Color property with different value split correctly");
      that.setSelection(editor, editor.composer.element.childNodes[0].firstChild, 2, editor.composer.element.childNodes[2].firstChild, 2);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"rgb(0, 0, 255)"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), '<span style="color: rgb(255, 0, 0);">on</span><span style="color: rgb(0, 0, 255);">ce upon a</span><span style="color: rgb(255, 0, 0);"> time there was an unformated text.</span>' , "Color property with different value split changed and merged correctly");

      initString(editor, false, null, false, text, 7);
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : "href", attributeValue: "http://www.google.com"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), 'once <a href="http://www.google.com">upon</a> a time there was an unformated text.' , "Tag and attribute added to word");
      editor.composer.selection.selectNode(editor.composer.element);
      editor.composer.commands.exec("formatInline", {nodeName: "a", attribute : "href", attributeValue: "http://www.google.com"});
      equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), '<a href="http://www.google.com">once upon a time there was an unformated text.</a>' , "Tags extended on both ends and merged");

      editor.setValue('<span style="color: rgb(1,2,3);">test1</span> <span style="color: rgb(4,5,6);">test2</span>', true);
      editor.composer.selection.selectNode(editableElement);
      editor.composer.commands.exec('formatInline', {styleProperty: "color", styleValue:"rgb(255, 0, 0)"});
      that.equal(editableElement.innerHTML.toLowerCase().replace(/\uFEFF/g, ''), '<span style="color: rgb(255, 0, 0);">test1 test2</span>' , "Empty spaces handles correctly on merge");


      editor.setValue("this line is a short text", true);
      that.setSelection(editor, editableElement.firstChild, 5 , editableElement.firstChild, 12);
      editor.composer.commands.exec("foreColorStyle", "rgb(255,0,0)");
      that.setSelection(editor, editableElement.childNodes[2], 3 , editableElement.childNodes[2], 8);
      editor.composer.commands.exec("foreColorStyle", "rgb(255,0,0)");
      that.setSelection(editor, editableElement.childNodes[1].firstChild, 2 , editableElement.childNodes[3].firstChild, 1);
      editor.composer.commands.exec("foreColorStyle", "rgb(255,0,0)");
      that.equal(editableElement.innerHTML.toLowerCase(), 'this <span style="color: rgb(255, 0, 0);">line is a short</span> text', 'extending color and parsing color correctly');

      start();
    });
  });
}
