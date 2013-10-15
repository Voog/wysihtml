wysihtml5.quirks.resize = function(element) {
  
  var dom = wysihtml5.dom,
      doc = element.ownerDocument,
      body = doc.body,
      startH = null,
      startW = null,
      startObserver = null,
      resizeBoxes = []; 
  
  var start = function(event) {
      positionBoxes();
      addBoxesToDom();
      
  };
  
  var makeResizeBoxes = function () {
      var el, handler;
          
      for (var i = 0; i < 4; i++) {
          el = doc.createElement('div');
          el.style.position = "absolute";
          el.style.zIndex = 100;
          dom.addClass(el, "wysihtml5-quirks-resize-handle");
          handler = dom.observe(el, 'mousedown', start);
          resizeBoxes.push({
              "el": el,
              "handler": handler
          });
      }
  };
  
  var addBoxesToDom = function() {
      for (var i = 0, maxi = resizeBoxes.length; i < maxi; i++) {
          body.appendChild(resizeBoxes[i].el);
      }
  };
  
  var removeBoxesFromDom = function() {
      for (var i = 0, maxi = resizeBoxes.length; i < maxi; i++) {
          resizeBoxes[i].el = resizeBoxes[i].el.parentNode.removeChild(resizeBoxes[i].el);
          doc.appendChild(resizeBoxes[i].el);
      }
  };
  
  var positionBoxes = function() {
      var offset = dom.offset(element),
          width = element.offsetWidth,
          height = element.offsetHeight;
          
      resizeBoxes[0].el.style.top = offset.top + 'px';
      resizeBoxes[0].el.style.left = offset.left + 'px';
      
      resizeBoxes[1].el.style.top = offset.top + 'px';
      resizeBoxes[1].el.style.left = offset.left + width + 'px';
      
      resizeBoxes[2].el.style.top = offset.top + height + 'px';
      resizeBoxes[2].el.style.left = offset.left + width + 'px';
      
      resizeBoxes[3].el.style.top = offset.top + height + 'px';
      resizeBoxes[3].el.style.left = offset.left + 'px';
  };
  
  var unbindResize = function() {
      
  };
  
  var getSize = function() {
      
  };
  
  makeResizeBoxes();
  start();
      
  return {
      "stop": unbindResize,
      "getSize": getSize
  };
};