module("polyfills", {

  setup: function() {
      this.editable = document.createElement('div');
      this.editable.setAttribute('contenteditable', 'true');
      document.body.appendChild(this.editable);
  },

  teardown: function() {
    this.editable.parentNode.removeChild(this.editable);
  }
});

test("Check element.normalize is preserving caret position", function() {
  var text1 = document.createTextNode('test'),
      text2 = document.createTextNode('foo'),
      text3 = document.createTextNode('boo'),
      r = rangy.createRange(),
      s;

  this.editable.appendChild(text1);
  this.editable.appendChild(text2);
  this.editable.appendChild(text3);

  r.setStartAndEnd(text2, 3);
  r.select();

  this.editable.normalize();

  s = rangy.getSelection();

  ok(this.editable.childNodes.length === 1, "Normalize merged nodes");
  ok(s.anchorNode === this.editable.firstChild, "Anchor element is correct after normalize");
  ok(s.anchorOffset === 7 , "Anchor offset is correct after normalize");
});

test("Check element.normalize is preserving selection", function() {
  var text1 = document.createTextNode('test'),
      text2 = document.createTextNode('foo'),
      text3 = document.createTextNode('third'),
      text4 = document.createTextNode('fourth'),
      br = document.createElement('br'),
      r = rangy.createRange(),
      s;

  this.editable.appendChild(text1);
  this.editable.appendChild(text2);
  this.editable.appendChild(br);
  this.editable.appendChild(text3);
  this.editable.appendChild(text4);

  r.setStart(text2, 0);
  r.setEndAfter(br);
  r.select();

  this.editable.normalize();
  s = rangy.getSelection();

  ok(this.editable.childNodes.length === 3, "Normalize merged nodes");
  equal(s.anchorNode, this.editable.firstChild, "Anchor element is correct after normalize");
  equal(s.anchorOffset, 4 , "Anchor offset is correct after normalize");
  ok((s.focusNode === this.editable && s.focusOffset === 2)|| (s.focusNode === this.editable.lastChild && s.focusOffset === 0), "Focus element and offset is correct after normalize");
});

test("Check element.normalize is preserving selection 2", function() {
  var text1 = document.createTextNode('test'),
      text2 = document.createTextNode('foo'),
      text3 = document.createTextNode('third'),
      text4 = document.createTextNode('fourth'),
      br = document.createElement('br'),
      r = rangy.createRange(),
      s;

  this.editable.appendChild(text1);
  this.editable.appendChild(text2);
  this.editable.appendChild(br);
  this.editable.appendChild(text3);
  this.editable.appendChild(text4);

  r.setStartBefore(br);
  r.setEnd(text4, 0);
  r.select();

  this.editable.normalize();
  s = rangy.getSelection();

  ok(this.editable.childNodes.length === 3, "Normalize merged nodes");

  ok((s.anchorNode === this.editable && s.anchorOffset === 1) || (s.anchorNode === this.editable.firstChild && s.anchorOffset === this.editable.firstChild.length), "Anchor element and offset is correct after normalize");
  equal(s.focusNode, this.editable.childNodes[2], "Focus element is correct after normalize");
  equal(s.focusOffset, 5 , "Focus offset is correct after normalize");
});

test('Check if normalization bug checking restores original caret/selection position', function() {
  var input = document.createElement('input'),
      ceditable = document.createElement('div'),
      scrollOriginalPos, r;

  input.type = 'text';
  input.value = 'test';
  input.style.marginTop = '3000px';
  document.body.appendChild(input);
  input.focus();
  input.setSelectionRange(1, 3);

  scrollOriginalPos = window.pageYOffset;

  ok(document.activeElement === input && input.selectionStart === 1 && input.selectionEnd === 3 ,'input correctly selected');
  wysihtml.polyfills(window, document).normalizeHasCaretError();
  ok(document.activeElement === input && input.selectionStart === 1 && input.selectionEnd === 3 ,'input correctly selected after caret error testing');
  ok(scrollOriginalPos === window.pageYOffset, 'scroll position kept after caret error testing');
  document.body.removeChild(input);

  ceditable.setAttribute('contenteditable', true);
  ceditable.innerHTML = 'test';
  ceditable.style.marginTop = '3000px';
  document.body.appendChild(ceditable);
  ceditable.focus();
  r = rangy.createRange();
  r.setStart(ceditable.firstChild, 1);
  r.setEnd(ceditable.firstChild, 3);
  r.select();

  scrollOriginalPos = window.pageYOffset;

  ok(document.activeElement === ceditable && rangy.getSelection().anchorOffset === 1 && rangy.getSelection().focusOffset === 3,'contenteditable correctly selected');
  wysihtml.polyfills(window, document).normalizeHasCaretError();
  ok(document.activeElement === ceditable && rangy.getSelection().anchorOffset === 1 && rangy.getSelection().focusOffset === 3,'contenteditable correctly selected after caret error testing');
  ok(scrollOriginalPos === window.pageYOffset, 'scroll position kept after caret error testing');
  document.body.removeChild(ceditable);

});
