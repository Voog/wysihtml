(function(wysihtml5) {
  var SELECTOR_FIELDS         = "[data-wysihtml5-dialog-field]",
      ATTRIBUTE_FIELDS        = "data-wysihtml5-dialog-field";

  wysihtml5.toolbar.Dialog_foreColorStyle = wysihtml5.toolbar.Dialog.extend({
    multiselect: true,

    _serialize: function() {
      var data    = {},
          fields  = this.container.querySelectorAll(SELECTOR_FIELDS),
          length  = fields.length,
          i       = 0;

      for (; i<length; i++) {
        data[fields[i].getAttribute(ATTRIBUTE_FIELDS)] = fields[i].value;
      }
      return data;
    },

    _interpolate: function(avoidHiddenFields) {
      var field, colourMode,
          styleParser = wysihtml5.quirks.styleParser,
          focusedElement = document.querySelector(":focus"),
          fields         = this.container.querySelectorAll(SELECTOR_FIELDS),
          length         = fields.length,
          i              = 0,
          firstElement   = (this.elementToChange) ? ((wysihtml5.lang.object(this.elementToChange).isArray()) ? this.elementToChange[0] : this.elementToChange) : null,
          colourStr       = (firstElement) ? firstElement.getAttribute("style") : null,
          colour          = (colourStr) ? styleParser.parseColor(colourStr, "color") : null;

      for (; i<length; i++) {
        field = fields[i];
        // Never change elements where the user is currently typing in
        if (field === focusedElement) {
          continue;
        }
        // Don't update hidden fields3
        if (avoidHiddenFields && field.type === "hidden") {
          continue;
        }
        if (field.getAttribute(ATTRIBUTE_FIELDS) === "color") {
          colourMode = (field.dataset.colormode || "rgb").toLowerCase();
          colourMode = colourMode === "hex" ? "hash" : colourMode;

          if (colour) {
            field.value = styleParser.unparseColor(colour, colourMode);
          } else {
            field.value = styleParser.unparseColor([0, 0, 0], colourMode);
          }
        }
      }
    }

  });
})(wysihtml5);
