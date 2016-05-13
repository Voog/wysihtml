if ("querySelector" in document || wysihtml.browser.supportsNativeGetElementsByClassName()) {
  module("wysihtml.dom.hasElementWithClassName", {
    teardown: function() {
      var iframe;
      while (iframe = document.querySelector("iframe.wysihtml-sandbox")) {
        iframe.parentNode.removeChild(iframe);
      }
    }
  });


  asyncTest("Basic test", function() {
    expect(3);
    
    new wysihtml.dom.Sandbox(function(sandbox) {
      var doc         = sandbox.getDocument(),
          tempElement = doc.createElement("i");
      tempElement.className = "wysiwyg-color-aqua";

      ok(!wysihtml.dom.hasElementWithClassName(doc, "wysiwyg-color-aqua"));
      doc.body.appendChild(tempElement);
      ok(wysihtml.dom.hasElementWithClassName(doc, "wysiwyg-color-aqua"));
      tempElement.parentNode.removeChild(tempElement);
      ok(!wysihtml.dom.hasElementWithClassName(doc, "wysiwyg-color-aqua"));

      start();
    }).insertInto(document.body);
  });
}
