define(['backbone', 'aspic'], function( Backbone ){

    /*
    *   new AbstractComment({
    *       originalCommentObject:...,
    *       parent: AbstractComment_Instance
    *   })
    *
    * */

     var AbstractComment = Backbone.AspicModel.extend({

        initialize: function (paraps, parent) {
            this.set({
                /*
                id, from_id, date, text
                **/
                parent: parent,
                answers: new Backbone.Collection()
            });
        }
    })

    return AbstractComment;
});