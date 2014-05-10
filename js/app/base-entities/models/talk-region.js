define(['backbone', 'vk-talk-loader', 'aspic'], function( Backbone, vkTalkLoader ){
    var TalkRegion = Backbone.AspicModel.extend({
        initialize: function () {
            var talkPath = {talkPath: this.talkPath()};
            this.set({
                post: -1,
                vk: {
                    talkLoader: new vkTalkLoader(talkPath)
                },
                secret:  -1,
                sid:  -1,
                sig:  -1,
                isAuth: -1,
                changeStatusHandler: $.Callbacks()
            });
        }
    })

    return {
        getModel: function (talkPath) {
            return new TalkRegion({

            });
        }
    };
});