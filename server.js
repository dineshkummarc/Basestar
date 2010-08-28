var Path = require('path');

// basic settings
var settings = {
    libPath: ["/lib/genji/lib", "/lib", "/lib/node-git/lib"]
    ,staticUrl: 'http://fewtter.no.de/static/'
    ,env: {type: 'production', root: __dirname, level: 1}
    ,servers: [
        {host: '8.19.40.199', port: 80}
    ]
    ,git: '/opt/local/bin/git'
    ,workspace: "./workspace"
    ,middlewares: [
        {name:'response-time'},
        {name: 'error-handler'},
        {name:'logger'},
        {name:'conditional-get'},
        {name: 'router', conf: {handler: 'genji.web.handler.SimpleCookieHandler', urls: './app'}}
    ]
};

// try to merge with local settings defined in ./config.js
try {
    var local_settings = require('./config');
    for (var key in local_settings) {
        settings[key] = local_settings[key];
    }
} catch(e) {
    require('sys').puts(e);
}

// push dependencies into require path
settings.libPath.forEach(function(path) {
    require.paths.unshift(Path.join(__dirname, path));
});

// load `genji` and start server
var genji = require("genji");
genji.util.manager.startServer(settings);
