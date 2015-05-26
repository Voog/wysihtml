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
