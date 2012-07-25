define(function () {
  const WIDTH = 400;
  const HEIGHT = 400;

  function init() {
    setupMasks();
  }

  function setupMasks() {
    var temp = document.createElement('canvas');
    temp.width = WIDTH;
    temp.height = HEIGHT;
    var t = temp.getContext('2d');

    (function setupMask() {
      var m = new Image();
      m.onload = function () {
        t.drawImage(m, 0, 0, m.width, m.height, 0, 0, temp.width, temp.height);
        var maskImage = t.getImageData(0, 0, temp.width, temp.height).data;
        var maskArr = new Float32Array(maskImage.length / 4);
        for (var i = 0, j = 0; i < maskImage.length; i += 4, j++) {
          var r = maskImage[i];
          var g = maskImage[i + 1];
          var b = maskImage[i + 2];
          var brightness = 1 - ((3 * r + 4 * g + b) >>> 3) / 255;
          maskArr[j] = brightness;
        }
        effects.mask[1].param1 = maskArr;
      };
      m.src = 'masks/mask1.png';
    })();

    (function setupBlur() {
      var m = new Image();
      m.onload = function () {
        t.drawImage(m, 0, 0, m.width, m.height, 0, 0, temp.width, temp.height);
        var maskImage = t.getImageData(0, 0, temp.width, temp.height).data;
        var maskArr = new Float32Array(maskImage.length / 4);
        for (var i = 0, j = 0; i < maskImage.length; i += 4, j++) {
          var r = maskImage[i];
          var g = maskImage[i + 1];
          var b = maskImage[i + 2];
          var brightness = 1 - ((3 * r + 4 * g + b) >>> 3) / 255;
          maskArr[j] = brightness;
        }
        effects.blur[1].param1 = maskArr;
      };
      m.src = 'masks/circle_mask.png';
    })();
  }

  function processFromName(effectName) {
    return process(effects[effectName]);
  }

  function process(effect) {
    var canvas = document.getElementById('c');
    var processed = document.getElementById('p');
    var c = canvas.getContext('2d');
    var p = processed.getContext('2d');

    var idata = c.getImageData(0, 0, canvas.width, canvas.height);
    var data = idata.data;
    var iother = c.createImageData(idata);
    var other = iother.data;
    var w = idata.width;
    var h = idata.height;
    var limit = data.length;

    // Set the alpha to opaque.
    for (var i = 0; i < other.length; i += 4) {
      other[i + 3] = 255;
    }

    var input = data,
        out = other;
    var useOther = true;
    for (var i = 0; i < effect.length; i++) {
      var e = effect[i];
      setEffectDefaults(e);
      e.f(input, out, h, w, e.param1, e.param2);
      if (e.flipNext) {
        var tmp = input;
        input = out;
        out = tmp;
        useOther != useOther;
      }
    }
    if (useOther) {
      return iother;
    } else {
      return idata;
    }
  }

  function rgb2hsv(r, g, b) {
    r = r / 255, g = g / 255, b = b / 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      }
      h /= 6;
    }

    return [h, s, v];
  }

  function hsv2rgb(h, s, v) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
    case 0:
      r = v, g = t, b = p;
      break;
    case 1:
      r = q, g = v, b = p;
      break;
    case 2:
      r = p, g = v, b = t;
      break;
    case 3:
      r = p, g = q, b = v;
      break;
    case 4:
      r = t, g = p, b = v;
      break;
    case 5:
      r = v, g = p, b = q;
      break;
    }

    return [r * 255, g * 255, b * 255];
  }

  var filters = {
    blackwhite: function (data, out, h, w) {
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var brightness = (3 * r + 4 * g + b) >>> 3;
        out[i] = brightness;
        out[i + 1] = brightness;
        out[i + 2] = brightness;
      }
    },
    sepia: function (data, out, h, w) {
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        out[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
        out[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
        out[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
      }
    },
    contrast: function (data, out, h, w, param) {
      function contrast(f, param) {
        return (f - 0.5) * param + 0.5;
      }
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        out[i] = 255 * contrast(r / 255, param);
        out[i + 1] = 255 * contrast(g / 255, param);
        out[i + 2] = 255 * contrast(b / 255, param);
      }
    },
    vignetting: function (data, out, h, w, strength) {
      function distance(x, y, cx, cy) {
        return Math.sqrt(Math.abs(x - cx) + Math.abs(y - cy));
      }
      var maxDistance = distance(0, 0, w, h);
      for (var i = 0, pix = 0; i < data.length; i += 4, pix++) {
        var r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        var x = pix % w,
          y = pix / w;
        var d = (maxDistance / strength - distance(x, y, w / 2, h / 2)) / maxDistance;
        out[i] = r * d;
        out[i + 1] = g * d;
        out[i + 2] = b * d;
      }
    },
    invert: function (data, out, h, w) {
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        out[i] = 255 - r;
        out[i + 1] = 255 - g;
        out[i + 2] = 255 - b;
      }
    },
    // c: scaling factor
    saturate: function (data, out, h, w, saturation) {
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i],
          g = data[i + 1],
          b = data[i + 2];

        hsv = rgb2hsv(r, g, b);

        h = hsv[0];
        s = hsv[1] * saturation;
        v = hsv[2];

        rgb = hsv2rgb(h, s, v);

        out[i] = rgb[0];
        out[i + 1] = rgb[1];
        out[i + 2] = rgb[2];
      }
    },
    gamma: function (data, out, h, w, gamma) {
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i],
          g = data[i + 1],
          b = data[i + 2];

        hsv = rgb2hsv(r, g, b);

        h = hsv[0];
        s = hsv[1];
        v = hsv[2] * gamma;

        rgb = hsv2rgb(h, s, v);

        out[i] = rgb[0];
        out[i + 1] = rgb[1];
        out[i + 2] = rgb[2];
      }
    },
    // color: 
    tint: function (data, out, h, w, color, strength) {
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i],
          g = data[i + 1],
          b = data[i + 2];

        hsv = rgb2hsv(r, g, b);

        var h = hsv[0];
        if (h > color) {
          h -= Math.abs(h - color) * strength;
        } else {
          h += Math.abs(h - color) * strength;
        }
        s = hsv[1];
        v = hsv[2];

        rgb = hsv2rgb(h, s, v);

        out[i] = rgb[0];
        out[i + 1] = rgb[1];
        out[i + 2] = rgb[2];
      }
    },
    color: function (data, out, h, w, color) {
      if (color.length === 3) {
        color.push(255);
      }
      for (var i = 0; i < data.length; i += 4) {
        out[i] = color[0];
        out[i + 1] = color[1];
        out[i + 2] = color[2];
        out[i + 3] = color[3];
      }
    },
    convolution: function (data, out, sh, sw, op) {
      var opSize = Math.round(Math.sqrt(op.length));
      var opHalfSize = Math.floor(opSize / 2);

      var w = sw;
      var h = sh;

      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var outOffset = (y * w + x) * 4;
          var newR = 0,
            newG = 0,
            newB = 0,
            newA = 0;
          for (var oy = 0; oy < opSize; oy++) {
            for (var ox = 0; ox < opSize; ox++) {
              var curY = y + oy - opHalfSize;
              var curX = x + ox - opHalfSize;
              if (curY >= 0 && curY < h && curX >= 0 && curX < w) {
                var curOffset = (curY * w + curX) * 4;
                var curOp = op[oy * opSize + ox];
                newR += data[curOffset] * curOp;
                newG += data[curOffset + 1] * curOp;
                newB += data[curOffset + 2] * curOp;
                newA += data[curOffset + 3] * curOp;
              }
            }
          }
          out[outOffset] = newR;
          out[outOffset + 1] = newG;
          out[outOffset + 2] = newB;
          out[outOffset + 3] = newA;
        }
      }
    },
    mask: function (data, out, h, w, m) {
      if (typeof m === 'object') {
        var img = m;
        m = function (x, y) {
          return img[y * w + x];
        }
      }
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var i = (y * w + x) * 4;
          var newAmount = m(x, y);
          var origAmount = 1 - newAmount;
          out[i] = newAmount * out[i] + origAmount * data[i];
          out[i + 1] = newAmount * out[i + 1] + origAmount * data[i + 1];
          out[i + 2] = newAmount * out[i + 2] + origAmount * data[i + 2];
          out[i + 3] = newAmount * out[i + 3] + origAmount * data[i + 3];
        }
      }
    }
  }

  var convolutions = {
    gaussian: function (delta) {
      var d2 = delta * delta;

      function g(x, y) {
        return (1 / (2 * Math.PI * d2)) * Math.exp(-(x * x + y * y) / (2 * d2));
      }

      var size = Math.ceil(6 * delta + 1);
      var halfSize = Math.floor(size / 2);
      var out = [];
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          out.push(g(x - halfSize, y - halfSize));
        }
      }
      return out;
    }
  }

  function setEffectDefaults(effect) {
    if (typeof effect.flipNext === 'undefined') {
      effect.flipNext = true;
    }
  }

  var effects = {
    greenish: [{
      f: filters.contrast,
      param1: 1.7
    }, {
      f: filters.vignetting,
      param1: 1.1
    }, {
      f: filters.tint,
      param1: 0.33,
      param2: 0.8
    }, {
      f: filters.gamma,
      param1: 1.4,
    }],
    blackwhite: [{
      f: filters.blackwhite
    }],
    cold: [{
      f: filters.tint,
      param1: 0.66,
      param2: 1
    }, {
      f: filters.saturate,
      param1: 0.6
    }],
    hot: [{
      f: filters.tint,
      param1: 0.1,
      param2: 1
    }, {
      f: filters.contrast,
      param1: 1.4
    }, {
      f: filters.gamma,
      param1: 1.1
    }],
    invert: [{
      f: filters.invert
    }],
    ancient: [{
      f: filters.sepia
    }, {
      f: filters.vignetting,
      param1: 1.1
    }],
    overdrive: [{
      f: filters.saturate,
      param1: 7
    }],
    mask: [{
      f: filters.color,
      param1: [0, 0, 0, 255],
      flipNext: false
    }, {
      f: filters.mask,
    }],
    blur: [{
      f: filters.convolution,
      param1: convolutions.gaussian(3),
      flipNext: false
    }, {
      f: filters.mask,
    }]
  };

  return {
    init: init,
    processFromName: processFromName
  };
});
