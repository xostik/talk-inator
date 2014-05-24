define(['underscore', 'backbone', 'abstract-comments'], function( _, Backbone, AbstractComment ){

    var VK_Comment = AbstractComment.extend({
        initialize: function () {
            var likesCount = this.likes().count;
            this.likes(likesCount);

            if(!this.attachments){
                this.set('attachments', -1);
            }

            var args = _.toArray(arguments);
            AbstractComment.prototype.initialize.apply(this, args);
        }
    })

    return VK_Comment;
});