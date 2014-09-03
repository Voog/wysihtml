if (wysihtml5.browser.supported()) {
  module("wysihtml5.quirks.cleanPastedHTML", {
    setup: function() {
      this.refNode = document.createElement("div");
      this.refNode.style.fontSize = "24px";
      this.refNode.style.color = "rgba(0,0,0)";
    },

    teardown: function() {
    }

  });

  test("Basic test", function(assert) {
    var rules = {
      tags: {
        "u": {},
        "a": {
          "check_attributes": {
            "href": "href",
            "rel": "any",
            "target": "any"
          }
        },
        "b": {}
      },
      selectors: {
        "a u": "unwrap"
      }
    };

    var options = {
      "referenceNode": this.refNode,
      "rules": [{"set":rules}],
      "uneditableClass": "wysihtml5-uneditable-container"
    };

    assert.htmlEqual(
      wysihtml5.quirks.cleanPastedHTML("<u>See: </u><a href=\"http://www.google.com\"><u><b>best search engine</b></u></a>", options),
      "<u>See: </u><a href=\"http://www.google.com\"><b>best search engine</b></a>",
      "Correctly removed <u> within <a>"
    );
  });

  test("Non-breakable space test", function(assert) {
    var options = {
      "referenceNode": this.refNode,
      "rules": [{"set": {}}],
      "uneditableClass": "wysihtml5-uneditable-container"
    };

    equal(
      wysihtml5.quirks.cleanPastedHTML("test&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", options),
      "test &nbsp; &nbsp; ",
      "Correctly split nonbreakable spaces"
    );
  });
}
