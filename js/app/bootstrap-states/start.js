define([
    'common-layout',
    'empty-region',
    'start-region-view',
    'header-region-view',
    'footer-region-view',
    'layout-manager'
], function(
    CommonLayout,
    emptyRegion,
    StartRegionView,
    HeaderRegionView,
    FooterRegionView,
    layoutManager
) {
    return function(){
        var layoutData = {
            layout: CommonLayout,
            regions: {
                'main-region': {
                    model: emptyRegion.getModel(),
                    view: StartRegionView
                },

                'header-region': {
                    model: emptyRegion.getModel(),
                    view: HeaderRegionView
                },

                'footer-region': {
                    model: emptyRegion.getModel(),
                    view: FooterRegionView
                }
            }
        };

        layoutManager.updateLayout(layoutData);
    };
});

