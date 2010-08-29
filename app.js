// Main application module


// Dependencies and settings
var Path = require("path"),
fs = require("fs"),
FileHandler = genji.web.handler.FileHandler,
staticRoot = Path.join(__dirname, "/static"),
viewRoot = Path.join(__dirname, "/view"),
nun = require("nun"),
chain = genji.pattern.control.chain,
workspace = genji.settings.workspace,
parseQuery = require("querystring").parse,
EventEmitter = require("events").EventEmitter
emitter = new EventEmitter;

/* http endpoint */

function index(handler) {
    var ctx = {
        staticUrl: genji.settings.staticUrl
    }
    _render("/index.xhtml", ctx, function(html) {
        handler.sendHTML(html);
    })
}

function filetree(handler) {
    if (genji.emitter)
        genji.emitter.emit('message', 'file tree called');
    handler.on('end', function(data) {
        var dir = parseQuery(data).dir;
        if (dir) {
            var fullDir = Path.join(workspace, dir);
            fs.stat(fullDir, function(err, stats) {
                if (err) {
                    handler.error(500, err.toString());
                    return;
                }
                if (stats.isDirectory()) {
                    var results = ['<ul class="jqueryFileTree" style="display: none;">'];
                    fs.readdir(fullDir, function(err, files) {
                        if (err) {
                            handler.error(500, err.toString());
                            return;
                        }
                        if (files.length == 0) {
                            results.push('</ul>');
                            handler.send(results.join(''));
                            return;
                        }
                        chain(files, function(file, idx, arr, next) {
                            var f = Path.join(fullDir, file);
                            fs.stat(f, function(err, stats) {
                                if (err) {
                                    handler.error(500, err.toString());
                                    return;
                                }
                                if (file[0] != '.') {
                                    var relativePath = Path.join(dir, file);
                                    if (stats.isDirectory()) {
                                        results.push('<li class="directory collapsed"><a href="#" rel="'+relativePath+'/">'+file+'</a></li>');
                                    }
                                    if (stats.isFile()) {
                                        var ext = Path.extname(file).slice(1);
                                        results.push('<li class="file ext_'+ext+'"><a href="#" rel="'+relativePath+'">'+file+'</a></li>');
                                    }
                                }
                               next();
                               if (idx == files.length) {
                                   results.push('</ul>');
                                   handler.send(results.join(""));
                               }
                            });
                        })();
                    });
                } else {
                    handler.error(500, params.dir + " not a directory");
                }
            })
        } else {
            handler.error(404, "");
        }
    });
}

// serve static file under ./static
function staticFile(handler, filepath) {
    handler.setRoot(staticRoot);
    handler.staticFile(filepath);
}

/* Restful json api */

function gitClone(handler) {
    handler.on('end', function (data) {
        var params = parseQuery(data);
        if (!params.url || !params.name) {
            handler.send("Your must provide both url and name. Your input:\n" + JSON.stringify(params));
        } else {
            handler.sendHeaders(200, {'Content-Type': 'text/plain'});
            _gitClone(params.url, params.name, function(stdout, stderr) {
                if (stdout || stderr) {
                    handler.response.write((stdout || stderr) + "<br />");
                } else {
                    handler.finish();
                }
            });
        }
    });
}

function message(handler) {
    handler.sendHeaders(200, {'Content-Type': 'text/plain'});
    setTimeout(function() {
        handler.finish(new Date + '');
    }, 1000);
}

function getCode(handler, filename) {
    if (filename) {
        fs.readFile(Path.join(workspace, filename), 'utf8', function(err, data) {
            if (err) throw err;
            handler.sendJSON({code: data.length > 0 ? data : ''});
        });
    }
}

/* private functions */

// render mustache template by nun
function _render(path, context, callback) {
    nun.render(Path.join(viewRoot, path), context, {compress: false, cache: true}, function(err, result) {
       if (err) {
            throw err;
        }
        var buffer = '';
        result.addListener('data', function (c) {
            buffer += c;
        }).addListener('end', function () {
            callback(buffer);
        });
    });
}

