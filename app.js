// Main application module


// Dependencies and settings
var Path = require("path"),
FileHandler = genji.web.handler.FileHandler,
staticRoot = Path.join(__dirname, "/static"),
viewRoot = Path.join(__dirname, "/view"),
nun = require("nun");

/* http endpoint */

function index(handler) {
    var ctx = {
        staticUrl: genji.settings.staticUrl
    }
    _render("/index.xhtml", ctx, function(html) {
        handler.sendHTML(html);
    })
}

// serve static file under ./static
function staticFile(handler, filepath) {
    handler.setRoot(staticRoot);
    handler.staticFile(filepath);
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

module.exports = [
    ["^/$", index, "get"],
    [FileHandler, "^/static/(.*)$", staticFile, "get"]
];