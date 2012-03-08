(function() {
    var JSON = require('JSON');
    
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

    var api = {};
    
    var Response = function(string) {
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

        this.STATUS = parseHTTP(lines);
        var headers = readHeaders(lines);
        this.HEADERS = headers[0];
        var endHeader = headers[1];
        if (!this.HEADERS['Content-Type']) {
            this.HEADERS['Content-Type'] = 'text/plain';
        }
        this.responseText = lines.slice(endHeader).join('\r');
        this.length = (this.HEADERS['Content-Length']) ? parseInt(this.HEADERS['Content-Length'], 16) : this.responseText.length;
        if (this.HEADERS['Content-Type'] == 'application/json' && JSON) {
            try {
                this.json = JSON.decode(this.responseText);
            } catch (e) {alert(e);}
        }
    }

    
    var Request = function(options) {
        var options = options || {};
        var args = {
            url: '127.0.0.1',
            port: 80,
            method: 'GET',
            data: new Object(),
            onSuccess: function(){},
            onError: function(){},
            onFail: function(){}
        };
        for (attrname in options) { args[attrname] = options[attrname]; }
        this.options = args;
        
        this.send = function(query) {
            var data = (query) ? query : toQueryString(this.options.data);
            var tcp = new Socket();
            var url = this.options.url;
            if (url.substr(0,7) == "http://") {
                url = url.substr(7);
            }
            var res = tcp.open(url.slice(0, url.indexOf('/')) + ':' + this.options.port, "BINARY");
            if (res) {
                var request = this.options.method.toUpperCase() + ' ';
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
                request += 'Host: 127.0.0.1\n';
                request += 'Connection: close\n';
                request += '\r\n';
                tcp.write(request);
                var lines = '';
                while (!tcp.eof) {
                    lines += tcp.read(1024);
                }
                var res = new Response(lines);
                if (res.STATUS <= ResponseCode.CLIENT_ERROR) {
                    this.options.onSuccess(res);
                }
                else if (res.STATUS === ResponseCode.SERVER_ERROR) {
                    this.options.onError(res);
                }
                else {
                    this.options.onFail(res);
                }
            }
            else {
                throw new Error("Could not open connection to: " + url.slice(0, url.indexOf('/')) + ':' + this.options.port);
            }
        }
        this.get = this.GET = function(query) {
            query = query || this.options.data;
            var data = toQueryString(query);
            this.options.method = 'get';
            this.send(data);
        }
        this.post = this.POST = function(query) {
            query = query || this.options.data;
            var data = toQueryString(query);
            this.options.method = 'post';
            this.send(data);
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

    exports = module.exports = {Request: Request, Reponse: Response};
})();

