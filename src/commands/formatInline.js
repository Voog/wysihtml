/**
 * formatInline scenarios for tag "B" (| = caret, |foo| = selected text)
 *
 *   #1 caret in unformatted text:
 *      abcdefg|
 *   output:
 *      abcdefg<b>|</b>
 *
 *   #2 unformatted text selected:
 *      abc|deg|h
 *   output:
 *      abc<b>|deg|</b>h
 *
 *   #3 unformatted text selected across boundaries:
 *      ab|c <span>defg|h</span>
 *   output:
 *      ab<b>|c </b><span><b>defg</b>|h</span>
 *
 *   #4 formatted text entirely selected
 *      <b>|abc|</b>
 *   output:
 *      |abc|
 *
 *   #5 formatted text partially selected
 *      <b>ab|c|</b>
 *   output:
 *      <b>ab</b>|c|
 *
 *   #6 formatted text selected across boundaries
 *      <span>ab|c</span> <b>de|fgh</b>
 *   output:
 *      <span>ab|c</span> de|<b>fgh</b>
 */

(function(wysihtml5) {

  var defaultTag = "SPAN",
      INLINE_ELEMENTS = "b, big, i, small, tt, abbr, acronym, cite, code, dfn, em, kbd, strong, samp, var, a, bdo, br, q, span, sub, sup, button, label, textarea",
      queryAliasMap = {
        "b": "b, strong",
        "strong": "b, strong",
        "em": "em, i",
        "i": "em, i"
      };

  function isVisibleTextNode(node) {
    if (node.data && (/[^\s]/g).test(node.data)) {
      return true;
    }
    return false;
  }

  function getWrapNode(textNode, options) {
    return textNode.ownerDocument.createElement(options.toUpperCase());
  }

  function formatTextNode(textNode, options) {
    var wrapNode = getWrapNode(textNode, options);

    textNode.parentNode.insertBefore(wrapNode, textNode);
    wrapNode.appendChild(textNode);
  }

  function formatTextRange(range, composer, options) {
    var wrapNode = getWrapNode(range.endContainer, options);

    range.surroundContents(wrapNode);
    composer.selection.selectNode(wrapNode);
  }

  wysihtml5.commands.formatInline = {
    exec: function(composer, command, options) {
      var caretNode = composer.selection.isCollapsed() && composer.selection.getSelectedNode(),
          textNodes = composer.selection.getOwnNodes([3], function(node) {
            // Exclude empty nodes except caret node
            return (!wysihtml5.dom.domNode(node).is.emptyTextNode() || caretNode === node);
          });

      if (!textNodes.length) {
        formatTextRange(composer.selection.getOwnRanges()[0], composer, options);
        return;
      }

      for (var i = textNodes.length; i--;) {
        formatTextNode(textNodes[i], options);
      }

    },

    execWithToggle: function(composer, command, options) {
      this.exec(composer, command, options);
    },

    state: function(composer, command, properties) {
      // If properties is passed as a string, look for tag with that tagName/query
      if (typeof properties === "string") {
        properties = {
          query: queryAliasMap[properties.toLowerCase()] ? queryAliasMap[properties.toLowerCase()] : properties
        };
      } else if (properties.nodeName) {
        if (queryAliasMap[properties.nodeName.toLowerCase()]) {
          properties.query = queryAliasMap[properties.nodeName.toLowerCase()];
          delete properties.nodeName;
        }
      }

      var nodes = composer.selection.filterElements((function (element) { // Finds matching elements inside selection
            return wysihtml5.dom.domNode(element).test(properties || { query: INLINE_ELEMENTS });
          }).bind(this)),
          parentNodes = composer.selection.getSelectedOwnNodes(),
          parent;

      // Finds matching elements that are parents of selection and adds to nodes list
      for (var i = 0, maxi = parentNodes.length; i < maxi; i++) {
        parent = wysihtml5.dom.getParentElement(parentNodes[i], properties || { query: INLINE_ELEMENTS }, null, composer.element);
        if (parent && nodes.indexOf(parent) === -1) {
          nodes.push(parent);
        }
      }

      return (nodes.length === 0) ? false : nodes;
    }
  };

})(wysihtml5);


