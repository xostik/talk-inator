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
                indexByPid: {},
                handlers: {
                    onAddComment: $.Callbacks()
                }
            });
        },

        addComment: function(comment){
            var parent = comment.parent();
                childList;
            if(parent){
                childList = this.indexByPid[parent.id()]
                if(!childList){
                    childList = [];
                    this.indexByPid[parent.id()] = childList;
                }
                childList.push(comment);
            }else{
                firstLevel.add(comment);
            }

            this.indexById()[comment.id()] = comment;

            count++;

            this.handlers.onAddComment(comment);
        }
    });

    return CommentsTree;
});