define([
    'common-layout',
    'talk-region',
    'talk-region-view',
    'empty-region',
    'header-region-view',
    'footer-region-view',
    'layout-manager'
], function(
    CommonLayout,
    talkRegion,
    TalkRegionView,
    emptyRegion,
    HeaderRegionView,
    FooterRegionView,
    layoutManager
    ) {
    return function(talkPath){
        var layoutData = {
            layout: CommonLayout,
            regions: {
                'main-region': {
                    model: talkRegion.getModel(talkPath),
                    view: TalkRegionView
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

