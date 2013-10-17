/**
 * Event Delegation
 *
 * @example
 *    wysihtml5.dom.delegate(document.body, "a", "click", function() {
 *      // foo
 *    });
 *
 * As an option when contenxt is given handler will be called with "this" as context instead of target
 */
(function(wysihtml5) {
  
  wysihtml5.dom.delegate = function(container, selector, eventName, handler, context) {
    return wysihtml5.dom.observe(container, eventName, function(event) {
      var target    = event.target,
          match     = wysihtml5.lang.array(container.querySelectorAll(selector));
      
      while (target && target !== container) {
        if (match.contains(target)) {
          handler.call((context) ? context : target, event);
          break;
        }
        target = target.parentNode;
      }
    });
  };
  
})(wysihtml5);