module("wysihtml.dom.setStyles", {
  setup: function() {
    this.element = document.createElement("div");
    document.body.appendChild(this.element);
  },
  
  teardown: function() {
    this.element.parentNode.removeChild(this.element);
  }
});

test("Basic test", function() {
  wysihtml.dom.setStyles("text-align: right; float: left").on(this.element);
  equal(wysihtml.dom.getStyle("text-align").from(this.element), "right");
  equal(wysihtml.dom.getStyle("float").from(this.element),      "left");
  
  wysihtml.dom.setStyles({ "float": "right" }).on(this.element);
  equal(wysihtml.dom.getStyle("float").from(this.element), "right");
});