var exec  = require('child_process').exec,
spawn = require('child_process').spawn,
nodeExec = genji.settings.node,
gitExec = genji.settings.git;

function _exec(cmd, options, callback) {
    var exec = spawn(cmd, options);
    exec.stdout.on('data', function (data) {
        callback('' + data);
    });

    exec.stderr.on('data', function (data) {
        callback(null, '' + data);
    });

    exec.on('exit', function (code) {
        callback(null, null, code);
        console.log(cmd + ': child process exited with code ' + code);
    });
}

function _gitCommand(options, callback) {
    _exec(gitExec, options, callback);
}

function _gitClone(url, name, callback) {
   var dir = Path.join(workspace, name);
   _gitCommand(["clone", "--recursive", url, dir], callback);
}

function _saveFile(client, data) {
    var path = Path.join(workspace, data.filename);
    fs.writeFile(path, data.content, 'utf8', function(err) {
        if (err) {
            client.send({type:'msg', data:['Error, cannot save file: ', data.filename]});
        } else {
            client.send({type:'msg', data:[data.filename + ' saved!']});
            client.pub({type:'msg', data:['Someone saved file ' + data.filename]});
        }
    });
}

function _node(client, data) {
    if (!data.filename) {
        client.send({type:'msg', data: ["Your must provide the script name, try open a file first."]});
        return;
    }
    client.pub({type: 'msg', data: ['Someone just run script: ' + data.filename]});
    var path = Path.join(workspace, data.filename);
    var options = data.options || [];
    options.push(path);
   _exec(nodeExec, options, function(stdout, stderr, code) {
       var msg = stdout || stderr;
       msg && client.send({type: 'msg', data: [msg]});
       if (code !== undefined) {
          client.send({type: 'msg', data: ["script exited with: " + code]});
       }
   });
}

emitter.on("message", function(client, msg) {
    this.emit(msg.type, client, msg.data);
});

emitter.on("cmd", function(client, data) {
    if (data.cmd == 'gitClone') {
        if (data.url && data.name) {
            _gitClone(data.url, data.name, function(stdout, stderr, code) {
                var msg = stdout || stderr;
                msg && client.send({type: 'msg', data: [msg]});
                if (code === 0) {//cloned
                    // tell client to refresh project browser
                    var m = ["User " + client.sessionId, "cloned", data.url,"as project",data.name];
                    client.pub({type: 'msg', data:[m.join(" ")]})
                    // for others
                    client.pub({type:'event', name: 'newProjectCreated', data:[]});
                    // for youself
                    client.send({type:'event', name: 'newProjectCreated', data:[]});
                }
            });
        } else {
            client.send({type:'msg', data: ["Your must provide both url and name."]})
        }
    }
    if (data.cmd == 'saveFile') {
        _saveFile(client, data);
    }
    if (data.cmd == 'node') {
        _node(client, data);
    }
});

// message hub
process.nextTick(function() {
if ('io' in genji) {
    var buffer = [];
    genji.io.on('connection', function(client){
        // record history for broadcast
        var broadcast = function(msg) {
            if (msg.type == 'msg') {
                msg.data.push(new Date+'');
                buffer.push(msg);
            }
            if (buffer.length > 30) buffer.shift();
            client.broadcast(msg);
        }
        client.pub = broadcast;
        if (buffer.length > 0) {
            buffer.forEach(function(msg) {
                client.send(msg);
            })
        }
        broadcast({type: 'msg', data: [client.sessionId + ' connected']});
        client.on('message', function(msg) {
            emitter.emit("message", client, msg);
        });

        client.on('disconnect', function(){
            broadcast({type: 'msg', data: [client.sessionId + ' disconnected']});
        });
    });
}
});


module.exports = [
    ["^/$", index, "get"],
    ["^/api/git/clone/$", gitClone , "post"],
    ["^/api/filetree/$", filetree, "post"],
    ["^/api/message/$", message, "get"],
    ["^/api/getCode/-(.*)$", getCode, "get"],
    [FileHandler, "^/static/(.*)$", staticFile, "get"]
];