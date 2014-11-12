/**
 * Event Delegation
 *
 * @example
 *    wysihtml5.dom.delegate(document.body, "a", "click", function() {
 *      // foo
 *    });
 */
(function(wysihtml5) {
  wysihtml5.dom.delegate = function(container, selector, eventName, handler) {
    var callback = function(event) {
      var target = event.target,
          element = (target.nodeType === 3) ? target.parentNode : target, // IE has .contains only seeing elements not textnodes
          matches  = container.querySelectorAll(selector);

      for (var i = 0, max = matches.length; i < max; i++) {
        if (matches[i].contains(element)) {
          handler.call(matches[i], event);
        }
      }
    };

    container.addEventListener(eventName, callback, false);
    return {
      stop: function() {
        container.removeEventListener(eventName, callback, false);
      }
    };
  };
})(wysihtml5);
