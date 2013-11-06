(function(wysihtml5) {
  var dom                     = wysihtml5.dom,
      SELECTOR_FIELDS         = "[data-wysihtml5-dialog-field]",
      ATTRIBUTE_FIELDS        = "data-wysihtml5-dialog-field";
  
  wysihtml5.toolbar.Dialog_bgColorStyle = wysihtml5.toolbar.Dialog.extend({
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
      var field,
          fieldName,
          newValue,
          focusedElement = document.querySelector(":focus"),
          fields         = this.container.querySelectorAll(SELECTOR_FIELDS),
          length         = fields.length,
          i              = 0,
          firstElement   = (this.elementToChange) ? ((wysihtml5.lang.object(this.elementToChange).isArray()) ? this.elementToChange[0] : this.elementToChange) : null,
          colorStr       = (firstElement) ? firstElement.style.backgroundColor : null,
          color, colorMatch,
          RGBA_REGEX     = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\)/i,
          HEX6_REGEX     = /^#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])/i,
          HEX3_REGEX     = /^#([0-9a-f])([0-9a-f])([0-9a-f])/i;
      
      if (colorStr) {
        if (RGBA_REGEX.test(colorStr)) {
          colorMatch = colorStr.match(RGBA_REGEX);
          color = colorMatch.slice(1);
        } else if (HEX6_REGEX.test(colorStr)) {
          colorMatch = colorStr.match(HEX6_REGEX);
          color = [];
          color[0] = parseInt(colorMatch[1], 16);
          color[1] = parseInt(colorMatch[2], 16);
          color[2] = parseInt(colorMatch[3], 16);
        } else if (HEX3_REGEX.test(colorStr)) {
          colorMatch = colorStr.match(HEX3_REGEX);
          color = [];
          color[0] = (parseInt(colorMatch[1], 16) * 16) + parseInt(colorMatch[1], 16);
          color[1] = (parseInt(colorMatch[2], 16) * 16) + parseInt(colorMatch[2], 16);
          color[2] = (parseInt(colorMatch[3], 16) * 16) + parseInt(colorMatch[3], 16);
        }
      }
      
      if (color) {
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
        
          fieldName = field.getAttribute(ATTRIBUTE_FIELDS);
          switch (fieldName) {
            case 'red': field.value = color[0]; break;
            case 'green': field.value = color[1]; break;
            case 'blue': field.value = color[2]; break;
          }
        }
      }
      
    }

  });
})(wysihtml5);