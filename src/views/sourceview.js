(function(wysihtml5) {

  wysihtml5.views.SourceView = Base.extend(
    /** @scope wysihtml5.views.SourceView.prototype */ {

    constructor: function(editor, composer) {
      this.editor   = editor;
      this.composer = composer;

      this._observe();
    },

    switchToTextarea: function(shouldParseHtml) {
      var composerStyles = this.composer.win.getComputedStyle(this.composer.element),
          width = parseFloat(composerStyles.width),
          height = Math.max(parseFloat(composerStyles.height), 100);

      if (!this.textarea) {
        this.textarea = this.composer.doc.createElement('textarea');
        this.textarea.className = "wysihtml5-source-view";
        this._observeTextArea();
      }
      this.textarea.style.width = width + 'px';
      this.textarea.style.height = height + 'px';
      this.textarea.value = this.editor.getValue(shouldParseHtml, true);
      this.composer.element.parentNode.insertBefore(this.textarea, this.composer.element);
      this.editor.currentView = "source";
      this.composer.element.style.display = 'none';
    },

    switchToComposer: function(shouldParseHtml) {
      var textareaValue = this.textarea.value;
      if (textareaValue) {
        this.composer.setValue(textareaValue, shouldParseHtml);
      } else {
        this.composer.clear();
        this.editor.fire("set_placeholder");
      }
      this.textarea.parentNode.removeChild(this.textarea);
      this.editor.currentView = this.composer;
      this.composer.element.style.display = '';
    },

    _observe: function() {
      this.editor.on("change_view", function(view) {
        if (view === "composer") {
          this.switchToComposer(true);
        } else if (view === "textarea") {
          this.switchToTextarea(true);
        }
      }.bind(this));
    },

    // Adds event listeners to the textarea
    _observeTextArea: function() {
      self = this

      // Insert listener for key up
      this.textarea.addEventListener("keyup", function(event) {
        self.editor.fire(event.type, event).fire(event.type + ":texarea", event);
      }, false);

      // Insert listener for focus
      this.textarea.addEventListener("focus", function(event) {
        self.editor.fire(event.type, event).fire(event.type + ":texarea", event);

        // Save current focus state
        setTimeout((function() {
          self.focusState = event.target.value;
        }).bind(this), 0);
      }, false);

      // Insert listener for change
      this.textarea.addEventListener("blur", function(event) {
        self.editor.fire(event.type, event).fire(event.type + ":texarea", event);
        
        // Check if the state has changed
        if (self.focusState != event.target.value) {
          self.editor.fire("change", event).fire("change:texarea", event);
        }

      }, false);
    }

  });

})(wysihtml5);
