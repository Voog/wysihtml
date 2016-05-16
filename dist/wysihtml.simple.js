;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('wysihtml.simple', ['wysihtml'], factory);
    } else if(typeof exports == 'object') {
        module.exports = factory(require('wysihtml'));
    } else {
        factory(window.wysihtml);
    }
}(function(wysihtml) {

/**
 * Very simple basic rule set
 *
 * Allows
 *    <i>, <em>, <b>, <strong>, <p>, <div>, <a href="http://foo"></a>, <br>, <span>, <ol>, <ul>, <li>
 *
 * For a proper documentation of the format check advanced.js
 */
var wysihtmlParserRules = {
  tags: {
    strong: {},
    b:      {},
    i:      {},
    em:     {},
    br:     {},
    p:      {},
    div:    {},
    span:   {},
    ul:     {},
    ol:     {},
    li:     {},
    a:      {
      set_attributes: {
        target: "_blank",
        rel:    "nofollow"
      },
      check_attributes: {
        href:   "url" // important to avoid XSS
      }
    }
  }
};

    return wysihtmlParserRules;
}));
