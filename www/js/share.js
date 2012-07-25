define(['jquery'], function($) {
  var canvas = document.getElementById("c");
  function share(type) {
    try {
      var img = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    } catch (e) {
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
    }).success(function (data) {
      var photoURL = data['upload']['links']['imgur_page'];
      if (type == 'facebook') var url = 'https://www.facebook.com/sharer/sharer.php?u=' + photoURL;
      else if (type = 'twitter') var url = 'https://twitter.com/intent/tweet?source=webclient&text=See how hipster I am: ' + photoURL;
      w.location.href = url;
    }).error(function () {
      alert('Could not reach api.imgur.com. Sorry :(');
      w.close();
    });
  }

  return {
    share: share
  };
})
