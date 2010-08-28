
(function($) {
    // global namespace to hold all the objects
    $.ft = {};
    
    function _panel(label) {
        return {
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
        };
    }

    function buildLayout() {
        uki(
        {   // create the main layout
            view: 'HSplitPane',
            rect: '1000 600',
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
                topChildViews: [_panel('Project browser')],
                bottomChildViews: [_panel('Code Navigator')]
            }],
            // code editor and info window like console, monitor etc.
            rightChildViews: [
            {
                view: 'VSplitPane',
                rect: '693 1200',
                anchors: 'left top right bottom',
                vertical: true,
                handlePosition: 900
            }
            ]
        }).attachTo( window, '1000 600' );
    }

    // export functions
    $.ft.buildLayout = buildLayout;
})(jQuery);

