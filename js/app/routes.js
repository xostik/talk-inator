define(['underscore'], function(_){
    var routesList = {
            'talk': {
                path: ':talkPath',
                bootstrapState: 'talk'
            },
            'start': {
                path: '',
                bootstrapState: 'start'
            }
        },
        backboneRoutes = {},
        routInfo;

    for (var k in routesList) {
        routInfo = routesList[k];
        backboneRoutes[routInfo.path] = getRouteFunction(routInfo.bootstrapState);
    }

    function getRouteFunction(routeSource) {
        return function () {
            var bootstrapFunction = _.bind(function(run) {
                    run.apply(undefined, this);
                }, arguments);
            
            require([routeSource], bootstrapFunction);
        };
    }

    return {
        backboneRoutes: backboneRoutes,
        list: routesList
    };
});

