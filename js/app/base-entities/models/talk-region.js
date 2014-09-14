/*
 *
 * talk-region = {
 *   post
 *   vk:{
 *       talk-loader
 *       comment-tree
 *       is-active
 *   }
 *   talkinator: {
 *       talk-loader
 *       comment-tree
 *       is-active
 *   }
 *   active: vk
 * }
 *
 * */

 define(['underscore', 'jquery', 'backbone', 'vk-talk-loader', 'post', 'aspic'], function( _, $, Backbone, vkTalkLoader, Post ){
    var TalkRegion = Backbone.AspicModel.extend({
        initialize: function () {
            var talkPath = {talkPath: this.talkPath()};
            this.set({
                vk: {
                    talkLoader: new vkTalkLoader(talkPath)
                }
            });

            this.vk().users = this.vk().talkLoader.userCache();
            this.vk().comments = this.vk().talkLoader.comments();

            this._initHandlers();
        },

        _initHandlers: function(){
            // перекидываем события из составных моделей в эту модель
            this.listenTo( this.vk().talkLoader, 'postIsReady', function(post){
                    this.trigger('postIsReady', post);
            });
            this.listenTo( this.vk().comments, 'commentIsAdd', function(comment){
                this.trigger('vkCommentIsReady', comment);
            });
        },

        _postReady: function(post){
            this.vk().post = post;
        },

        _commentsListReady: function(commentsList){
            this.vk().post = post;
        },

        isAllVkCommentsReady: function(){
            var deferred = this.vk().talkLoader.handlers().onAllCommentsReady;
            return deferred.state() == 'resolved';
        },

        currentUser: function(){
            return this.vk().talkLoader.user();
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