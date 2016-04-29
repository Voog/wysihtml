module("wysihtml.dom.setAttributes", {
  setup: function() {
    this.element = document.createElement("div");
  }
});

test("Basic test", function() {
  wysihtml.dom.setAttributes({
    id:       "foo",
    "class":  "bar"
  }).on(this.element);
  
  equal(this.element.id, "foo");
  equal(this.element.className, "bar");
});