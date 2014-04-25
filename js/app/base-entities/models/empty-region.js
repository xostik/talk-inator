define(['backbone'], function( Backbone ){
    var EmptyRegion = Backbone.Model.extend({}),
        er = new EmptyRegion();

    return {
        getModel: function () {
            return er;
        }
    };
});

