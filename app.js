// Main application module

function hello(handler) {
    handler.sendHTML("Hello world!");
}

module.exports = [
    ["^/hello/$", hello, "get"]
];