;
(function($) {
    $.ft.evt = $({});

    $.ft.buildFileTree = function() {
        $('#panelProject').fileTree({
            root: '/',
            script: '/api/filetree/'
        }, function(file) {
            $.ajax({
                url: '/api/getCode/-' + file,
                type: 'get',
                success: function (data) {
                    $.ft.createEditor(file, data.code);
                }
            });
        });
    }

    $.ft.init = function() {
        // build the main layout
        $.ft.buildLayout();
        // build the file browser
        $.ft.buildFileTree();
        // save editors in an object
        $.ft.editors = {};
        /* action for buttons */
        $('#btnNewProject').click(function() {
            // toggle the `new project` panel
            uki('#ppNewProject')[0].toggle();
        });
        // tell server to clone the project
        uki('#btnGitClone').click(function() {
            $.ft.socket.send({type: 'cmd', data: {
                    cmd: 'gitClone',
                    url: uki('#inputProjectUrl').value(),
                    name: uki('#inputProjectName').value()
            }});
        });
        $('#btnVote').append('<a href="http://nodeknockout.com/teams/fewtter" target="nko" title="Help me win Node.js KO!"><img style="position: fixed; border: 0px;" src="http://nodeknockout.com/images/voteko.png" alt="Help me win Node.js KO!" /></a>');

        // save file to server
        uki('#btnSave').click(function() {
            var filename = $.ft.currentFile;
            if (filename) {
                $.ft.socket.send({type:'cmd',
                    data: {cmd: 'saveFile', filename: $.ft.currentFile, content: $.ft.editors[filename].editor.getCode()}});
            } else {
                $.ft.log("Please open a file first");
            }
        });

        // run script with node
        uki('#btnRun').click(function() {
            var filename = $.ft.currentFile;
            if (filename) {
                    $.ft.socket.send({type:'cmd',
                        data: {cmd: 'node', filename: $.ft.currentFile}});
            } else {
                $.ft.log("Please open a file first");
            }
        });

        // setup socket.io
        io.setPath('/static/js/socket.io/');
        var socket = new io.Socket(null, {
            transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling']
        });
        socket.connect();
        socket.on('message', function(msg) {
            if (msg.type == 'msg') {
               msg.data.forEach(function(m) {
                   $.ft.log(m);
               })
            }
            if (msg.type == 'event') {
               $.ft.evt.trigger(msg.name, msg.data);
            }
        });
        $.ft.socket = socket;

        // handle events emitted from server
        $.ft.evt.bind('newProjectCreated', function() {
            // refresh the file browser
            $.ft.buildFileTree();
        });
    
        // handle global ajax error
        
        $.ajax({
            ajaxError: function(xhr, status) {
                $.ft.log("error: " + status);
            }
        });
    }

    $.ft.createEditor = function(filename, code) {
        var editors = $.ft.editors;
        $.ft.currentFile = filename;
        uki('#codeEditorLabel').text('Editor ' + filename);
        if (filename in editors) {
            editors[filename].editor.setCode(code);
        } else {
            var wrapper = $.ft.createEditorWrapper(filename);
           //  create code editor
            wrapper.attachTo(document.getElementById('codeEditor'));
            var editor = new CodeMirror(wrapper.dom(), {
                height: "98%",
                width: '99%',
                content: code,
                parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
                stylesheet: ["static/js/codemirror/css/jscolors.css"],
                path: "static/js/codemirror/js/",
                autoMatchParens: true
            });
            editors[filename] = wrapper.dom();
            editors[filename].editor = editor;
        }
        // show current and hide others
        for (var e in editors) {
            e == filename ? $(editors[e]).css('visibility', 'visible') : $(editors[e]).css('visibility', 'hidden');
        }
    }

    $.ft.log = function(data) {
        $('#panelConsole').prepend('<p>' + data + '</p>');
    }

})(jQuery);