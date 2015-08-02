define(['abstract-region', 'underscore', requirePaths['start-region.tpl'], 'router'], function(Region, _, tpl, router){
    var StartRegion = Region.extend({

        id: 'start-region-wrap',

        template: _.template(tpl),

        events:{
            'submit': 'goOnTalk'
        },

        goOnTalk: function(e){
            e.preventDefault();

            var $talkPath = this.$el.find('.talk-path'),
                talkUrl = $talkPath.eq(0).val() || $talkPath.eq(1).val(),
                talkPath = this.findPathInUrl(talkUrl);

            if(talkPath){
                router.getRouter().appNavigate('talk', {talkPath: talkPath});
            }else{
                alert('хмм.. Чет неправильная ссылка..');
            }
        },

        findPathInUrl: function(talkUrl){
            if(talkUrl.indexOf('vk.com/') !== -1){
                var result = /w=wall([-\d]+_[-\d]+)/.exec(talkUrl);
                if(result.length <2){
                    return false;
                }else{
                    return result[1];
                }
            }else{
                return false;
            }
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

    StartRegion.prototype.regionName = 'start-region';

    return StartRegion;
});

