;
(function($) {
    $.ft.init = function() {
        // build the main layout
        $.ft.buildLayout();
        
        // build the file browser
        $('#panelProject').fileTree({
            root: '/',
            script: '/api/filetree/'
        }, function(file) {
            $.ajax({
                url: '/api/getCode/-' + file,
                type: 'get',
                success: function (data) {
                    editor.setCode(data.code);
                }
            });
        });
        // action for buttons
        $('#btnNewProject').click(function() {
            // toggle the `new project` panel
            uki('#ppNewProject')[0].toggle();
        });
        // tell server to clone the project
        uki('#btnGitClone').click(function() {
            $.ajax({
                url: '/api/git/clone/',
                type: 'post',
                data: {
                    url: uki('#inputProjectUrl').value(),
                    name: uki('#inputProjectName').value()
                },
                success: function(data, status) {
                    log(data);
                }
            });
        });
        $('#btnVote').append('<a href="http://nodeknockout.com/teams/fewtter" target="nko" title="Help me win Node.js KO!"><img style="position: fixed; border: 0px;" src="http://nodeknockout.com/images/voteko.png" alt="Help me win Node.js KO!" /></a>');
          

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