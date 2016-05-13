if (wysihtml.browser.supported()) {

  module("wysihtml.dom.insertCSS", {
    teardown: function() {
      var iframe;
      while (iframe = document.querySelector("iframe.wysihtml-sandbox")) {
        iframe.parentNode.removeChild(iframe);
      }
    }
  });

  asyncTest("Basic Tests", function() {
    expect(3);
  
    new wysihtml.dom.Sandbox(function(sandbox) {
      var doc     = sandbox.getDocument(),
          body    = doc.body,
          element = doc.createElement("sub");
    
      body.appendChild(element);
    
      wysihtml.dom.insertCSS([
        "sub  { display: block; text-align: right; }",
        "body { text-indent: 50px; }"
      ]).into(doc);
    
      equal(wysihtml.dom.getStyle("display")    .from(element), "block");
      equal(wysihtml.dom.getStyle("text-align") .from(element), "right");
      equal(wysihtml.dom.getStyle("text-indent").from(element), "50px");
    
      start();
    }).insertInto(document.body);
  });

  asyncTest("Check whether CSS is inserted before any loaded stylesheets", function() {
    expect(1);
  
    new wysihtml.dom.Sandbox(function(sandbox) {
      var doc = sandbox.getDocument();
      
      wysihtml.dom.insertCSS([".foo {}"]).into(doc);
      
      ok(doc.querySelector("style[type='text/css'] + link[rel=stylesheet]"), "CSS has been inserted before any included stylesheet");
      
      start();
    },  {
      stylesheets: "https://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/blitzer/jquery-ui.css"
    }).insertInto(document.body);
  });
  
}
