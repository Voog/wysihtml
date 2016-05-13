module("wysihtml.dom.observe", {
  setup: function() {
    this.container  = document.createElement("div");
    this.element    = document.createElement("textarea");
    this.container.appendChild(this.element);
    document.body.appendChild(this.container);
  },
  
  teardown: function() {
    this.container.parentNode.removeChild(this.container);
    
    var iframe;
    while (iframe = document.querySelector("iframe.wysihtml-sandbox")) {
      iframe.parentNode.removeChild(iframe);
    }
  }
});


test("Basic test", function() {
  expect(4);
  
  var element = this.element;
  
  wysihtml.dom.observe(element, ["mouseover", "mouseout"], function(event) {
    ok(true, "'" + event.type + "' correctly fired");
  });
  
  wysihtml.dom.observe(element, "click", function(event) {
    equal(event.target, element, "event.target or event.srcElement are set");
    ok(true, "'click' correctly fired");
  });
  
  happen.once(element, {type: "mouseover"});
  happen.once(element, {type: "mouseout"});
  happen.once(element, {type: "click"});
});


test("Test stopPropagation and scope of event handler", function(event) {
  expect(2);
  var element = this.element;
  
  wysihtml.dom.observe(this.container, "click", function(event) {
    ok(false, "The event shouldn't have been bubbled!");
  });
  
  wysihtml.dom.observe(this.element, "click", function(event) {
    event.stopPropagation();
    equal(this, element, "Event handler bound to correct scope");
    ok(true, "stopPropagation correctly fired");
  });
  
  happen.once(this.element, {type: "click"});
});

test("Test detaching events", function() {
  expect(0);
  var eventListener = wysihtml.dom.observe(this.element, "click", function() {
    ok(false, "This should not be triggered");
  });
  
  eventListener.stop();
  happen.once(this.element, {type: "click"});
});

asyncTest("Advanced test observing within a sandboxed iframe", function() {
  expect(2);
  
  var sandbox = new wysihtml.dom.Sandbox(function() {
    var element = sandbox.getDocument().createElement("div");
    sandbox.getDocument().body.appendChild(element);
    wysihtml.dom.observe(element, ["click", "mousedown"], function(event) {
      ok(true, "'" + event.type + "' correctly fired");
    });
    happen.click(element);
    happen.mousedown(element);
    
    start();
  });
  
  sandbox.insertInto(document.body);
});
