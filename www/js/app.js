
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

// When you write javascript in separate files, list them as
// dependencies along with jquery
require(['jquery'], function($) {
  var v = document.getElementById("v");
  v.addEventListener("loadedmetadata", function() {
    var canvas = document.getElementById("c");
    var processed = document.getElementById("p");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    processed.width = v.videoWidth;
    processed.height = v.videoHeight;
    var c = canvas.getContext("2d");
    var p = processed.getContext("2d");
    document.getElementById("take").addEventListener("click", function(e) {
      console.log(v.videoWidth + ' '+ v.videoHeight);
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      c.drawImage(document.getElementById("v"),0,0,canvas.width,canvas.height);
      process();
    });
    function process() {
      // Grab the pixel data from the backing canvas
      console.log(canvas.width + ' '+ canvas.height);
      var idata = c.getImageData(0,0,canvas.width,canvas.height);
      var data = idata.data;
      var w = idata.width;
      var h = idata.height;
      var limit = data.length
      // B&W
      //for(var i = 0; i < data.length; i+=4) {
        //var r = data[i];
        //var g = data[i+1];
        //var b = data[i+2];
        //var brightness = (3*r+4*g+b)>>>3;
        //data[i] = brightness;
        //data[i+1] = brightness;
        //data[i+2] = brightness;
      //}
      // Sepia
      for(var i = 0; i < data.length; i+=4) {
        var r = data[i], g = data[i+1], b = data[i+2];
        data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
        data[i+1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
        data[i+2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
      }
      //
      // Contrast [0, 2]
      function contrast(f, param) {
        return (f - 0.5) * param + 0.5;
      }
      for(var i = 0; i < data.length; i+=4) {
        var r = data[i], g = data[i+1], b = data[i+2];
        data[i]   = 255 * contrast(r / 255, 1.2);
        data[i+1] = 255 * contrast(g / 255, 1.2);
        data[i+2] = 255 * contrast(b / 255, 1.2);
      }
      // Inverse
      //for(var i = 0; i < data.length; i+=4) {
        //var r = data[i], g = data[i+1], b = data[i+2];
        //data[i]   = 255 - r;
        //data[i+1] = 255 - g;
        //data[i+2] = 255 - b;
      //}
      // Vignetting
      function distance(x, y, cx, cy) {
        return Math.sqrt(Math.abs(x - cx) + Math.abs(y - cy));
      }
      var maxDistance = distance(0, 0, w, h);
      for(var i = 0, pix = 0; i < data.length; i+=4, pix++) {
        var r = data[i], g = data[i+1], b = data[i+2];
        var x = pix % w, y = pix / w;
        var d = (maxDistance - distance(x, y, w/2, h/2)) / maxDistance;
        data[i]   = r * d;
        data[i+1] = g * d;
        data[i+2] = b * d;
      }
      processed.width = v.videoWidth;
      processed.height = v.videoHeight;
      p.putImageData(idata,0,0);
    }

    // Convolution
    for(var i = 0; i < data.length; i+=4) {
      var r = data[i], g = data[i+1], b = data[i+2];
      data[i]   = 255 - r;
      data[i+1] = 255 - g;
      data[i+2] = 255 - b;
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
  } else {
    console.log('Native web camera streaming (getUserMedia) is not supported in this browser.');
    return;
  }

  // If using Twitter Bootstrap, you need to require all the
  // components that you use, like so:
  // require('bootstrap/dropdown');
  // require('bootstrap/alert');
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
