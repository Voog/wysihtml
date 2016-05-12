module("wysihtml.lang.array");

test("contains()", function() {
  var arr = [1, "2", "foo"];
  ok(wysihtml.lang.array(arr).contains(1));
  ok(!wysihtml.lang.array(arr).contains(2));
  ok(wysihtml.lang.array(arr).contains("2"));
  ok(wysihtml.lang.array(arr).contains("foo"));
});

test("without()", function() {
  var arr = [1, 2, 3];
  deepEqual(wysihtml.lang.array(arr).without([1]), [2, 3]);
  deepEqual(wysihtml.lang.array(arr).without([4]), [1, 2, 3]);
});

test("get()", function() {
  var nodeList = document.getElementsByTagName("*"),
      arr      = wysihtml.lang.array(nodeList).get();
  equal(arr.length, nodeList.length);
  ok(arr instanceof Array);
});