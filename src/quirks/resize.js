wysihtml5.quirks.resize = function(element, handleResize, options, context) {
  var defaults = {
    min_width: 0,
    min_height: 0
  };
  
  var settings = wysihtml5.lang.object(defaults).merge(options).get(),
      dom = wysihtml5.dom,
      doc = element.ownerDocument,
      body = doc.body,
      resizeBoxes = [],
      directions = [1,1],
      moveHandlers = [],
      startObserver, startX, startY, startW, startH;
  
      
  
  var start = function(event) {
      positionBoxes();
      addBoxesToDom();
  };
  
  var handleResizeStart = function(event) {
      var el = event.target,
          i = parseInt(el.getAttribute('data-resizer-idx'), 10);
          
       startX = event.clientX;
       startY = event.clientY;
       startW = element.offsetWidth;
       startH = element.offsetHeight;
       
       directions = [
           (i == 0 || i == 3 ) ? -1 : 1,
           (i < 2) ? -1 : 1
       ];
       
       bindMoveEvents();
  };
  
  var bindMoveEvents = function () {
      moveHandlers.push(dom.observe(doc, 'mousemove', handleMouseMove));
      moveHandlers.push(dom.observe(doc, 'mouseup', handleMouseUp));
  };
  
  var unbindMoveEvents = function() {
      for (var i = 0, imax = moveHandlers.length; i < imax; i++) {
          moveHandlers[i].stop();
      };
      moveHandlers = [];
  };
  
  var handleMouseMove = function(event) {
      var dX = (event.clientX - startX) * directions[0],
          dY = (event.clientY - startY) * directions[1],
          width = startW + dX,
          height = startH + dY;
          
      if (width < settings.min_width) {
          width = settings.min_width;
      }
      
      if (height < settings.min_height) {
          height = settings.min_height;
      }
      
      element.style.width = width + 'px';
      element.style.height = height + 'px';
      element.setAttribute("width", width + 'px');
      element.setAttribute("height", height + 'px');
      
      positionBoxes();
      if (handleResize) {
          if (context) {
              handleResize.call(context, width, height);
          } else {
              handleResize(width, height);
          }
      }
  };
  
  var handleMouseUp = function(event) {
      unbindMoveEvents();
  };
   
  var makeResizeBoxes = function () {
      var el, handler;
          
      for (var i = 0; i < 4; i++) {
          el = doc.createElement('div');
          el.style.position = "absolute";
          el.style.zIndex = 100;
          el.setAttribute('data-resizer-idx', i);
          dom.addClass(el, "wysihtml5-quirks-resize-handle");
          handler = dom.observe(el, 'mousedown', handleResizeStart);
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
      unbindMoveEvents();
      removeBoxesFromDom();
  };
  
  makeResizeBoxes();
  start();
      
  return {
      "stop": unbindResize,
      "refresh": positionBoxes
  };
};