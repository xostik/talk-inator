define(['abstract-region', 'underscore', requirePaths['footer-region.tpl'], 'router'], function(Region, _, tpl, router){
    var FooterRegion = Region.extend({
        tagName: 'footer',

        id: 'footer',

        template: _.template(tpl),

        events:{
            
        },

        initialize: function(){

        },

        destroy: function(){
            this.$el.off();
        },

        render: function(){
            this.$el.html(this.template({}));
            return this.$el;
        }
    });

    FooterRegion.prototype.regionName = 'footer-region';

    return FooterRegion;
});

