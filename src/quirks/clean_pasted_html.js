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

  return function(html, options) {
    var exceptStyles = {
          'color': wysihtml5.dom.getStyle("color").from(options.referenceNode),
          'fontSize': wysihtml5.dom.getStyle("font-size").from(options.referenceNode)
        },
        rules = extendRulesWithStyleExceptions(options.rules || {}, exceptStyles),
        newHtml;

    newHtml = wysihtml5.dom.parse(html, {
      "rules": rules,
      "cleanUp": true, // <span> elements, empty or without attributes, should be removed/replaced with their content
      "context": options.referenceNode.ownerDocument,
      "uneditableClass": options.uneditableContainerClassname,
      "clearInternals" : true // don't paste temprorary selection and other markings
    });

    return newHtml;
  };

  /*
  // TODO: We probably need more rules here
  var defaultRules = {
    // When pasting underlined links <a> into a contentEditable, IE thinks, it has to insert <u> to keep the styling
    "a u": wysihtml5.dom.replaceWithChildNodes
  };

  function cleanPastedHTML(elementOrHtml, rules, context) {
    rules   = rules || defaultRules;
    context = context || elementOrHtml.ownerDocument || document;

    var element,
        isString = typeof(elementOrHtml) === "string",
        method,
        matches,
        matchesLength,
        i,
        j = 0, n;
    if (isString) {
      element = wysihtml5.dom.getAsDom(elementOrHtml, context);
    } else {
      element = elementOrHtml;
    }

    for (i in rules) {
      matches       = element.querySelectorAll(i);
      method        = rules[i];
      matchesLength = matches.length;
      for (; j<matchesLength; j++) {
        method(matches[j]);
      }
    }

    // replace joined non-breakable spaces with unjoined
    var txtnodes = wysihtml5.dom.getTextNodes(element);
    for (n = txtnodes.length; n--;) {
      txtnodes[n].nodeValue = txtnodes[n].nodeValue.replace(/([\S\u00A0])\u00A0/gi, "$1 ");
    }

    matches = elementOrHtml = rules = null;

    return isString ? element.innerHTML : element;
  }

  return cleanPastedHTML;
  */
})();
