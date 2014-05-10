define(['underscore', 'backbone', 'abstract-comments'], function( _, Backbone, AbstractComment ){

    var VK_Comment = AbstractComment.extend({
        initialize: function () {
            var likesCount = this.likes().count;
            this.likes(likesCount);


            var args = _.toArray(arguments);
            AbstractComments.prototype.initialize.apply(this, args);
        }
    })

    return VK_Comment;
});