/**
 * Fix most common html formatting misbehaviors of browsers implementation when inserting
 * content via copy & paste contentEditable
 *
 * @author Christopher Blum
 */
wysihtml5.quirks.cleanPastedHTML = (function() {

  var styleToRegex = function (styleStr) {
    var trimmedStr = wysihtml5.lang.string(styleStr).trim(),
        escapedStr = trimmedStr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

    return new RegExp("^((?!^" + escapedStr + "$).)*$", "i");
  };

  var extendRulesWithStyleExceptions = function (rules, exceptStyles) {
    var newRules = wysihtml5.lang.object(rules).clone(true),
        tag, style;

    for (tag in newRules.tags) {

      if (newRules.tags.hasOwnProperty(tag)) {
        if (newRules.tags[tag].keep_styles) {
          for (style in newRules.tags[tag].keep_styles) {
            if (newRules.tags[tag].keep_styles.hasOwnProperty(style)) {
              if (exceptStyles[style]) {
                newRules.tags[tag].keep_styles[style] = styleToRegex(exceptStyles[style]);
              }
            }
          }
        }
      }
    }

    return newRules;
  };

  var pickRuleset = function(ruleset, html) {
    var pickedSet, defaultSet;

    if (!ruleset) {
      return null;
    }

    for (var i = 0, max = ruleset.length; i < max; i++) {
      if (!ruleset[i].condition) {
        defaultSet = ruleset[i].set;
      }
      if (ruleset[i].condition && ruleset[i].condition.test(html)) {
        return ruleset[i].set;
      }
    }

    return defaultSet;
  };

  return function(html, options) {
    var exceptStyles = {
          'color': wysihtml5.dom.getStyle("color").from(options.referenceNode),
          'fontSize': wysihtml5.dom.getStyle("font-size").from(options.referenceNode)
        },
        rules = extendRulesWithStyleExceptions(pickRuleset(options.rules, html) || {}, exceptStyles),
        newHtml;

    newHtml = wysihtml5.dom.parse(html, {
      "rules": rules,
      "cleanUp": true, // <span> elements, empty or without attributes, should be removed/replaced with their content
      "context": options.referenceNode.ownerDocument,
      "uneditableClass": options.uneditableClass,
      "clearInternals" : true, // don't paste temprorary selection and other markings
      "unjoinNbsps" : true
    });

    return newHtml;
  };

})();
