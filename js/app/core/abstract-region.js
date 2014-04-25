define(['backbone', 'aspic'], function(Backbone){
    var AbstractRegion = Backbone.AspicView.extend({
        destroy: function(){
            throw 'AbstractRegion: Not implemented destroy() in Region view';
        },
        render: function(){
            throw 'AbstractRegion: Not implemented render() in Region view';
        }
    });

    AbstractRegion.prototype.regionName = 'abstract-region';

    // --------------------

    return AbstractRegion;
});