define(function() {
  const WIDTH = 400;
  const HEIGHT = 400;

  var videoEl = document.getElementById('video');
  var canvasEl = document.getElementById("c");
  var processedEl = document.getElementById('p');

  function init() {
    if (navigator.mozGetUserMedia) {
      mozInit();
    } else if (navigator.webkitGetUserMedia) {
      webkitInit();
    } else {
      console.log('Native web camera streaming (getUserMedia) is not supported in this browser.');
    }
  }

  function mozInit() {
    function successCallback(stream) {
      videoEl.src = stream;
      videoEl.play();
    }

    function errorCallback(error) {
      console.error('An error occurred: [CODE ' + error.code + ']');
      return;
    }

    navigator.mozGetUserMedia({
      video: true
    }, successCallback, errorCallback);
  }

  function webkitInit() {
    function successCallback(stream) {
      videoEl.src = webkitURL.createObjectURL(stream);
      videoEl.play();
    }

    function errorCallback(error) {
      console.error('An error occurred: [CODE ' + error.code + ']');
      return;
    }
    navigator.webkitGetUserMedia({
      video: true
    }, successCallback, errorCallback);
  }

  function takePhoto() {
    var c = canvasEl.getContext('2d');

    canvasEl.width = WIDTH;
    canvasEl.height = HEIGHT;
    processedEl.width = videoEl.videoWidth;
    processedEl.height = videoEl.videoHeight;

    // Crop photo to square
    var xOffset, yOffset, xSize, ySize;
    if (videoEl.videoHeight < videoEl.videoWidth) {
      xOffset = (videoEl.videoWidth - videoEl.videoHeight) / 2;
      yOffset = 0;
      xSize = ySize = videoEl.videoHeight;
    } else {
      xOffset = (videoEl.videoHeight - videoEl.videoWidth) / 2;
      yOffset = 0;
      xSize = ySize = videoEl.videoWidth;
    }
    c.drawImage(videoEl, xOffset, yOffset, xSize, ySize, 0, 0, canvasEl.width, canvasEl.height);

    // stop the camera
    video.src = '';
    // Put the canvas instead of the video
    video.style.display = 'none';
    canvasEl.style.display = 'inline-block';
  }

  return {
    init: init,
    takePhoto: takePhoto
  };
});
