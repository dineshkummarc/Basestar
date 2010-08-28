var genji = require("./lib/genji/lib/genji");

var http = require('http');

var server = http.createServer(function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html" })
  res.end('Please check the <a href="http://nodeknockout.com/teams/fewtter">team page</a> for more info about this project!');
});

server.listen(80);