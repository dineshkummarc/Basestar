
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
            anchors: 'top left right bottom',
            childViews: [{   
                view: 'Box',
                background: 'theme(panel)',
                rect: options.labelRect || '300 24',
                anchors: 'top left right',
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
                rect: options.containerRect || '0 25 300 375',
                anchors: 'top left right bottom',
                style: {
                    border: '1px solid #ccc',
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
                        vertical: true,
                        topPane: _panel('panelProject', 'Project browser'),
                        bottomPane: _panel('panelNavigator', 'Code Navigator')
                    }],
                    // code editor and info window like console, monitor etc.
                    rightChildViews: [{
                        view: 'Box',
                        rect: '0 0 700 700',
                        anchors: 'left top right bottom',
                        vertical: true,
                        handlePosition: 600,
                        childViews: [_panel('panelConsole', 'Console', 
                            {rect:'0 600 300 200', labelRect: '698 24', containerRect: '1 25 698 120'})]
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
        },

        dialog: function (id, title) {
            uki(_panel(id, title)).attachTo(window, '200 200 1000 600');
        }
    }
})(jQuery);

