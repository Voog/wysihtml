module("wysihtml.lang.object");

test("merge()", function() {
  var obj         = { foo: 1, bar: 1 },
      returnValue = wysihtml.lang.object(obj).merge({ bar: 2, baz: 3 }).get();
  equal(returnValue, obj);
  deepEqual(obj, { foo: 1, bar: 2, baz: 3 });
});

test("deep merge()", function() {
  var obj = {
        foo: 1,
        bar: 1,
        o1: "test",
        o2: {
          a:1,
          b:1
        }
      },
      mergeObj = {
        bar: 2,
        baz: 3,
        o1: {
          a: 1,
          b: 1
        },
        o2: {
          a: 2,
          b: undefined,
          c: 3
        }
      },
      expectedObj = {
        foo: 1,
        bar: 2,
        baz: 3,
        o1: {
          a: 1,
          b: 1
        },
        o2: {
          a: 2,
          b: undefined,
          c: 3
        }
      },
      returnValue = wysihtml.lang.object(obj).merge(mergeObj, true).get();

  equal(returnValue, obj, "Original object reference kept and returned");
  deepEqual(mergeObj, {
    bar: 2,
    baz: 3,
    o1: {
      a: 1,
      b: 1
    },
    o2: {
      a: 2,
      b: undefined,
      c: 3
    }
  }, "Did not alter the merged object");
  deepEqual(obj, expectedObj, "original object merged correctly");
});

test("clone()", function() {
  var obj = { foo: true },
      returnValue = wysihtml.lang.object(obj).clone();
  ok(obj != returnValue);
  deepEqual(obj, returnValue);
});

test("deep clone()", function() {
  var obj = {
      boo : {
        foo: true
      }
    },
    returnValueShallow = wysihtml.lang.object(obj).clone(),
    returnValueDeep = wysihtml.lang.object(obj).clone(true);

  ok(obj != returnValueShallow && obj.boo === returnValueShallow.boo);
  deepEqual(obj, returnValueShallow);

  ok(obj != returnValueDeep && obj.boo !== returnValueDeep.boo);
  deepEqual(obj, returnValueDeep);
});

test("isArray()", function() {
  ok(wysihtml.lang.object([]).isArray());
  ok(!wysihtml.lang.object({}).isArray());
  ok(!wysihtml.lang.object(document.body.childNodes).isArray());
  ok(!wysihtml.lang.object("1,2,3").isArray());
});

test("isFunction()", function() {
  ok(wysihtml.lang.object(function() {}).isFunction());
  ok(!wysihtml.lang.object({}).isFunction());
  ok(!wysihtml.lang.object([]).isFunction());
  ok(!wysihtml.lang.object(document.body.childNodes).isFunction());
  ok(!wysihtml.lang.object("1,2,3").isFunction());
});
