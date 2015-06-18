(function(wysihtml5) {
  var supportedColourTypes = {
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
    makeParamRegExp = function (p) {
      return new RegExp("(^|\\s|;)" + p + "\\s*:\\s*[^;$]+", "gi");
    };

  function getColourType (colourStr) {
    var prop, colourTypeConf;

    for (prop in supportedColourTypes) {
      if (!supportedColourTypes.hasOwnProperty(prop)) { continue; }

      colourTypeConf = supportedColourTypes[prop];

      if (colourTypeConf.regex.test(colourStr)) {
        return colourTypeConf;
      }
    }
  }

  function getColourName (colourStr) {
    var type = getColourType(colourStr);

    return type ? type.name : void 0;
  }

  wysihtml5.quirks.styleParser = {

    getColorName : getColourName,
    getColorType : getColourType,

    parseColor : function (stylesStr, paramName) {
      var paramsRegex, params, colourType, colourMatch, radix,
          colourStr = stylesStr;

      if (paramName) {
        paramsRegex = makeParamRegExp(paramName);

        if (!(params = stylesStr.match(paramsRegex))) { return false; }

        params = params.pop().split(":")[1];
        colourStr = wysihtml5.lang.string(params).trim();
      }

      if (!(colourType = getColourType(colourStr))) { return false; }
      if (!(colourMatch = colourStr.match(colourType.regex))) { return false; }

      radix = colourType.radix || 10;

      if (colourType === supportedColourTypes.hex3) {
        colourMatch.shift();
        colourMatch.push(1);
        return wysihtml5.lang.array(colourMatch).map(function(d, idx) {
          return (idx < 3) ? (parseInt(d, radix) * radix) + parseInt(d, radix): parseFloat(d);
        });
      }

      colourMatch.shift();

      if (!colourMatch[3]) {
        colourMatch.push(1);
      }

      return wysihtml5.lang.array(colourMatch).map(function(d, idx) {
        return (idx < 3) ? parseInt(d, radix): parseFloat(d);
      });
    },

    unparseColor: function(val, colourName) {
      var colourType,
          hexRadix = 16;

      if (!(colourType = getColourType(val))) { return false; }

      colourName = colourType.name;

      if (colourName === "hex") {
        return (val[0].toString(hexRadix).toUpperCase()) + (val[1].toString(hexRadix).toUpperCase()) + (val[2].toString(hexRadix).toUpperCase());
      } else if (colourName === "hash") {
        return "#" + (val[0].toString(16).toUpperCase()) + (val[1].toString(16).toUpperCase()) + (val[2].toString(16).toUpperCase());
      } else if (colourName === "rgb") {
        return "rgb(" + val[0] + "," + val[1] + "," + val[2] + ")";
      } else if (colourName === "rgba") {
        return "rgba(" + val[0] + "," + val[1] + "," + val[2] + "," + val[3] + ")";
      } else if (colourName === "csv") {
        return  val[0] + "," + val[1] + "," + val[2] + "," + val[3];
      }

      if (val[3] && val[3] !== 1) {
        return "rgba(" + val[0] + "," + val[1] + "," + val[2] + "," + val[3] + ")";
      } else {
        return "rgb(" + val[0] + "," + val[1] + "," + val[2] + ")";
      }
    },

    parseFontSize: function(stylesStr) {
      var params = stylesStr.match(makeParamRegExp("font-size"));
      if (params) {
        return wysihtml5.lang.string(params[params.length - 1].split(":")[1]).trim();
      }
      return false;
    }
  };

})(wysihtml5);
