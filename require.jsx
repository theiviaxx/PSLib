//$.level = 1;
/*
 * An implementation of the CommonJS Modules 1.1
 * This version allows modules to be pre-loaded into the 
 * require._module_functions object which maps from module filename to
 * module function.
 *
 * Brett Dixon, 2012
 *
 * Based on require2.js by David Flanagan
 * http://www.davidflanagan.com/demos/require2.js
 */

var require = function require(id) {
    var origid = id, filename;

    // If the module id is relative, convert it to a toplevel id
    // The normalize function is below.
    if (id.substring(0,2) == "./" || id.substring(0,3) == "../")
        id = normalize(require._current_module_dir, id);

    // Search paths for module
    filename = searchModule(id);

    // Only load the module if it is not already cached.
    if (!require._cache.hasOwnProperty(filename)) {

        // Remember the directory we're loading this module from
        var olddir = require._current_module_dir;
        require._current_module_dir = id.substring(0, id.lastIndexOf('/')+1);;
        
        try {
            var f; // The function that defines the module
            // We use evalFile so we can still debug it
            var modtext = '$.evalFile(new File(\"' + filename + '\"));';
            // Wrap it in a function
            f = new Function("require", "exports", "module", modtext);
            
            // Prepare function arguments
            var exports = {};                            // Invoke on empty obj
            var module = require._cache[filename] = {    // For Modules 1.1
                id: id,
                uri: filename,
                exports: exports
            };
            f.call($.global, require, exports, module);   // Execute the module
        }
        catch(x) {
            throw new Error("Can't load module " + origid + ": " + x);
        }
        finally { // Restore the directory we saved above
            require._current_module_dir = olddir;
        }
    }
    return require._cache[filename].exports;  // Return the module API from the cache
    
    // We need to build an array of paths to search, only do it once
    function _buildPath(current) {
        require._path = require.path.slice(0);
        require._path.push(new Folder(current + '/' + id).parent);
        require._path.push(new File($.fileName).parent);
        var split = ($.os.slice(0,3) === 'win') ? ';' : ':';
        var fromPath = ($.getenv('PHOTOSHOP_PATH') || '').split(split);
        for (var p=0;p<fromPath.length;p++) {
            var path = fromPath[p];
            path = (path.lastIndexOf('/') === path.length) ? path : path + '/';
            require._path.push(path);
        }
    
        require.isPathBuilt = true;
    }
    
    // Function to search through the .path array for modules
    // Will try the different flavors as defined in the CommonJS spec for Modules 1.1
    function searchModule(id) {
        var f, found;
        var current = new Folder(new File($.fileName).parent + '/' + require._current_module_dir);
        
        if (!require.isPathBuilt) {
            _buildPath(current);
        }
        
        var files = [];
        files.push(new File(current + '/' + id + require._ext));
        files.push(new File(current + '/' + id + '/index' + require._ext));
        files.push(new File(require.entry_module_dir + '/' + id + require._ext));
        
        for(var i=0;i<require._path.length;i++) {
            files.push(new File(require._path[i] + '/' + id + require._ext));
            files.push(new File(require._path[i] + '/' + id + '/index' + require._ext));
            files.push(new File(require._path[i] + '/' + require._current_module_dir + '/' + id + require._ext));
        }
    
        for (var i=0;i<files.length;i++) {
            var module = files[i];
            if (module.exists) {
                if (require.entry_module_dir === "") {
                    require.entry_module_dir = module.parent;
                }
                require.rel_module_dir = module.parent;
                return module;
            }
        }
        
        throw "Could not load name " + id;
    }

    function normalize(dir, file) {
        for(;;) {
            if (file.substring(0,2) == "./")
                file = file.substring(2);
            else if (file.substring(0,3) == "../") {
                file = file.substring(3);
                dir = up(dir);
            }
            else break;
        }
        return dir+file;
        
        function up(dir) { // Return the parent directory of dir
            if (dir == "") throw "Can't go up from ''";
            if (dir.charAt(dir.length-1) != "/") throw "dir doesn't end in /";
            return dir.substring(0, dir.lastIndexOf('/', dir.length-2)+1);
        }
    }


};

// Set require.path to point to the directories from which modules should be
// loaded.  Items must be an empty string or a string that ends with "/".
// Will also include the PHOTOSHOP_PATH env var.
// This is never replaced or destroyed
require.path = [];
// Flag to build the path array or not
require.isPathBuilt = false;

// For relative module names
require._current_module_dir = "";
// Entry point for initial script
require.entry_module_dir = "";

// This object holds the exports object of named modules
require._cache = {};

// Extension type to use
require._ext = '.jsx'; // '.js'

// Tests
(function() {
    var f = new Folder(new File($.fileName).parent + '/tests/1.0');
    var mods = f.getFiles();
    require._ext = '.js'; // Tests were written for JS, so their extensions are .js not .jsx
    for (var i=0;i<mods.length;i++) {
        var mod = mods[i];
        try {
            var m = require('1.0/' + mod.name + '/program');
        }
        catch (e) {
            $.writeln(e);
        }
        finally {
            require.isPathBuilt = false;
            require.entry_module_dir = "";
        }
    }
})();
