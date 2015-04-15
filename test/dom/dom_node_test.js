module("wysihtml5.dom.domNode", {
  setup: function() {
    this.container = document.createElement("div");
  }
});

test("Simple .prev() test", function() {
  this.container.innerHTML = "<span></span><div></div>";
  var lastItem = this.container.querySelector("div"),
    firstItem = this.container.querySelector("span");
  equal(wysihtml5.dom.domNode(lastItem).prev(), firstItem);
});

test(".prev() test with textnode in between", function() {
  this.container.innerHTML = "<span></span> confusing text node <div></div>";
  var lastItem = this.container.querySelector("div"),
    firstItem = this.container.querySelector("span");
  equal(wysihtml5.dom.domNode(lastItem).prev({nodeTypes: [1]}), firstItem);
});

test(".prev() test if no prev element exists", function() {
  this.container.innerHTML = "<div></div>";
  var lastItem = this.container.querySelector("div");
  equal(wysihtml5.dom.domNode(lastItem).prev(), null);
});

test(".prev() test if no prev element exists with textnode", function() {
  this.container.innerHTML = "confusing text node <div></div>";
  var lastItem = this.container.querySelector("div");
  equal(wysihtml5.dom.domNode(lastItem).prev({nodeTypes: [1]}), null);
});

test(".prev() test with empty textnode in between and ignoreBlankTexts", function() {
  this.container.innerHTML = "<span></span> <div></div>";
  var lastItem = this.container.querySelector("div"),
    firstItem = this.container.querySelector("span");
  equal(wysihtml5.dom.domNode(lastItem).prev({ignoreBlankTexts: true}), firstItem);
});

test("Simple .next() test", function() {
  this.container.innerHTML = "<div></div><span></span>";
  var firstItem = this.container.querySelector("div"),
    lastItem = this.container.querySelector("span");
  equal(wysihtml5.dom.domNode(firstItem).next(), lastItem);
});

test(".next() test with textnode in between", function() {
  this.container.innerHTML = "<div></div> confusing text node <span></span>";
  var firstItem = this.container.querySelector("div"),
    lastItem = this.container.querySelector("span");
  equal(wysihtml5.dom.domNode(firstItem).next({nodeTypes: [1]}), lastItem);
});

test(".next() test if no next element exists", function() {
  this.container.innerHTML = "<div></div>";
  var lastItem = this.container.querySelector("div");
  equal(wysihtml5.dom.domNode(lastItem).next(), null);
});

test(".next() test if no next element exists with textnode", function() {
  this.container.innerHTML = "<div></div> confusing text node ";
  var lastItem = this.container.querySelector("div");
  equal(wysihtml5.dom.domNode(lastItem).next({nodeTypes: [1]}), null);
});

test(".next() test with empty textnode in between and ignoreBlankTexts", function() {
  this.container.innerHTML = "<div></div> <span></span>";
  var firstItem = this.container.querySelector("div"),
    lastItem = this.container.querySelector("span");
  equal(wysihtml5.dom.domNode(firstItem).next({ignoreBlankTexts: true}), lastItem);
});

test(".lastLeafNode() test for element that is last leaf itself", function () {
  this.container.innerHTML = "";
  equal(wysihtml5.dom.domNode(this.container).lastLeafNode(), this.container);
});

test(".lastLeafNode() test for inner elements traversing", function () {
  var txtNode = document.createTextNode("test"),
      elementNode = document.createElement('div'),
      innerElementNode = document.createElement('div');

  this.container.innerHTML = "";

  this.container.appendChild(txtNode);
  equal(wysihtml5.dom.domNode(this.container).lastLeafNode(), txtNode, "Found last only child textnode");

  this.container.appendChild(elementNode);
  equal(wysihtml5.dom.domNode(this.container).lastLeafNode(), elementNode, "Found last div element");

  elementNode.appendChild(innerElementNode);
  equal(wysihtml5.dom.domNode(this.container).lastLeafNode(), innerElementNode, "Found last wrapped div element");

  this.container.insertBefore(elementNode, txtNode);
  equal(wysihtml5.dom.domNode(this.container).lastLeafNode(), txtNode, "Found last textnode after reordering elements");
});

test(".lastLeafNode() test for leafClasses option", function () {
  var elementNode = document.createElement('div'),
      innerElementNode = document.createElement('div');

  this.container.innerHTML = "";

  elementNode.className = "forced-leaf";
  elementNode.appendChild(innerElementNode);
  this.container.appendChild(elementNode);
  
  equal(wysihtml5.dom.domNode(this.container).lastLeafNode(), innerElementNode, "Wihout leafClasses option finds inner element node");
  equal(wysihtml5.dom.domNode(this.container).lastLeafNode({leafClasses: ['forced-leaf']}), elementNode, "With leafClasses option, stops search and returns the element with leafClass");
});


test(".escapeParent()", function() {
  var bold = document.createElement('B'),
      underline = document.createElement('U'),
      italic = document.createElement('I'),
      text1 = document.createTextNode('text1'),
      text2 = document.createTextNode('text2'),
      text3 = document.createTextNode('text3');

  this.container.innerHTML = "";

  italic.appendChild(text1);
  italic.appendChild(text2);
  italic.appendChild(text3);

  underline.appendChild(italic);
  bold.appendChild(underline);
  this.container.appendChild(bold);

  wysihtml5.dom.domNode(text2).escapeParent(bold);

  equal(this.container.innerHTML, "<b><u><i>text1</i></u></b><u><i>text2</i></u><b><u><i>text3</i></u></b>", "Parent split and node with parents escaped correctly");

});





