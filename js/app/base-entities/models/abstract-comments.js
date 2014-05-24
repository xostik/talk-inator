define(['jquery', 'backbone', 'aspic'], function( $, Backbone ){

    /*
    *   new AbstractComment({
    *       originalCommentObject:...,
    *       parent: AbstractComment_Instance
    *   })
    *
    * */

     var AbstractComment = Backbone.AspicModel.extend({

        initialize: function (params, options) {
            var parent = options.parent || false;
            this.set({
                /*
                id, from_id, date, text
                **/
                user: options.user,
                parent: parent,
                answers: new Backbone.Collection()
            });

            if(parent){
                parent.answers().add(this);
            }
        },

         hasText: function(){
             return $.trim(this.text()) != '';
         }
     })

    return AbstractComment;
});