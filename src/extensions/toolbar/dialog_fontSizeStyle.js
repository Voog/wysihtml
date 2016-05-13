(function(wysihtml) {
  var dom                     = wysihtml.dom,
      SELECTOR_FIELDS         = "[data-wysihtml-dialog-field]",
      ATTRIBUTE_FIELDS        = "data-wysihtml-dialog-field";

  wysihtml.toolbar.Dialog_fontSizeStyle = wysihtml.toolbar.Dialog.extend({
    multiselect: true,

    _serialize: function() {
      return {"size" : this.container.querySelector('[data-wysihtml-dialog-field="size"]').value};
    },

    _interpolate: function(avoidHiddenFields) {
      var focusedElement = document.querySelector(":focus"),
          field          = this.container.querySelector("[data-wysihtml-dialog-field='size']"),
          firstElement   = (this.elementToChange) ? ((wysihtml.lang.object(this.elementToChange).isArray()) ? this.elementToChange[0] : this.elementToChange) : null,
          styleStr       = (firstElement) ? firstElement.getAttribute('style') : null,
          size           = (styleStr) ? wysihtml.quirks.styleParser.parseFontSize(styleStr) : null;

      if (field && field !== focusedElement && size && !(/^\s*$/).test(size)) {
        field.value = size;
      }
    }
  });
})(wysihtml);
