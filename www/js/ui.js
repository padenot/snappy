define(['jquery', 'share'], function($, share) {
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
      $('#share').hide();
      $('#go-to-share').hide();
    },

    initEffects: function() {
      $('#take').hide();
      $('#effects').show();
      $('#share').hide();
      $('#go-to-share').show();
      $('#go-to-share').click(function() {
        ui.nextStep();
      });
    },

    initShare: function() {
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
    }
  }

  return ui;
});