/*
(function(wysihtml5) {
  var // Treat <b> as <strong> and vice versa
      ALIAS_MAPPING = {
        "strong": "b",
        "em":     "i",
        "b":      "strong",
        "i":      "em"
      },
      htmlApplier = {};

  function _getTagNames(tagName) {
    var alias = ALIAS_MAPPING[tagName];
    return alias ? [tagName.toLowerCase(), alias.toLowerCase()] : [tagName.toLowerCase()];
  }

  function _getApplier(tagName, className, classRegExp, cssStyle, styleRegExp, container) {
    var identifier = tagName;
    
    if (className) {
      identifier += ":" + className;
    }
    if (cssStyle) {
      identifier += ":" + cssStyle;
    }

    if (!htmlApplier[identifier]) {
      htmlApplier[identifier] = new wysihtml5.selection.HTMLApplier(_getTagNames(tagName), className, classRegExp, true, cssStyle, styleRegExp, container);
    }

    return htmlApplier[identifier];
  }

  wysihtml5.commands.formatInline = {
    exec: function(composer, command, tagName, className, classRegExp, cssStyle, styleRegExp, dontRestoreSelect, noCleanup) {
      var range = composer.selection.createRange(),
          ownRanges = composer.selection.getOwnRanges();

      if (!ownRanges || ownRanges.length == 0) {
        return false;
      }
      composer.selection.getSelection().removeAllRanges();

      _getApplier(tagName, className, classRegExp, cssStyle, styleRegExp, composer.element).toggleRange(ownRanges);

      if (!dontRestoreSelect) {
        range.setStart(ownRanges[0].startContainer,  ownRanges[0].startOffset);
        range.setEnd(
          ownRanges[ownRanges.length - 1].endContainer,
          ownRanges[ownRanges.length - 1].endOffset
        );
        composer.selection.setSelection(range);
        composer.selection.executeAndRestore(function() {
          if (!noCleanup) {
            composer.cleanUp();
          }
        }, true, true);
      } else if (!noCleanup) {
        composer.cleanUp();
      }
    },

    // Executes so that if collapsed caret is in a state and executing that state it should unformat that state
    // It is achieved by selecting the entire state element before executing.
    // This works on built in contenteditable inline format commands
    execWithToggle: function(composer, command, tagName, className, classRegExp, cssStyle, styleRegExp) {
      var that = this;

      if (this.state(composer, command, tagName, className, classRegExp, cssStyle, styleRegExp) &&
        composer.selection.isCollapsed() &&
        !composer.selection.caretIsLastInSelection() &&
        !composer.selection.caretIsFirstInSelection()
      ) {
        var state_element = that.state(composer, command, tagName, className, classRegExp)[0];
        composer.selection.executeAndRestoreRangy(function() {
          var parent = state_element.parentNode;
          composer.selection.selectNode(state_element, true);
          wysihtml5.commands.formatInline.exec(composer, command, tagName, className, classRegExp, cssStyle, styleRegExp, true, true);
        });
      } else {
        if (this.state(composer, command, tagName, className, classRegExp, cssStyle, styleRegExp) && !composer.selection.isCollapsed()) {
          composer.selection.executeAndRestoreRangy(function() {
            wysihtml5.commands.formatInline.exec(composer, command, tagName, className, classRegExp, cssStyle, styleRegExp, true, true);
          });
        } else {
          wysihtml5.commands.formatInline.exec(composer, command, tagName, className, classRegExp, cssStyle, styleRegExp);
        }
      }
    },

    state: function(composer, command, tagName, className, classRegExp, cssStyle, styleRegExp) {
      var doc           = composer.doc,
          aliasTagName  = ALIAS_MAPPING[tagName] || tagName,
          ownRanges, isApplied;

      // Check whether the document contains a node with the desired tagName
      if (!wysihtml5.dom.hasElementWithTagName(doc, tagName) &&
          !wysihtml5.dom.hasElementWithTagName(doc, aliasTagName)) {
        return false;
      }

       // Check whether the document contains a node with the desired className
      if (className && !wysihtml5.dom.hasElementWithClassName(doc, className)) {
         return false;
      }

      ownRanges = composer.selection.getOwnRanges();

      if (!ownRanges || ownRanges.length === 0) {
        return false;
      }

      isApplied = _getApplier(tagName, className, classRegExp, cssStyle, styleRegExp, composer.element).isAppliedToRange(ownRanges);

      return (isApplied && isApplied.elements) ? isApplied.elements : false;
    }
  };
})(wysihtml5);
*/
