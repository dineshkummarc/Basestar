
(function($) {
    var views = {
        'topToolbar': {
            id: 'topToolbar',
            view: 'Box',
            background: 'theme(panel)',
            rect: '0 0 1000 59',
            anchors: 'top left right',
            childViews: [{
                id: 'btnNewProject',
                view: 'Button',
                rect: '700 16 100 24',
                anchors: 'top right',
                text: '+ New project'
            }, {
                id: 'btnVote',
                view: 'Box', src:'http://nodeknockout.com/images/voteko.png',
                anchors: 'top right',
                rect: '860 -3 126 63'
            }]
        }
    };

    function _panel(id, label, options) {
        options = options || {};
        //var rect =
        return {
            view: 'Box',
            rect: options.rect || '300 400',
            anchors: options.anchors || 'top left right bottom',
//            style: {border: '1px solid #00ff00'},
            childViews: [{   
                view: 'Box',
                background: 'theme(panel)',
                rect: '300 24',
                anchors: 'left top right',
                style: {
                        width: '100%'
                },
                childViews: [{
                    view: 'Label',
                    rect: '0 0 200 24',
                    anchors: 'left top right bottom',
                    text: label,
                    style: {
                        textAlign: 'center',
                        width: '100%',
                        fontWeight: 'bold'
                    }
                }]
            },
            {
                id: id,
                view: 'Box',
                rect: options.rect ? (function(rect) {
                    rect = rect.split(' ');
                    return [0, 25, rect[2], rect[3] - 25].join(' ');
                })(options.rect): '0 25 300 375',
                anchors: 'top left right bottom',
                style: {
//                    border: '1px dotted #ff0000',
                    width: '100%',
                    overflow: 'auto'
                }
            }
            ]
        };
    }

    function _editor(id, label, options) {
       options = options || {};
        //var rect =
        return {
            view: 'Box',
            rect: options.rect || '300 400',
            anchors: options.anchors || 'top left right bottom',
//            style: {border: '1px solid #00ff00'},
            childViews: [{
                view: 'Box',
                background: 'theme(panel)',
                rect: '300 24',
                anchors: 'left top right',
                style: {
                        width: '100%'
                },
                childViews: [{
                    view: 'Label',
                    rect: '0 0 200 24',
                    anchors: 'left top right bottom',
                    text: label,
                    style: {
                        textAlign: 'center',
                        width: '100%',
                        fontWeight: 'bold'
                    }
                }]
            },
            {
                id: id,
                view: 'Box',
                rect: options.rect ? (function(rect) {
                    rect = rect.split(' ');
                    return [0, 25, rect[2], rect[3] - 25].join(' ');
                })(options.rect): '0 25 300 375',
                anchors: 'top left right bottom',
                style: {
//                    border: '1px dotted #ff0000',
                        width: '100%',
                    overflow: 'auto'
                }
            }
            ]
        };
    }

    // global namespace to hold all the objects

    $.ft = {
        buildLayout: function () {
            uki({   // create the main layout
                id: 'mainContainer',
                view: 'Box',
                rect: '1000 600',
                anchors: 'left top right bottom',
                minSize: '800 0',
                childViews: [
                views.topToolbar,
                {
                    view: 'HSplitPane',
                    rect: '0 60 1000 600',
                    anchors: 'left top right bottom',
                    handlePosition: 300,
                    leftMin: 200,
                    rightMin: 300,
                    // project browser and code navigator
                    leftChildViews: [{
                        view: 'VSplitPane',
                        rect: '300 600',
                        anchors: 'left top right bottom',
                        handlePosition: 400,
                        minSize: "200 300",
                        vertical: true,
                        topPane: _panel('panelProject', 'Project browser'),
                        bottomPane: _panel('panelNavigator', 'Code Navigator')
                    }],
                    // code editor and info window like console, monitor etc.
                    rightChildViews: [{
                        view: 'VSplitPane',
                        rect: '700 700',
                        anchors: 'left top right bottom',
//                        style: {border: '1px dashed blue'},
                        vertical: true,
                        handlePosition: 500,
                        minSize: "400 300",
                        topPane: _editor('codeEditor', 'Editor', {rect:'0 0 700 500'}),
                        bottomPane: _panel('panelConsole', 'Console',
                            {rect:'0 0 700 200'})
                    }]
                }]
            }).attachTo( window, '1000 600');
            // popup for buttons
            uki({id:'ppNewProject', view: 'Popup', rect: '0 20 240 120', anchors: 'right top', relativeTo: uki('#btnNewProject')[0]
                , childViews: [
                    {view: 'Label',    rect: '10 10 50 24', anchors: 'left top', html: 'Name:'},
                    {id:'inputProjectName', view: 'TextField',rect: '60 10 170 24', anchors: 'left top', value: "", placeholder: 'of your project'},
                    {view: 'Label',    rect: '10 50 50 24', anchors: 'left top', html: 'Url:'},
                    {id:'inputProjectUrl', view: 'TextField',rect: '60 50 170 24', anchors: 'left top', value: "", placeholder: 'of your GIT repository'},
                    {id:'btnGitClone', view: 'Button', rect: '160 86 70 24', anchors: 'right bottom', text: "Clone"},
                ]
            }).hide();
        }
    }
})(jQuery);

