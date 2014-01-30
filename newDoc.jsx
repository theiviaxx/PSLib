// New Doc
$.level = 1;
#include require.jsx

var ui = require('lib/newDoc.ui');
var JSON = require('JSON');

var win = new ui();
win.setSizeItems(['32x32', '64x64', '128x128', '256x256', '512x512', '1024x1024']);
var fh = new File(new File($.fileName).parent + '/templates/templates.json');
fh.open('r');
var data = fh.read();
fh.close();

win.setTemplates(JSON.parse(data));

win.show();