require.config({
  paths: {'jquery': 'lib/jquery'}
});

// When you write javascript in separate files, list them as
// dependencies along with jquery
require(['jquery', 'ui', 'effects'], function($, ui, effects) {
  
  effects.init();
  ui.init();

});
