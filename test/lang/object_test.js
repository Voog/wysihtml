module("wysihtml5.lang.object");

test("merge()", function() {
  var obj         = { foo: 1, bar: 1 },
      returnValue = wysihtml5.lang.object(obj).merge({ bar: 2, baz: 3 }).get();
  equal(returnValue, obj);
  deepEqual(obj, { foo: 1, bar: 2, baz: 3 });
});

test("clone()", function() {
  var obj = { foo: true },
      returnValue = wysihtml5.lang.object(obj).clone();
  ok(obj != returnValue);
  deepEqual(obj, returnValue);
});

test("deep clone()", function() {
  var obj = {
      boo : {
        foo: true
      }
    },
    returnValueShallow = wysihtml5.lang.object(obj).clone(),
    returnValueDeep = wysihtml5.lang.object(obj).clone(true);

  ok(obj != returnValueShallow && obj.boo === returnValueShallow.boo);
  deepEqual(obj, returnValueShallow);

  ok(obj != returnValueDeep && obj.boo !== returnValueDeep.boo);
  deepEqual(obj, returnValueDeep);
});

test("isArray()", function() {
  ok(wysihtml5.lang.object([]).isArray());
  ok(!wysihtml5.lang.object({}).isArray());
  ok(!wysihtml5.lang.object(document.body.childNodes).isArray());
  ok(!wysihtml5.lang.object("1,2,3").isArray());
});

test("isFunction()", function() {
  ok(wysihtml5.lang.object(function() {}).isFunction());
  ok(!wysihtml5.lang.object({}).isFunction());
  ok(!wysihtml5.lang.object([]).isFunction());
  ok(!wysihtml5.lang.object(document.body.childNodes).isFunction());
  ok(!wysihtml5.lang.object("1,2,3").isFunction());
});