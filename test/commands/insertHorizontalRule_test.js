if (wysihtml.browser.supported()) {
  module('wysihtml.Editor.commands.InsertHorizontalRule', {
    setup: function() {
      this.originalBodyClassName = document.body.className;
      this.editableArea = document.createElement('div');
      this.htmlTemplate = 'Some blank text<br>on multiple lines<h1>And a heading <a href="#">containing a link</a></h1><p>Followed by a parahraph</p><div>And a div </div>';
      document.body.appendChild(this.editableArea);
    },

    teardown: function() {
      if (this.editableArea.parentNode) {
        this.editableArea.parentNode.removeChild(this.editableArea);
      }
      document.body.className = this.originalBodyClassName;
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
  });

  asyncTest('Insert HR at various places with caret', function() {
    expect(7);
    var parserRules = {
        tags: {
          h1: true,
          p: true,
          div: true,
          br: true,
          a: true
        }
      },
      editor = new wysihtml.Editor(this.editableArea, {
        parserRules: parserRules
      });

    editor.on('load', function() {
      var prev;

      editor.setValue(this.htmlTemplate, true);
      this.setCaretTo(editor, this.editableArea.firstChild, 3);
      editor.composer.commands.exec('insertHorizontalRule');
      ok(this.editableArea.firstChild.nodeType === 3 && this.editableArea.firstChild.data === 'Som' && this.editableArea.childNodes[1].nodeType === 1 && this.editableArea.childNodes[1].nodeName === 'HR', 'HR inserted to plain text correctly');

      editor.composer.commands.exec('insertHTML', 'test');
      ok(this.editableArea.childNodes[2].nodeType === 3 && this.editableArea.childNodes[2].data === 'test', 'Caret is corretctly after HR');

      editor.setValue(this.htmlTemplate, true);
      this.setCaretTo(editor, this.editableArea.querySelector('h1').firstChild, 3);
      editor.composer.commands.exec('insertHorizontalRule');
      ok(this.editableArea.querySelector('hr').parentNode === this.editableArea, 'HR correctly splits out of heading');

      editor.setValue(this.htmlTemplate, true);
      this.setCaretTo(editor, this.editableArea.querySelector('p').firstChild, 3);
      editor.composer.commands.exec('insertHorizontalRule');
      ok(this.editableArea.querySelector('hr').parentNode === this.editableArea, 'HR correctly splits out of paragraph');

      editor.setValue(this.htmlTemplate, true);
      this.setCaretTo(editor, this.editableArea.querySelector('a').firstChild, 3);
      editor.composer.commands.exec('insertHorizontalRule');
      ok(this.editableArea.querySelector('hr').parentNode === this.editableArea, 'HR correctly splits out of heading and contained link');

      editor.setValue(this.htmlTemplate, true);
      this.setCaretTo(editor, this.editableArea.querySelector('div').firstChild, 3);
      editor.composer.commands.exec('insertHorizontalRule');
      ok(this.editableArea.querySelector('hr').parentNode === this.editableArea.querySelector('div'), 'HR correctly inserted into div');
      prev = this.editableArea.querySelector('hr').previousSibling;
      ok(prev && prev.nodeType === 3 && prev.data === 'And', 'HR correctly inserted into div');

      start();
    }.bind(this));
  });

  asyncTest('Insert HR at various places with selection', function() {
    expect(7);

    var parserRules = {
          tags: {
            h1: true,
            p: true,
            div: true,
            br: true,
            a: true
          }
        },
        editor = new wysihtml.Editor(this.editableArea, {
          parserRules: parserRules
        });

    editor.on('load', function() {
      var prev;

      editor.setValue(this.htmlTemplate, true);
      this.setSelection(editor, this.editableArea.firstChild, 4, this.editableArea.childNodes[2], 3);
      editor.composer.commands.exec('insertHorizontalRule');
      ok(this.editableArea.firstChild.nodeType === 3 && this.editableArea.firstChild.data === 'Some', 'Selection start handled correctly');
      ok(this.editableArea.childNodes[1].nodeType === 1 && this.editableArea.childNodes[1].nodeName === 'HR', 'Hr inserted at correct spot');

      ok(this.editableArea.childNodes[2].nodeType === 3 && this.editableArea.childNodes[2].data === 'multiple lines', 'Selected text removed and Selection end handled correctly');
      editor.composer.commands.exec('insertHTML', 'test');
      ok(this.editableArea.childNodes[2].nodeType === 3 && this.editableArea.childNodes[2].data === 'test', 'Caret is corretctly after HR');

      editor.setValue(this.htmlTemplate, true);
      this.setSelection(editor, this.editableArea.querySelector('a').firstChild, 10, this.editableArea.querySelector('p').firstChild, 9);
      editor.composer.commands.exec('insertHorizontalRule');
      ok(this.editableArea.querySelector('a').innerHTML === 'containing', 'Wrapped start in link split correctly');
      ok(this.editableArea.querySelector('h1').lastChild === this.editableArea.querySelector('a') &&
         this.editableArea.querySelector('h1').nextSibling.nodeType === 1 &&
         this.editableArea.querySelector('h1').nextSibling.nodeName === 'HR' &&
         this.editableArea.querySelector('h1').nextSibling.nextSibling.nodeType === 1 &&
         this.editableArea.querySelector('h1').nextSibling.nextSibling.nodeName === 'P', 'HR inserted at correct place: escaping H1 and P');
      ok(this.editableArea.querySelector('p').innerHTML === 'by a parahraph', 'End of selection text split and removed correctly from P');

      start();
    }.bind(this));
  });


}
