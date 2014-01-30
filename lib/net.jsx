// Copyright (C) 2012 Brett Dixon

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 
// "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject 
// to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
// THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT 
// SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN 
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE 
// USE OR OTHER DEALINGS IN THE SOFTWARE.

/*
(function() {
    var net = require('lib/net');

    new net.$http.Request({
        url: 'http://127.0.0.1/',
        port: 5000,
        method: 'post',
        data: {json: 1, buildid: 100},
        files: [{file: "C:/Users/theiv_000/Google Drive/pictures/Sample Pictures/Chrysanthemum.jpg"}],
        onSuccess: function(res) {
            alert(res.content);
        }
    }).send();
    net.$http.get("http://127.0.0.1:5000/")
    net.$http.get("http://127.0.0.1:5000")
    net.$http.get("http://www.google.com")
})();
*/

(function() {
    var JSON = require('JSON');
    var _ = require('underscore');
    
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g,"");
    }
    var ResponseCode = {
        SUCCESS: 200,
        NOT_FOUND: 404,
        DENIED: 403,
        REDIRECT: 300,
        CLIENT_ERROR: 400,
        SERVER_ERROR: 500
    }
    var MIME_TYPES = {
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.tiff': 'image/tiff',
        '.tif': 'image/tiff',
        '.psd': 'application/octet-stream'
    };
    if ($.os.search(/win/ig) !== -1) {
        var SCRATCH = new File(new Folder($.getenv('TEMP')).fsName + '/http.log');
    }
    else {
        var SCARATCH = new File('/tmp/http_jsx.log');
    }

    var api = {};
    
    function buildPost(data, files) {
        var POST;
        var content = '';
        var pos = 0;
        var boundary = '------------------------------' + Date.now();
        
        _.each(data, function(value, key) {
            content += '--' + boundary + '\n';
            content += 'Content-Disposition: form-data; name="' + key + '";\r\n';
            content += 'Content-Type: text/plain\r\n\r\n';
            content += value + '\n';
        });
    
        if (files) {
            content += buildFiles(files, boundary);
        }

        if (content.length) {
            content += '--' + boundary + '--\n';
        }

        POST = 'Content-Type: multipart/form-data; boundary=' + boundary + '\r\n\r\n';
        POST += content;
        
        return [POST, content.length];
    }

    function buildFiles(files, boundary) {
        var content = '';
        _.each(files, function(item) {
            var file = new File(item.file);
            var name = item.name || 'file';
            var ext = file.fsName.substr(file.fsName.length - 4).toLowerCase();
            var mime = MIME_TYPES[ext];
            file.open('r');
            file.encoding = 'BINARY';
            data = file.read();
            file.close();
            
            content += '--' + boundary + '\n';
            content += 'Content-Disposition: form-data; name="' + name + '"; filename="' + file.name + '"\r\n';
            content += 'Content-Type: ' + mime + '\r\n\r\n';
            content += data + '\n';
        });
    
        return content;
    }
    
    var Response = function(string) {
        this.status_code = 0;
        this.headers = [];
        this.content = '';
        this.length = 0;
        this.json = null;
        
        this.string = string;
        var lines = string.split('\r\n');
        
        parseHTTP = function(lines) {
            var l = lines.shift().split(' ');
            return l[1];
        }
        readHeaders = function(string) {
            var data = {};
            
            for (var i=0; i<lines.length; i++) {
                var line = lines[i];                
                var parts = line.split(':');
                if (parts.length > 1) {
                    if (parts[0] == 'Date') {
                        parts.shift();
                        data['Date'] = new Date(Date.parse(parts.join(':')));
                    }
                    else {
                        data[parts[0].trim()] = parts[1].trim();
                    }
                }
                else {
                    break;
                }
            }
            
            return [data, i];
        }

        this.status_code = parseHTTP(lines);
        var headers = readHeaders(lines);
        this.headers = headers[0];
        var endHeader = headers[1];
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'text/plain';
        }
        this.content = lines.slice(endHeader).join('\r');
        this.length = (this.headers['Content-Length']) ? parseInt(this.headers['Content-Length'], 16) : this.content.length;
        if (this.headers['Content-Type'] == 'application/json' && JSON) {
            try {
                this.json = JSON.parse(this.content);
            } catch (e) {alert(e);}
        }
    }

    var Request = function(options) {
        var self = this;
        var options = options || {};
        var args = {
            url: '127.0.0.1',
            port: 80,
            method: 'GET',
            data: {},
            files: [],
            onSuccess: function(response){},
            onUpdate: function(){},
            onError: function(){},
            onFail: function(){}
        };
        this.options = _.defaults(options, args);
        
        this.send = function() {
            var pos = 0;
            var data = toQueryString(self.options.data);
            var tcp = new Socket();
            var url = this.options.url;
            var host;
            if (url.substr(0,7) == "http://") {
                url = url.substr(7);
            }
            if (url.indexOf('/') === -1) {
                host = url;
            }
            else {
                host = url.slice(0, url.indexOf('/'))
            }

            if (host.indexOf(':') !== -1) {
                var parts = host.split(':');
                host = parts[0];
                self.options.port = parts[1];
            }
            
                
            var res = tcp.open(host + ':' + self.options.port, "BINARY");
            if (res) {
                self.options.method = self.options.method.toUpperCase();
                var request = self.options.method + ' ';
                if(url.indexOf("/") < 0){
                    request += "/";
                }
                else{
                    request += url.substr(url.indexOf("/"));
                }
                if (data) {
                    request += '?' + data;
                }
                request += ' HTTP/1.1\n';
                request += 'User-Agent: Photoshop\n';
                request += 'Host: 127.0.0.1\n';

                switch(self.options.method) {
                    case 'POST':
                    case 'PUT':
                        var postcontent = buildPost(self.options.data, self.options.files);
                        request += 'Content-length: ' + postcontent[1] + '\n';
                        request += postcontent[0];
                        break;
                }
                request += '\r\n';
                SCRATCH.open('w');
                while (pos < request.length) {
                    tcp.write(request.substr(pos, 1024));
                    SCRATCH.write(request.substr(pos, 1024));
                    pos += 1024;
                    this.options.onUpdate(pos, request.length);
                }
                SCRATCH.close();
                SCRATCH.remove();
                
                var lines = '';
                while (!tcp.eof) {
                    lines += tcp.read(1024);
                }
                var res = new Response(lines);
                if (res.status_code < ResponseCode.CLIENT_ERROR && res.status_code >== ResponseCode.SUCCESS) {
                    self.options.onSuccess(res);
                }
                else if (res.status_code === ResponseCode.SERVER_ERROR) {
                    self.options.onError(res);
                }
                else {
                    self.options.onFail(res);
                }
            }
            else {
                throw new Error("Could not open connection to: " + host + ':' + self.options.port);
            }
        }
    }

    function toQueryString(object, base){
        var queryString = [];
        for (var key in object) {
            var value = object[key];
            if (base) key = base + '[' + key + ']';
            var result;
            switch (typeof(value)){
                case 'object': result = toQueryString(value, key); break;
                case 'array':
                    var qs = {};
                    value.each(function(val, i){
                        qs[i] = val;
                    });
                    result = toQueryString(qs, key);
                    break;
                default: result = key + '=' + encodeURIComponent(value);
            }
            if (value != null) queryString.push(result);
        }

        return queryString.join('&');
    }

    var $http = {
        Request: Request,
        get: function(url) {
            return new Request({url: url}).send();
        },
        post: function(url, data, files) {
            return new Request({
                url: url,
                data: data || {},
                files: files || {},
                method: 'POST'
            }).send();
        },
        put: function(url, data, files) {
            return new Request({
                url: url,
                data: data || {},
                files: files || {},
                method: 'PUT'
            }).send();
        }
    }

    exports = module.exports = {$http: $http};
})();

