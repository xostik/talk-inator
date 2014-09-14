define(['jquery', 'backbone', 'aspic'], function( $, Backbone ){

    /*
     *   new AbstractComment({
     *       originalCommentObject:...,
     *       parent: AbstractComment_Instance
     *   })
     *
     * */

    var CommentsTree = Backbone.AspicModel.extend({

        initialize: function () {
            this.set({
                /*
                 id, from_id, date, text
                 **/
                count: 0,
                firstLevel: new Backbone.Collection(),
                indexById: {},
                indexByPid: {}
            });
        },

        addComment: function(comment){
            if(this.isExist(comment.id)){
                throw 'CommentsTree: trying to add existing comment';
            }

            var parent = comment.parent(),
                childList;
            if(parent){
                childList = this.indexByPid[parent.id]
                if(!childList){
                    childList = [];
                    this.indexByPid[parent.id] = childList;
                }
                childList.push(comment);
            }else{
                this.firstLevel().add(comment);
            }

            this.indexById()[comment.id] = comment;

            this.count(this.count() + 1);

            this.trigger('commentIsAdd', comment);
        },

        updateComment: function(id, obj){
            this.indexById()[id].set(obj);
        },

        getById: function(id){
            return this.indexById()[id];
        },

        parentFor: function(id){
            return this.indexByPid()[id];
        },

        isExist: function(id){
            return !! this.indexById()[id];
        }
    });

    return CommentsTree;
});