
// The code below uses require.js, a module system for javscript:
// http://requirejs.org/docs/api.html#define

// Set the path to jQuery, which will fall back to the local version
// if google is down
require.config({
  paths: {'jquery':
    ['//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
      'lib/jquery']}
});

// When you write javascript in separate files, list them as
// dependencies along with jquery
require(['jquery', 'ui', 'effects'], function($, ui, effects) {
  
  effects.init();
  ui.init();

});
