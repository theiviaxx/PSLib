

var _ = require('underscore');

var Template = function(obj) {
    this.obj = obj;
    _.defaults(this.obj, {scripts: [], baked: [], psd: obj.name + '.psd', doc: ''});
    this.PSD = new File(obj.psd);
    
    // Public
    this.build = function() {
        if (!this.PSD.exists) {
            alert("Template: " + this.PSD + " does not exist!");
            return false;
        }
        
        app.open(this.PSD);
        var doc = app.activeDocument;
        var dup = app.activeDocument.duplicate ();
        app.activeDocument = doc;
        doc.close(SaveOptions.DONOTSAVECHANGES);
        app.activeDocument = dup;
        
        _.each(obj.baked, function(item) {
            var layer;
            var parts = item.split('.');
            if (parts.length === 3) {
                var parent = parts[0];
                var child = parts[1];
                var layerName = parts[2];
                try {
                    layer = app.activeDocument.layerSets.getByName('_' + parent).layerSets.getByName('_' + child).artLayers.getByName(layerName);
                } catch (e) {}
            }
            else {
                var parent = parts[0];
                var layerName = parts[1];
                try {
                    layer = app.activeDocument.layerSets.getByName('_' + parent).artLayers.getByName(layerName);
                } catch (e) {}
            }
            $.writeln(layer);
        }, this);
    
        _.each(this.obj.scripts, function(script) {
            try {
                $.eval(script);
            } catch (e) {}
        }, this);
    }
}

Template.scripts = {
    
}

exports = module.exports = Template;