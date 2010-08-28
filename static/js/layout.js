
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
                rect: '800 16 100 24',
                anchors: 'top right',
                text: '+ New project'
            }]
        }
    };
    
    function _panel(id, label, options) {
        options = options || {};
        return {
            view: 'Box',
            rect: options.rect || '300 400',
            anchors: options.anchors || 'top left right',
            childViews: [{   
                view: 'Box',
                background: 'theme(panel)',
                rect: '300 24',
                anchors: 'top left right',
                childViews: [{
                    view: 'Label',
                    rect: '50 0 200 24',
                    anchors: 'left top right bottom',
                    text: label,
                    style: {
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }
                }]
            },
            {
                id: id,
                view: 'Box',
                rect: '0 25 300 375',
                anchors: 'top left right bottom',
                style: {
                    border: '1px solid #ccc'
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
                //minSize: '800 0',
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
                        vertical: true,
                        topChildViews: [_panel('panelProject', 'Project browser')],
                        bottomChildViews: [_panel('panelNavigator', 'Code Navigator')]
                    }],
                    // code editor and info window like console, monitor etc.
                    rightChildViews: [{
                        view: 'VSplitPane',
                        rect: '0 0 700 600',
                        anchors: 'left top right',
                        vertical: true,
                        handlePosition: 500
                    }]
                }]
            }).attachTo( window, '1000 600' , {
                minSize: '800 0'
            });
        },

        dialog: function (id, title) {
            uki(_panel(id, title)).attachTo(window, '200 200 1000 600');
        }
    }
})(jQuery);

