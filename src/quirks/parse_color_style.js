(function(wysihtml5) {
  var RGBA_REGEX     = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d\.]+)\s*\)/i,
      RGB_REGEX     = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i,
      HEX6_REGEX     = /^#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])/i,
      HEX3_REGEX     = /^#([0-9a-f])([0-9a-f])([0-9a-f])/i;

  wysihtml5.quirks.parseColorStyleStr = function(stylesStr, paramName) {
    var str;
    var paramRegex = new RegExp("(^|\\s|;)" + paramName + "\\s*:\\s*[^;$]+" , "gi");
        params = stylesStr.match(paramRegex);
    if (params) {    
      for (var i = params.length; i--;) {
        params[i] = wysihtml5.lang.string(params[i].split(':')[1]).trim();
      } 
      str = params[params.length-1];
    
      if (RGBA_REGEX.test(str)) {
        colorMatch = str.match(RGBA_REGEX);
        return [parseInt(colorMatch[1], 10),
                parseInt(colorMatch[2], 10),
                parseInt(colorMatch[3], 10),
                parseInt(colorMatch[4], 10)];
      } else if (RGB_REGEX.test(str)) {
        colorMatch = str.match(RGB_REGEX);
        return [parseInt(colorMatch[1], 10),
                parseInt(colorMatch[2], 10),
                parseInt(colorMatch[3], 10),
                1];
      } else if (HEX6_REGEX.test(str)) {
        colorMatch = str.match(HEX6_REGEX);
        return [parseInt(colorMatch[1], 16),
                parseInt(colorMatch[2], 16),
                parseInt(colorMatch[3], 16),
                1];
              
      } else if (HEX3_REGEX.test(str)) {
        colorMatch = str.match(HEX3_REGEX);
        return [(parseInt(colorMatch[1], 16) * 16) + parseInt(colorMatch[1], 16),
                (parseInt(colorMatch[2], 16) * 16) + parseInt(colorMatch[2], 16),
                (parseInt(colorMatch[3], 16) * 16) + parseInt(colorMatch[3], 16),
                1];
      }
    }
    return false;
  };
  
  wysihtml5.quirks.unParseColorStyleStr = function(val, props) {
    if (props) {
      if (props == "hex") {
        return (val[0].toString(16).toUpperCase()) + (val[1].toString(16).toUpperCase()) + (val[2].toString(16).toUpperCase());
      } else if (props == "hash") {
        return "#" + (val[0].toString(16).toUpperCase()) + (val[1].toString(16).toUpperCase()) + (val[2].toString(16).toUpperCase());
      } else if (props == "rgb") {
        return "rgb(" + val[0] + "," + val[1] + "," + val[2] + ")";
      } else if (props == "rgba") {
        return "rgba(" + val[0] + "," + val[1] + "," + val[2] + "," + val[3] + ")";
      } else if (props == "csv") {
        return  val[0] + "," + val[1] + "," + val[2] + "," + val[3];
      }
    }
    
    if (val[3] && val[3] !== 1) {
      return "rgba(" + val[0] + "," + val[1] + "," + val[2] + "," + val[3] + ")";
    } else {
      return "rgb(" + val[0] + "," + val[1] + "," + val[2] + ")";
    } 
  };
  
})(wysihtml5);