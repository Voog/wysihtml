wysihtml.lang.object = function(obj) {
  return {
    /**
     * @example
     *    wysihtml.lang.object({ foo: 1, bar: 1 }).merge({ bar: 2, baz: 3 }).get();
     *    // => { foo: 1, bar: 2, baz: 3 }
     */
    merge: function(otherObj, deep) {
      for (var i in otherObj) {
        if (deep && wysihtml.lang.object(otherObj[i]).isPlainObject() && (typeof obj[i] === "undefined" || wysihtml.lang.object(obj[i]).isPlainObject())) {
          if (typeof obj[i] === "undefined") {
            obj[i] = wysihtml.lang.object(otherObj[i]).clone(true);
          } else {
            wysihtml.lang.object(obj[i]).merge(wysihtml.lang.object(otherObj[i]).clone(true));
          }
        } else {
          obj[i] = wysihtml.lang.object(otherObj[i]).isPlainObject() ? wysihtml.lang.object(otherObj[i]).clone(true) : otherObj[i];
        }
      }
      return this;
    },

    difference: function (otherObj) {
      var diffObj = {};

      // Get old values not in comparing object
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (!otherObj.hasOwnProperty(i)) {
            diffObj[i] = obj[i];
          }
        }
      }

      // Get new and different values in comparing object
      for (var o in otherObj) {
        if (otherObj.hasOwnProperty(o)) {
          if (!obj.hasOwnProperty(o) || obj[o] !== otherObj[o]) {
            diffObj[0] = obj[0];
          }
        }
      }
      return diffObj;
    },

    get: function() {
      return obj;
    },

    /**
     * @example
     *    wysihtml.lang.object({ foo: 1 }).clone();
     *    // => { foo: 1 }
     *
     *    v0.4.14 adds options for deep clone : wysihtml.lang.object({ foo: 1 }).clone(true);
     */
    clone: function(deep) {
      var newObj = {},
          i;

      if (obj === null || !wysihtml.lang.object(obj).isPlainObject()) {
        return obj;
      }

      for (i in obj) {
        if(obj.hasOwnProperty(i)) {
          if (deep) {
            newObj[i] = wysihtml.lang.object(obj[i]).clone(deep);
          } else {
            newObj[i] = obj[i];
          }
        }
      }
      return newObj;
    },

    /**
     * @example
     *    wysihtml.lang.object([]).isArray();
     *    // => true
     */
    isArray: function() {
      return Object.prototype.toString.call(obj) === "[object Array]";
    },

    /**
     * @example
     *    wysihtml.lang.object(function() {}).isFunction();
     *    // => true
     */
    isFunction: function() {
      return Object.prototype.toString.call(obj) === '[object Function]';
    },

    isPlainObject: function () {
      return obj && Object.prototype.toString.call(obj) === '[object Object]' && !(("Node" in window) ? obj instanceof Node : obj instanceof Element || obj instanceof Text);
    },

    /**
     * @example
     *    wysihtml.lang.object({}).isEmpty();
     *    // => true
     */
    isEmpty: function() {
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          return false;
        }
      }
      return true;
    }
  };
};
