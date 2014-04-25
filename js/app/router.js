define(['backbone', 'routes'], function (Backbone, routes) {
    var Router = Backbone.Router.extend({
            routes: routes.backboneRoutes,
            appNavigate: function (newStateName, params) {
                var urlPath;
                params = params || {};

                urlPath = buildUrlByParams(newStateName, params);

                this.navigate(urlPath, { trigger: true });
            }
        }),
        router = new Router();

    // ----------------------------

    function start(newStateName, params) {
        if (newStateName === undefined) {
            Backbone.history.start({ pushState: true });
        } else {
            Backbone.history.start({ pushState: true, silent: true });
            router.appNavigate(newStateName, params);
        }
        
    }

    // ----------------------------

    function getRouter(){
        return router;
    }
    
    // ----------------------------

    function buildUrlByParams(routName, params) {
        var path = routes.list[routName].path,
            separatedPath = separateOptionalAndOtherPaths(path),
            result = fillPattern(separatedPath.requiredPath, params, {}),
            hasChanges = {val:false},
            optionalPath;
        for (var i = 0, ii = separatedPath.optionalPaths.length; i < ii; i++) {
            hasChanges.val = false;
            optionalPath = fillPattern(separatedPath.optionalPaths[i], params, hasChanges);
            if (!hasChanges.val) {
                optionalPath = '';
            }
            result = result.replace('<%optional-' + i + '%>', optionalPath);
        }
        return result;
    }

    function separateOptionalAndOtherPaths(path) {
        var result = {
                requiredPath: undefined,
                optionalPaths:[]
            };
        result.requiredPath = path.replace(/\(([^\)]+)\)/g, function (replacedS, innerS) {
            result.optionalPaths.push(innerS);
            return '<%optional-' + (result.optionalPaths.length - 1) + '%>';
        });
        
        return result;
    }
    
    function fillPattern(pattern, params, hasChanges) {
        var result = pattern;
        for (var k in params) {
            result = result.replace(new RegExp('[\\*\\:]' + k), function () {
                hasChanges.val = true;
                return params[k];
            });
        }

        return result;
    }
    
    // ----------------------------

    return {
        getRouter: getRouter,
        start: start,
        buildUrlByParams: buildUrlByParams
    };
});