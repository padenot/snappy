
// The code below uses require.js, a module system for javscript:
// http://requirejs.org/docs/api.html#define

// Set the path to jQuery, which will fall back to the local version
// if google is down
require.config({
  paths: {'jquery':
    ['//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
      'lib/jquery']}
});

var global = this;

function uploadImgur() {
  var key = "aa325d27b64d323ae34eba7b029b2d85";
}

function rgb2hsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

function hsv2rgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

var filters = {
  "blackwhite" : function(data, out, h, w) {
    for(var i = 0; i < data.length; i+=4) {
      var r = data[i];
      var g = data[i+1];
      var b = data[i+2];
      var brightness = (3*r+4*g+b)>>>3;
      out[i] = brightness;
      out[i+1] = brightness;
      out[i+2] = brightness;
    }
  },
  "sepia" : function(data, out, h, w) {
    for(var i = 0; i < data.length; i+=4) {
      var r = data[i], g = data[i+1], b = data[i+2];
      out[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
      out[i+1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
      out[i+2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
    }
  },
  "contrast" : function(data, out, h, w, param) {
    function contrast(f, param) {
      return (f - 0.5) * param + 0.5;
    }
    for(var i = 0; i < data.length; i+=4) {
      var r = data[i], g = data[i+1], b = data[i+2];
      out[i]   = 255 * contrast(r / 255, param);
      out[i+1] = 255 * contrast(g / 255, param);
      out[i+2] = 255 * contrast(b / 255, param);
    }
  },
  "vignetting" : function(data, out, h, w, strength) {
    function distance(x, y, cx, cy) {
      return Math.sqrt(Math.abs(x - cx) + Math.abs(y - cy));
    }
    var maxDistance = distance(0, 0, w, h);
    for(var i = 0, pix = 0; i < data.length; i+=4, pix++) {
      var r = data[i], g = data[i+1], b = data[i+2];
      var x = pix % w, y = pix / w;
      var d = (maxDistance / strength - distance(x, y, w/2, h/2)) / maxDistance;
      out[i]   = r * d;
      out[i+1] = g * d;
      out[i+2] = b * d;
    }
  },
  "invert" : function(data, out, h, w) {
    for(var i = 0; i < data.length; i+=4) {
      var r = data[i], g = data[i+1], b = data[i+2];
      out[i]   = 255 - r;
      out[i+1] = 255 - g;
      out[i+2] = 255 - b;
    }
  },
  // c: scaling factor
  "saturate" : function(data, out, h, w, saturation) {
    for(var i = 0; i < data.length; i+=4) {
      var r = data[i], g = data[i+1], b = data[i+2];

      hsv = rgb2hsv(r, g, b);

      h = hsv[0];
      s = hsv[1] * saturation;
      v = hsv[2];

      rgb = hsv2rgb(h, s, v);

      out[i]   = rgb[0];
      out[i+1] = rgb[1];
      out[i+2] = rgb[2];
    }
  },
  "gamma" : function(data, out, h, w, gamma) {
    for(var i = 0; i < data.length; i+=4) {
      var r = data[i], g = data[i+1], b = data[i+2];

      hsv = rgb2hsv(r, g, b);

      h = hsv[0];
      s = hsv[1];
      v = hsv[2] * gamma;

      rgb = hsv2rgb(h, s, v);

      out[i]   = rgb[0];
      out[i+1] = rgb[1];
      out[i+2] = rgb[2];
    }
  },
  // color: 
  "tint" : function(data, out, h, w, color, strength) {
    for(var i = 0; i < data.length; i+=4) {
      var r = data[i], g = data[i+1], b = data[i+2];

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

      out[i]   = rgb[0];
      out[i+1] = rgb[1];
      out[i+2] = rgb[2];
    }
    },
  convolution: function(data, out, sh, sw, op) {
    var opSize = Math.round(Math.sqrt(op.length));
    var opHalfSize = Math.floor(opSize/2);

    var w = sw;
    var h = sh;

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var outOffset = (y*w+x)*4;
        var newR=0, newG=0, newB=0, newA=0;
        for (var oy=0; oy<opSize; oy++) {
          for (var ox=0; ox<opSize; ox++) {
            var curY = y+oy-opHalfSize;
            var curX = x+ox-opHalfSize;
            if (curY >= 0 && curY < h && curX >= 0 && curX < w) {
              var curOffset = (curY*w+curX)*4;
              var curOp = op[oy*opSize+ox];
              newR += data[curOffset]*curOp;
              newG += data[curOffset+1]*curOp;
              newB += data[curOffset+2]*curOp;
              newA += data[curOffset+3]*curOp;
            }
          }
        }
        out[outOffset] = newR;
        out[outOffset+1] = newG;
        out[outOffset+2] = newB;
        out[outOffset+3] = newA;
      }
    }
  },
  mask: function(data, out, h, w, maskFunction) {
    for (var y=0; y<h; y++) {
      for (var x=0; x<w; x++) {
        var i = (y*w+x)*4;
        var newAmount = maskFunction(x,y);
        var origAmount = 1-newAmount;
        out[i] = newAmount*out[i] + origAmount*data[i];
        out[i+1] = newAmount*out[i+1] + origAmount*data[i+1];
        out[i+2] = newAmount*out[i+2] + origAmount*data[i+2];
        out[i+3] = newAmount*out[i+3] + origAmount*data[i+3];
      }
    }
  }
}

var convolutions = {
  gaussian: function(delta) {
    var d2 = delta*delta;
    function g(x, y) {
      return (1/(2*Math.PI*d2))*Math.exp(-(x*x+y*y)/(2*d2));
    }

    var size = Math.ceil(6*delta+1);
    var halfSize = Math.floor(size/2);
    var out = [];
    for (var y=0; y<size; y++) {
      for (var x=0; x<size; x++) {
        out.push(g(x-halfSize, y-halfSize));
      }
    }
    return out;
  }
}

var effects ={
  greenish: [
    {
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
  }
  ],
  blackwhite: [
    {
    f: filters.blackwhite
  }
  ],
  cold: [
    {
    f:filters.tint,
    param1:0.66,
    param2:1
  },
  {
    f:filters.saturate,
    param1:0.6
  }
  ],
  hot: [
    {
    f:filters.tint,
    param1:0.1,
    param2:1
  },
  {
    f: filters.contrast,
    param1: 1.4
  },
  {
    f:filters.gamma,
    param1: 1.1
  }
  ],
  pixelate: [
    {
    f:filters.pixelate
  }
  ]
};

var ui = {
  step: 0,

  colors: ['#900', '#06c', '#360'],

  init: function() {
    this.initCapture();
  },

  nextStep: function() {
    if (this.step >= 2) return false;
    this.step++;

    var header = $('header');
    header.css('background', this.colors[this.step]);

    var stepEls = $('.step');
    stepEls.removeClass('active');
    var stepEl = $(stepEls[this.step]);
    stepEl.addClass('active');

    switch (this.step) {
      case 1: this.initEffects(); break;
      case 2: this.initShare(); break;
    }

    return true;
  },

  initCapture: function() {
    var self = this;
    $('#take').click(function() {
      self.nextStep();
    });
    $('#effects').hide();
  },

  initEffects: function() {
    $('#take').hide();
    $('#effects').show();
  },

  initShare: function() {
    $('#take').hide();
    $('#effects').hide();
  }
}

// When you write javascript in separate files, list them as
// dependencies along with jquery
require(['jquery'], function($) {
  
  ui.init();

  var canvas = document.getElementById("c");
  var processed = document.getElementById("p");
  var c = canvas.getContext("2d");
  var p = processed.getContext("2d");
  var original = null;
  function process(effect) {
    var idata = original;
    var data = idata.data;
    var iother = c.createImageData(idata);
    var other = iother.data;
    var w = idata.width;
    var h = idata.height;
    var limit = data.length;

    // Set the alpha to opaque.
    for (var i = 0; i < other.length; i += 4) {
      other[i+3] = 255;
    }

    var input = data,
    out = other;
    for (var i = 0; i < effect.length; i++) {
      effect[i].f(input, out, h, w, effect[i].param1, effect[i].param2);
      var tmp = input;
      input = out;
      out = tmp;
    }
    if (effect.length % 2) {
      return iother;
    } else {
      return idata;
    }
  }

  document.getElementById("greenish").addEventListener("click", function(e) {
    alert("plop");
    c.putImageData(process(effects.greenish), 0, 0);
  });
  document.getElementById("blackwhite").addEventListener("click", function(e) {
    c.putImageData(process(effects.blackwhite), 0, 0);
  });
  document.getElementById("cold").addEventListener("click", function(e) {
    c.putImageData(process(effects.cold), 0, 0);
  });
  document.getElementById("hot").addEventListener("click", function(e) {
    c.putImageData(process(effects.hot), 0, 0);
  });

  var v = document.getElementById("v");
  v.addEventListener("loadedmetadata", function() {
    canvas.width = 400;
    canvas.height = 400;
    processed.width = v.videoWidth;
    processed.height = v.videoHeight;
    document.getElementById("take").addEventListener("click", function(e) {
      // We want to crop the image to a square, because hipster love square
      // photos.
      var xOffset, yOffset, xSize, ySize;
      if (v.videoHeight < v.videoWidth) {
        xOffset = (v.videoWidth - v.videoHeight) / 2;
        yOffset = 0;
        xSize = ySize = v.videoHeight;
      } else {
        xOffset = (v.videoHeight - v.videoWidth) / 2;
        yOffset = 0;
        xSize = ySize = v.videoWidth;
      }
      c.drawImage(document.getElementById("v"),xOffset, yOffset ,xSize ,ySize , 0, 0, canvas.width, canvas.height);
      original = c.getImageData(0,0, canvas.width, canvas.height);
      // stop the camera
      v.src = "";
      // Put the canvas instead of the video
      v.style.display = "none";
      canvas.style.display = "inline-block";
    });
    function process() {
      // Grab the pixel data from the backing canvas
      var idata = c.getImageData(0,0,canvas.width,canvas.height);
      var data = idata.data;
      var iother = c.createImageData(idata);
      var other = iother.data;
      var w = idata.width;
      var h = idata.height;
      var limit = data.length;

      for (var i = 0; i < other.length; i += 4) {
        other[i+3] = 255;
      }

      // filters.sepia(data, other, h, w);
      // filters.constrast(other, data, h, w, 1.7);
      // filters.vignetting(data, other, h, w, 1.1);
      // filters.convolution(data, other, h, w, convolutions.gaussian(3));
      function m(x,y) {
        if (y < 500) {
          return 1-y/500;
        } else {
          return 0;
        }
      }
      filters.blackwhite(data, other, h, w);
      filters.mask(data, other, h, w, m);

      processed.width = v.videoWidth;
      processed.height = v.videoHeight;
      p.putImageData(iother,0,0);
    }
  });
  if (navigator.mozGetUserMedia) {
    //navigator.getUserMedia('video', successCallback, errorCallback);
    // Below is the latest syntax. Using the old syntax for the time being
    // for backwards compatibility.
    function successCallback(stream) {
      document.getElementById("v").src = stream;
      document.getElementById("v").play();
    }
    function errorCallback(error) {
      console.error('An error occurred: [CODE ' + error.code + ']');
      return;
    }
    navigator.mozGetUserMedia({video: true}, successCallback, errorCallback);
  } else if (navigator.webkitGetUserMedia) {
    //navigator.getUserMedia('video', successCallback, errorCallback);
    // Below is the latest syntax. Using the old syntax for the time being
    // for backwards compatibility.
    function successCallback(stream) {
      document.getElementById("v").src = webkitURL.createObjectURL(stream);
      document.getElementById("v").play();
    }
    function errorCallback(error) {
      console.error('An error occurred: [CODE ' + error.code + ']');
      return;
    }
    navigator.webkitGetUserMedia({video: true}, successCallback, errorCallback);
  } else {
    console.log('Native web camera streaming (getUserMedia) is not supported in this browser.');
    return;
  }

  // If using Twitter Bootstrap, you need to require all the
  // components that you use, like so:
  // require('bootstrap/dropdown');
  // require('bootstrap/alert');

document.getElementById("twitter").addEventListener("click", share);
// trigger me onclick
function share() {
  try {
    var img = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
  } catch(e) {
    var img = canvas.toDataURL().split(',')[1];
  }
  // open the popup in the click handler so it will not be blocked
  var w = window.open();
  w.document.write('Sending the image in the internetz...');
  // upload to imgur using jquery/CORS
  // https://developer.mozilla.org/En/HTTP_access_control
  $.ajax({
    url: 'http://api.imgur.com/2/upload.json',
    type: 'POST',
    data: {
      type: 'base64',
      // get your key here, quick and fast http://imgur.com/register/api_anon
      key: 'aa325d27b64d323ae34eba7b029b2d85',
      name: '',
      title: 'HIPSTAH',
      caption: "I'm was filtering photos before it was mainstream",
      image: img
    },
    dataType: 'json'
  }).success(function(data) {
    w.location.href = "https://twitter.com/intent/tweet?source=webclient&text=See how hipster I am: "+ data['upload']['links']['imgur_page'];
  }).error(function() {
    alert('Could not reach api.imgur.com. Sorry :(');
    w.close();
  });
});

// Include the in-app payments API, and if it fails to load handle it
// gracefully.
// https://developer.mozilla.org/en/Apps/In-app_payments
require(['https://marketplace-cdn.addons.mozilla.net/mozmarket.js'],
        function() {},
        function(err) {
          global.mozmarket = global.mozmarket || {};
          global.mozmarket.buy = function() {
            alert('The in-app purchasing is currently unavailable.');
          };
        });
