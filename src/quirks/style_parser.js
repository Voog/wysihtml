(function(wysihtml5) {
  
  // List of supported color format parsing methods
  // If radix is not defined 10 is expected as default
  var colorParseMethods = {
        rgba : {
          regex: /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d\.]+)\s*\)/i,
          name: "rgba"
        },
        rgb : {
          regex: /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i,
          name: "rgb"
        },
        hex6 : {
          regex: /^#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])/i,
          name: "hex",
          radix: 16
        },
        hex3 : {
          regex: /^#([0-9a-f])([0-9a-f])([0-9a-f])/i,
          name: "hex",
          radix: 16
        }
      },
      // Takes a style key name as an argument and makes a regex that can be used to the match key:value pair from style string
      makeParamRegExp = function (p) {
        return new RegExp("(^|\\s|;)" + p + "\\s*:\\s*[^;$]+", "gi");
      };

  // Takes color string value ("#abc", "rgb(1,2,3)", ...) as an argument and returns suitable parsing method for it
  function getColorParseMethod (colorStr) {
    var prop, colorTypeConf;

    for (prop in colorParseMethods) {
      if (!colorParseMethods.hasOwnProperty(prop)) { continue; }

      colorTypeConf = colorParseMethods[prop];

      if (colorTypeConf.regex.test(colorStr)) {
        return colorTypeConf;
      }
    }
  }

  // Takes color string value ("#abc", "rgb(1,2,3)", ...) as an argument and returns the type of that color format "hex", "rgb", "rgba". 
  function getColorFormat (colorStr) {
    var type = getColorParseMethod(colorStr);

    return type ? type.name : undefined;
  }

  // Public API functions for styleParser
  wysihtml5.quirks.styleParser = {

    // Takes color string value as an argument and returns suitable parsing method for it
    getColorParseMethod : getColorParseMethod,

    // Takes color string value as an argument and returns the type of that color format "hex", "rgb", "rgba". 
    getColorFormat : getColorFormat,
    
    /* Parses a color string to and array of [red, green, blue, alpha].
     * paramName: optional argument to parse color value directly from style string parameter
     *
     * Examples:
     *    var colorArray = wysihtml5.quirks.styleParser.parseColor("#ABC");            // [170, 187, 204, 1]
     *    var colorArray = wysihtml5.quirks.styleParser.parseColor("#AABBCC");         // [170, 187, 204, 1]
     *    var colorArray = wysihtml5.quirks.styleParser.parseColor("rgb(1,2,3)");      // [1, 2, 3, 1]
     *    var colorArray = wysihtml5.quirks.styleParser.parseColor("rgba(1,2,3,0.5)"); // [1, 2, 3, 0.5]
     *
     *    var colorArray = wysihtml5.quirks.styleParser.parseColor("background-color: #ABC; color: #000;", "background-color"); // [170, 187, 204, 1]
     *    var colorArray = wysihtml5.quirks.styleParser.parseColor("background-color: #ABC; color: #000;", "color");            // [0, 0, 0, 1]
     */
    parseColor : function (stylesStr, paramName) {
      var paramsRegex, params, colorType, colorMatch, radix,
          colorStr = stylesStr;

      if (paramName) {
        paramsRegex = makeParamRegExp(paramName);

        if (!(params = stylesStr.match(paramsRegex))) { return false; }

        params = params.pop().split(":")[1];
        colorStr = wysihtml5.lang.string(params).trim();
      }

      if (!(colorType = getColorParseMethod(colorStr))) { return false; }
      if (!(colorMatch = colorStr.match(colorType.regex))) { return false; }

      radix = colorType.radix || 10;

      if (colorType === colorParseMethods.hex3) {
        colorMatch.shift();
        colorMatch.push(1);
        return wysihtml5.lang.array(colorMatch).map(function(d, idx) {
          return (idx < 3) ? (parseInt(d, radix) * radix) + parseInt(d, radix): parseFloat(d);
        });
      }

      colorMatch.shift();

      if (!colorMatch[3]) {
        colorMatch.push(1);
      }

      return wysihtml5.lang.array(colorMatch).map(function(d, idx) {
        return (idx < 3) ? parseInt(d, radix): parseFloat(d);
      });
    },

    /* Takes rgba color array [r,g,b,a] as a value and formats it to color string with given format type
     * If no format is given, rgba/rgb is returned based on alpha value
     *
     * Example:
     *    var colorStr = wysihtml5.quirks.styleParser.unparseColor([170, 187, 204, 1], "hash");  // "#AABBCC"
     *    var colorStr = wysihtml5.quirks.styleParser.unparseColor([170, 187, 204, 1], "hex");  // "AABBCC"
     *    var colorStr = wysihtml5.quirks.styleParser.unparseColor([170, 187, 204, 1], "csv");  // "170, 187, 204, 1"
     *    var colorStr = wysihtml5.quirks.styleParser.unparseColor([170, 187, 204, 1], "rgba");  // "rgba(170,187,204,1)"
     *    var colorStr = wysihtml5.quirks.styleParser.unparseColor([170, 187, 204, 1], "rgb");  // "rgb(170,187,204)"
     *
     *    var colorStr = wysihtml5.quirks.styleParser.unparseColor([170, 187, 204, 0.5]);  // "rgba(170,187,204,0.5)"
     *    var colorStr = wysihtml5.quirks.styleParser.unparseColor([170, 187, 204, 1]);  // "rgb(170,187,204)"
     */
    unparseColor: function(val, colorFormat) {
      var hexRadix = 16;

      if (colorFormat === "hex") {
        return (val[0].toString(hexRadix) + val[1].toString(hexRadix) + val[2].toString(hexRadix)).toUpperCase();
      } else if (colorFormat === "hash") {
        return "#" + (val[0].toString(hexRadix) + val[1].toString(hexRadix) + val[2].toString(hexRadix)).toUpperCase();
      } else if (colorFormat === "rgb") {
        return "rgb(" + val[0] + "," + val[1] + "," + val[2] + ")";
      } else if (colorFormat === "rgba") {
        return "rgba(" + val[0] + "," + val[1] + "," + val[2] + "," + val[3] + ")";
      } else if (colorFormat === "csv") {
        return  val[0] + "," + val[1] + "," + val[2] + "," + val[3];
      }

      if (val[3] && val[3] !== 1) {
        return "rgba(" + val[0] + "," + val[1] + "," + val[2] + "," + val[3] + ")";
      } else {
        return "rgb(" + val[0] + "," + val[1] + "," + val[2] + ")";
      }
    },

    // Parses font size value from style string
    parseFontSize: function(stylesStr) {
      var params = stylesStr.match(makeParamRegExp("font-size"));
      if (params) {
        return wysihtml5.lang.string(params[params.length - 1].split(":")[1]).trim();
      }
      return false;
    }
  };

})(wysihtml5);
