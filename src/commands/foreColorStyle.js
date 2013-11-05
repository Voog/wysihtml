/**
 * document.execCommand("foreColor") will create either inline styles (firefox, chrome) or use font tags
 * which we don't want
 * Instead we set a css class
 */
(function(wysihtml5) {
  var REG_EXP = /(^|\s|;)color\s*\:\s*((#[0-9a-f]{3}([0-9a-f]{3})?)|(rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(\s*,\s*\d{1,3}\s*)?\)))\s*;?/i;
  
  wysihtml5.commands.foreColorStyle = {
    exec: function(composer, command, color) {
      wysihtml5.commands.formatInline.execWithToggle(composer, command, "span", false, false, "color:" + color, REG_EXP);
    },

    state: function(composer, command, color) {
      return wysihtml5.commands.formatInline.state(composer, command, "span", false, false, "color:" + color, REG_EXP);
    }
  };
})(wysihtml5);