// Main application module


// Dependencies and settings
var Path = require("path"),
fs = require("fs"),
FileHandler = genji.web.handler.FileHandler,
staticRoot = Path.join(__dirname, "/static"),
viewRoot = Path.join(__dirname, "/view"),
nun = require("nun"),
chain = genji.pattern.control.chain,
workspace = Path.join(__dirname, genji.settings.workspace),
parseQuery = require("querystring").parse;

/* http endpoint */

function index(handler) {
    var ctx = {
        staticUrl: genji.settings.staticUrl
    }
    _render("/index.xhtml", ctx, function(html) {
        handler.sendHTML(html);
    })
}

function files(handler) {
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
        _gitClone(params.url, params.name, function(stdout, stderr) {
            handler.sendHTML([stdout, stderr].join("\n"));
        });
    });
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

var exec  = require('child_process').exec;
var spawn  = require('child_process').spawn;

function _gitClone(url, name, callback) {
    var dir = Path.join(workspace, name);
    var cmd = ["git", "clone", "--recursive", url, dir].join(" ");
    exec(cmd, function (err, stdout, stderr) {
        callback(stdout, stderr);
        if (err !== null) {
            console.log('exec error: ' + err);
        }
    });
}

module.exports = [
    ["^/$", index, "get"],
    ["^/api/git/clone/$", gitClone, "post"],
    ["^/api/files/$", files, "post"],
    [FileHandler, "^/static/(.*)$", staticFile, "get"]
];