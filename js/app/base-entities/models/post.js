define(['underscore', 'backbone', 'aspic'], function( _, Backbone ){

    /*
     *   new AbstractComment({originalPostObject:...})
     *
     * */

    var Post = Backbone.AspicModel.extend({
        initialize: function (attr, params) {
            this.set('user', params.user);

            if(!this.attachments){
                this.set('attachments', -1);
            }
        }
    })

    return Post;
});