if (wysihtml5.browser.supported()) {
  module("wysihtml5.quirks.cleanPastedHTML", {
    setup: function() {
      this.refNode = document.createElement("div");
      this.refNode.style.fontSize = "24px";
      this.refNode.style.color = "rgba(0,0,0)";
      this.uneditableClass = "wysihtml5-uneditable-container";
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
      "uneditableClass": this.uneditableClass
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
      "uneditableClass": this.uneditableClass
    };

    assert.htmlEqual(
      wysihtml5.quirks.cleanPastedHTML("test&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", options),
      "test &nbsp; &nbsp; ",
      "Correctly split nonbreakable spaces"
    );
  });

  test("Ruleset picking tests", function(assert) {
    var options = {
      "referenceNode": this.refNode,
      "rules": [
        {
          "condition": /class="?Mso/i,
          "set": {
            "tags": {
            }
          }
        },
        {
          "set": {
            "classes": "any",
            "comments": 1,
            "tags": {
              "p": {},
              "span": {}
            }
          }
        }
      ],
      "uneditableClass": this.uneditableClass
    };

    assert.htmlEqual(
      wysihtml5.quirks.cleanPastedHTML('<p class="MsoNormal">test</p>', options),
      "test",
      "Picked correctly to first ruleset"
    );
    assert.htmlEqual(
      wysihtml5.quirks.cleanPastedHTML('<p class="MsoNormal">test<!-- secret comment here --></p>', options),
      "test",
      "First ruleset removes comments correctly"
    );


    assert.htmlEqual(
      wysihtml5.quirks.cleanPastedHTML('<p class="SomeOtherClass">test</p>', options),
      '<p class="SomeOtherClass">test</p>',
      "Picked correctly to second ruleset"
    );
    assert.htmlEqual(
      wysihtml5.quirks.cleanPastedHTML('<p class="SomeOtherClass">test<!-- secret comment here --></p>', options),
      '<p class="SomeOtherClass">test<!-- secret comment here --></p>',
      "Second ruleset keeps comments correctly"
    );
  });

  test("Root color and font-size removal tests", function(assert) {
    var options = {
      "referenceNode": this.refNode,
      "rules": [{"set": {
        "tags": {
          "span": {
            "keep_styles": {
              "color": 1,
              "fontSize": 1
            }
          }
        }
      }}],
      "uneditableClass": this.uneditableClass
    };

    assert.htmlEqual(
      wysihtml5.quirks.cleanPastedHTML('<span style="color:rgba(0,0,0);font-size:24px;">test</span>', options),
      'test',
      "Correctly removed defult styles"
    );

    assert.htmlEqual(
      wysihtml5.quirks.cleanPastedHTML('<span style="color:rgb(1,2,3);">test</span>', options),
      '<span style="color:rgb(1,2,3);">test</span>',
      "Correctly kept different style"
    );

    assert.htmlEqual(
      wysihtml5.quirks.cleanPastedHTML('<span style="color:rgb(1,2,3); font-size: 24px;">test</span>', options),
      '<span style="color:rgb(1,2,3);">test</span>',
      "Correctly moved one and kept another"
    );

    assert.htmlEqual(
      wysihtml5.quirks.cleanPastedHTML('<span style="color:rgb(1,2,3); font-size: 35px;">test</span>', options),
      '<span style="color:rgb(1,2,3); font-size: 35px;">test</span>',
      "Correctly kept all styles"
    );
  });


}
