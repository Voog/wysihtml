(function(wysihtml5) {
  var doc = document;  
  wysihtml5.dom.IframelessSandbox = Base.extend({
      getContentEditable: function() {
        return this.element;
      },
      
      getWindow: function() {
        return this.element.ownerDocument.defaultView;
      },

      getDocument: function() {
        return this.element.ownerDocument;
      },
      
      constructor: function(readyCallback, config) {
        this.callback = readyCallback || wysihtml5.EMPTY_FUNCTION;
        this.config   = wysihtml5.lang.object({}).merge(config).get();
        this.element   = this._createElement();
      },
      
      _createElement: function() {
        var that   = this,
            element = doc.createElement("div");
        element.className = "wysihtml5-sandbox";
        that._loadElement(element);
        return element;
      },
      
      _loadElement: function(element) {
        // don't resume when the iframe got unloaded (eg. by removing it from the dom)
        /*if (!wysihtml5.dom.contains(doc.documentElement, iframe)) {
          return;
        }*/
            
        var that           = this,
            sandboxHtml    = this._getHtml();
            
        element.innerHTML = sandboxHtml;

        // Create the basic dom tree including proper DOCTYPE and charset
        /*iframeDocument.open("text/html", "replace");
        iframeDocument.write(sandboxHtml);
        iframeDocument.close();*/

        this.getWindow = function() { return element.ownerDocument.defaultView; };
        this.getDocument = function() { return element.ownerDocument; };

        // Catch js errors and pass them to the parent's onerror event
        // addEventListener("error") doesn't work properly in some browsers
        // TODO: apparently this doesn't work in IE9!
        /*iframeWindow.onerror = function(errorMessage, fileName, lineNumber) {
          throw new Error("wysihtml5.Sandbox: " + errorMessage, fileName, lineNumber);
        };

        if (!wysihtml5.browser.supportsSandboxedIframes()) {
          // Unset a bunch of sensitive variables
          // Please note: This isn't hack safe!  
          // It more or less just takes care of basic attacks and prevents accidental theft of sensitive information
          // IE is secure though, which is the most important thing, since IE is the only browser, who
          // takes over scripts & styles into contentEditable elements when copied from external websites
          // or applications (Microsoft Word, ...)
          var i, length;
          for (i=0, length=windowProperties.length; i<length; i++) {
            this._unset(iframeWindow, windowProperties[i]);
          }
          for (i=0, length=windowProperties2.length; i<length; i++) {
            this._unset(iframeWindow, windowProperties2[i], wysihtml5.EMPTY_FUNCTION);
          }
          for (i=0, length=documentProperties.length; i<length; i++) {
            this._unset(iframeDocument, documentProperties[i]);
          }
          // This doesn't work in Safari 5 
          // See http://stackoverflow.com/questions/992461/is-it-possible-to-override-document-cookie-in-webkit
          this._unset(iframeDocument, "cookie", "", true);
        }

        this.loaded = true;

        // Trigger the callback*/
        setTimeout(function() { that.callback(that); }, 0);
      },
      
      _getHtml: function(templateVars) {        
        return '';
      }
  
  });
})(wysihtml5);
