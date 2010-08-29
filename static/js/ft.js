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
                    $.ft.editor.setCode(data.code);
                }
            });
        });
    }

    $.ft.init = function() {
        // build the main layout
        $.ft.buildLayout();
        // build the file browser
        $.ft.buildFileTree();
        // action for buttons
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

//        uki('#btnSocketIO').click(function() {
//            $.ft.socket.send({type:'msg', data: ['Hello']});
//        });

        //  create code editor
        var editorWrapper = $('#codeEditor');
        var editor = new CodeMirror(editorWrapper[0], {
            height: "98%",
            width: '99%',
            parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
            stylesheet: "static/js/codemirror/css/jscolors.css",
            path: "static/js/codemirror/js/",
            autoMatchParens: true
        });
        $.ft.editor = editor;

        // setup socket.io
        io.setPath('/static/js/socket.io/');
        var socket = new io.Socket();
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

    $.ft.log = function(data) {
        $('#panelConsole').prepend('<p>' + data + '</p>');
    }

})(jQuery);