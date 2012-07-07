
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
    var canvas = document.getElementById("c");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    var c = canvas.getContext("2d");
    document.getElementById("take").addEventListener("click", function(e) {
      console.log("canvas: " + canvas.width + " " + canvas.height);
      c.drawImage(v,0,0,canvas.width,canvas.height);
    });

    if (navigator.getUserMedia) {
      //navigator.getUserMedia('video', successCallback, errorCallback);
      // Below is the latest syntax. Using the old syntax for the time being
      // for backwards compatibility.
      navigator.getUserMedia({video: true}, successCallback, errorCallback);
      function successCallback(stream) {
        document.getElementById("v").src = stream;
      }
      function errorCallback(error) {
        console.error('An error occurred: [CODE ' + error.code + ']');
        return;
      }
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
