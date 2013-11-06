/**
 * document.execCommand("foreColor") will create either inline styles (firefox, chrome) or use font tags
 * which we don't want
 * Instead we set a css class
 */
(function(wysihtml5) {
  var REG_EXP = /(^|\s|;)background-color\s*\:\s*((#[0-9a-f]{3}([0-9a-f]{3})?)|(rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(\s*,\s*\d{1,3}\s*)?\)))\s*;?/i;
  
  wysihtml5.commands.bgColorStyle = {
    exec: function(composer, command, color) {
      var colString = "rgb(" + parseInt(color.red) + ',' + parseInt(color.green) + ',' + parseInt(color.blue) + ')';
       
      wysihtml5.commands.formatInline.execWithToggle(composer, command, "span", false, false, "background-color:" + colString, REG_EXP);
    },

    state: function(composer, command) {
      return wysihtml5.commands.formatInline.state(composer, command, "span", false, false, "background-color", REG_EXP);
    },
    
    stateValue: function(composer, command) {
      var st = this.state(composer, command),
          colorStr, colorMatch,
          RGBA_REGEX     = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\)/i,
          HEX6_REGEX     = /^#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])/i,
          HEX3_REGEX     = /^#([0-9a-f])([0-9a-f])([0-9a-f])/i;
      
      if (st && wysihtml5.lang.object(st).isArray()) {
        st = st[0];
      }
      
      if (st) {
        colorStr = st.style.backgroundColor;
        if (colorStr) {
          if (colorStr) {
            if (RGBA_REGEX.test(colorStr)) {
              colorMatch = colorStr.match(RGBA_REGEX);
              return colorMatch.slice(1);
              
            } else if (HEX6_REGEX.test(colorStr)) {
              colorMatch = colorStr.match(HEX6_REGEX);
              return [parseInt(colorMatch[1], 16),
                      parseInt(colorMatch[2], 16),
                      parseInt(colorMatch[3], 16)];
                      
            } else if (HEX3_REGEX.test(colorStr)) {
              colorMatch = colorStr.match(HEX3_REGEX);
              return [(parseInt(colorMatch[1], 16) * 16) + parseInt(colorMatch[1], 16),
                      (parseInt(colorMatch[2], 16) * 16) + parseInt(colorMatch[2], 16),
                      (parseInt(colorMatch[3], 16) * 16) + parseInt(colorMatch[3], 16)];
            }
          }
        }
      }
      return false;
    }
    
  };
})(wysihtml5);