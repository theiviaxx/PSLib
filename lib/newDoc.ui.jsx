// newDoc.ui
$.level = 1;
var _  = require('underscore');
var NewDocUI = function() {
    var self = this;
    this.templates = [];
    // Build UI
    var win = new Window('dialog', 'New Document', undefined, {resizeable: true});
    win.minimumSize = {width: 600, height: 460};
    win.orientation = 'column';
    win.alignChildren = 'fill';
    
    win.onResize = function() {
        this.update();
        this.layout.resize();
    }
    
    var content = win.add('group', undefined, 'content');
    content.alignment = ['fill', 'fill'];
    content.orientation = 'row';
    
    this.gTemplates = content.add('panel', undefined, 'Template');
    this.gTemplates.alignment = ['fill', 'fill'];
    this.lTemplates = this.gTemplates.add('listbox');
    this.lTemplates.alignment = ['fill', 'fill'];
    
    var contentRight = content.add('group');
    contentRight.orientation = 'column';
    contentRight.alignment = ['right', 'fill']
    contentRight.minimumSize = {width: 180, height: 100};
    var sizeGroup = contentRight.add('panel', undefined, 'Size');
    sizeGroup.alignment = ['fill', 'top'];
    this.ddSize = sizeGroup.add('dropdownlist');
    this.ddSize.alignment = ['fill', 'top'];
    var dimGroup = sizeGroup.add('group')
    this.eWidth = dimGroup.add('edittext');
    this.eWidth.preferredSize.width = 60;
    dimGroup.add('statictext', undefined, 'x');
    this.eHeight = dimGroup.add('edittext');
    this.eHeight.preferredSize.width = 60;
    
    var docGroup = contentRight.add('panel', undefined, 'DocString');
    docGroup.alignment = ['fill', 'fill'];
    this.lDocString = docGroup.add('statictext', undefined, '', {multiline: true});
    this.lDocString.alignment = ['fill', 'fill'];
    
    this.actions = win.add('group');
    this.actions.orientation = 'row';
    this.actions.alignment = ['right', 'bottom'];
    this.actions.alignChildren = 'bottom';

    this.bOk = this.actions.add('button', undefined, 'Ok');
    this.bCancel = this.actions.add('button', undefined, 'Cancel');
    
    // Public API
    this.show = function() {
        win.center();
        win.show();
    }
    this.setTitle = function(title) {
        title = title || 'New Document';
        win.text = title;
    }
    this.setSizeItems = function(items) {
        this._setListItems(items, this.ddSize);
    }
    this.setTemplates = function(items) {
        this.templates = items;
        this._setListItems(items, this.lTemplates, 'name');
    }

    // Private API
    this._setListItems = function(items, control, property) {
        items = items || [];
        _.each(items, function(item) {
            var text = (property) ? item[property] : item;
            var type = (text === '-') ? 'separator' : 'item';
            control.add(type, text);
        });
        if (control.items.length > 0) {
            control.selection = 0;
        }
    }
    this._createTemplate = function() {
        var sel = self.lTemplates.selection.index;
        if (sel === 0) {
            app.documents.add();
        }
        else {
            
        }
        app.activeDocument.resizeCanvas (parseInt(self.eWidth.text), parseInt(self.eHeight.text));
        win.close();
    }

    // Events
    this.ddSize.onChange = function() {
        var sel = this.selection.text;
        var dim = sel.split('x');
        self.eWidth.text = dim[0];
        self.eHeight.text = dim[1];
    };
    this.lTemplates.onChange = function() {
        var sel = this.selection.index;
        self.lDocString.text = self.templates[sel].doc;
    }
    this.lTemplates.onDoubleClick = this._createTemplate;
    this.bOk.onClick = this._createTemplate;
    
}
//new NewDocUI().show();
exports = module.exports = NewDocUI;