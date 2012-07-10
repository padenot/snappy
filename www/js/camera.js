define(function() {
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
      document.getElementById('v').src = stream;
      document.getElementById('v').play();
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
      document.getElementById('v').src = webkitURL.createObjectURL(stream);
      document.getElementById('v').play();
    }

    function errorCallback(error) {
      console.error('An error occurred: [CODE ' + error.code + ']');
      return;
    }
    navigator.webkitGetUserMedia({
      video: true
    }, successCallback, errorCallback);
  }

  return {
    init: init
  };
});
