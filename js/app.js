require.config({
  paths: {'jquery': 'lib/jquery'}
});

// When you write javascript in separate files, list them as
// dependencies along with jquery
require(['ui', 'camera', 'effects'], function(ui, camera, effects) {
  camera.init();
  effects.init();
  ui.init();
});
