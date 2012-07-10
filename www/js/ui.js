define(['jquery', 'share'], function($, share) {
  var step = 0;
  var colors = ['#900', '#06c', '#360'];

  function nextStep() {
    if (step >= 2) return false;
    step++;

    var header = $('header');
    header.css('background', colors[step]);

    var stepEls = $('.step');
    stepEls.removeClass('active');
    var stepEl = $(stepEls[step]);
    stepEl.addClass('active');

    switch (step) {
      case 1: initEffects(); break;
      case 2: initShare(); break;
    }

    return true;
  };

  function initCapture() {
    $('#take').click(function() {
      nextStep();
    });
    $('#effects').hide();
    $('#share').hide();
    $('#go-to-share').hide();
  };

  function initEffects() {
    $('#take').hide();
    $('#effects').show();
    $('#share').hide();
    $('#go-to-share').show();
    $('#go-to-share').click(function() {
      nextStep();
    });
  };

  function initShare() {
    $('#take').hide();
    $('#effects').hide();
    $('#share').show();
    $('#go-to-share').hide();

    $('#facebook').click(function () {
      share.share('fb');
    });
    $('#twitter').click(function () {
      share.share('t');
    });
  };

  return {
    init: function() {
      initCapture();
    }
  };
});