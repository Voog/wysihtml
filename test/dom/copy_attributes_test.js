module("wysihtml.dom.copyAttributes", {
  setup: function() {
    this.div        = document.createElement("div");
    this.span       = document.createElement("span");
    this.anotherDiv = document.createElement("div");
    this.iframe     = document.createElement("iframe");


    this.iframe.src = "javascript:'<html></html>'";
    document.body.appendChild(this.iframe);
  },

  teardown: function() {
    this.iframe.parentNode.removeChild(this.iframe);
  }
});


test("Basic Tests", function() {
  var attributes = { title: "foobar", lang: "en", className: "foo bar" };
  wysihtml.dom.setAttributes(attributes).on(this.div);
  wysihtml.dom.copyAttributes(["title", "lang", "className"]).from(this.div).to(this.span).andTo(this.anotherDiv);;

  equal(this.span.title, attributes.title, "Title correctly copied");
  equal(this.span.lang, attributes.lang, "Lang correctly copied");
  equal(this.span.className, attributes.className, "Class correctly copied");

  equal(this.anotherDiv.title, attributes.title, "Title correctly copied to second element");
  equal(this.anotherDiv.lang, attributes.lang, "Lang correctly copied to second element");
  equal(this.anotherDiv.className, attributes.className, "Class correctly copied to second element");
});


asyncTest("Test copying attributes from one element to another element which is in an iframe", function() {
  expect(1);

  var that = this;

  // Timeout needed to make sure that the iframe is ready
  setTimeout(function() {
    var iframeDocument = that.iframe.contentWindow.document,
        iframeElement = iframeDocument.createElement("div");

    iframeDocument.body.appendChild(iframeElement);
    that.span.title = "heya!";

    wysihtml.dom
      .copyAttributes(["title"])
      .from(that.span)
      .to(iframeElement);

    equal(iframeElement.title, "heya!", "Element in iframe correctly got attributes copied over");

    start();
  }, 1000);
});
