define(['underscore', 'backbone', 'aspic'], function( _, Backbone ){

    /*
     *   new AbstractComment({originalPostObject:...})
     *
     * */

    var Post = Backbone.AspicModel.extend({
        defaults:{
            copy_history: []
        },

        initialize: function (attr, params) {
            var userProvider = params.userProvider,
                uid = this.get('owner_id'),
                user = userProvider.getUser(uid);

            this.set('user', user);
            this.set('userProvider', userProvider);

            if(!this.attachments){
                this.set('attachments', -1);
            }
        }
    })

    return Post;
});