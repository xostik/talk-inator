define(['underscore', 'jquery', 'backbone', 'vk-talk-loader', 'post', 'aspic'], function( _, $, Backbone, vkTalkLoader, Post ){
    var TalkRegion = Backbone.AspicModel.extend({
        initialize: function () {
            var talkPath = {talkPath: this.talkPath()};
            this.set({
                vk: {
                    talkLoader: new vkTalkLoader(talkPath)
                },

                handlers: {
                }
            });

            this.vk().users = this.vk().talkLoader.userCache();
            this.vk().comments = this.vk().talkLoader.comments();

            this.initHandlers();
        },

        initHandlers: function(){
            var postReady = _.bind(this._postReady, this),
                commentsListReady = _.bind(this._commentsListReady, this);
            this.onPostReady(postReady);
        },

        _postReady: function(post){
            this.vk().post = post;
        },

        _commentsListReady: function(commentsList){
            this.vk().post = post;
        },

        onPostReady: function(handler){
            var callbackObj = this.vk().talkLoader.handlers().onPostReady;
            callbackObj.add(handler);
        },

        isAllVkCommentsReady: function(){
            var deferred = this.vk().talkLoader.handlers().onAllCommentsReady;
            return deferred.state() == 'resolved';
        },

        onCommentReady: function(handler){
            this.vk().comments.onAddComment(handler);
        }
    });

    return {
        getModel: function (talkPath) {
            return new TalkRegion({
                talkPath: talkPath
            });
        }
    };
});