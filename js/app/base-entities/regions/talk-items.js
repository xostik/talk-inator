define(['jquery', 'underscore', 'backbone', requirePaths['comment.tpl'], requirePaths['post.tpl'], 'aspic'], function( $, _, Backbone, commentTPL, postTPL ){
    var localTpls = {
        photoAttachment: _.template('<a class="img-wrap preview" href="javascript:;" data-preview-url="<%= photo_130 %>" data-origin-url="<%= photo_604 %>"><img src="<%= photo_130 %>" /></a>'),
        videoAttachment: _.template('<a class="video-wrap preview" href="javascript:;" data-id="<%= id %>" data-owner-id="<%= owner_id %>" data-key="<%= access_key %>" data-content="<%= title %>"><img src="<%= photo_320 %>" /></a>'),
        docAttachment: _.template('<a class="doc-wrap preview" href="javascript:;" data-preview-url="<%= photo_130 %>" data-origin-url="<%= url %>"><img src="<%= photo_130 %>" /></a>'),
        audioAttachment: _.template('<a href="<%= url %>" target="_blank" class="audio-wrap" data-content="(♪)"><%= artist %> &ndash; <%= title %></a>'),
        linkAttachment: _.template('<a href="<%= url %>" target="_blank" class="link-wrap"><h2 class="link-title" data-content="Ссылка" data-link="<%= url %>"><%= title %></h2> <p class="link-body"><%= description %></p></a>'),
        pageAttachment: _.template('<a href="<%= view_url %>" target="_blank" class="page-wrap"><h2 class="page-title" data-content="Страница"><%= title %></h2></a>')
    };


    var TalkItemView = Backbone.AspicView.extend({
            tagName: 'div',

            templates: localTpls,

            initialize: function(){
                this.htmlCache = {};
            },

            initBindings: function(){
                 this.bindWithField('.likes', {
                    withProperty: 'likes'
                });
            },

            userReadyAction: function(user){
                var imgSelector = '#img-for-' + this.model.id + '-' + this.model.from_id(),
                    userNameSelector = '#name-for-' + this.model.id + '-' + this.model.from_id();
                this.$el.find(imgSelector)
                    .attr('src', user.photo_50());

                this.$el.find(userNameSelector)
                    .text(user.fullName());

            },

            addAttachments: function(){
                var attachments = this.model.attachments();
                if(!attachments){
                    return;
                }

                for(var i = 0, ii=attachments.length; i < ii; i++){
                    switch (attachments[i].type){
                        case 'photo':{
                            this.addPhoto(attachments[i].photo);
                        } break;
                        case 'video':{
                            this.addVideo(attachments[i].video);
                        } break;
                        case 'page':{
                            this.addPage(attachments[i].page)

                        } break;
                        case 'audio':{
                            this.addAudio(attachments[i].audio);
                        } break;
                        case 'link':{
                            this.addLink(attachments[i].link);
                        } break;
                        case 'doc':{
                            this.addDoc(attachments[i].doc);
                        } break;
                    }
                }
            },

            addPhoto: function(attachment){
                this.$el.find('.photo-attachments')
                    .append(this.templates.photoAttachment(attachment))
                    .show();
            },

            addVideo: function(attachment){
                this.$el.find('.video-attachments')
                    .append(this.templates.videoAttachment(attachment))
                    .show();
            },

            addPage: function(attachment){
                this.$el.find('.page-attachments')
                    .append(this.templates.pageAttachment(attachment))
                    .show()
            },

            addAudio: function(attachment){
                this.$el.find('.audio-attachments')
                    .append(this.templates.audioAttachment(attachment))
                    .show();
            },

            addLink: function(attachment){
                this.$el.find('.link-attachments')
                    .append(this.templates.linkAttachment(attachment))
                    .show();
            },

            addDoc: function(attachment){
                if(attachment.ext == 'gif'){
                    this.$el.find('.doc-attachments')
                        .append(this.templates.docAttachment(attachment))
                        .show();
                }
            },

            updateHtmlCache: $.noop,

            beforeInsert: $.noop,

            render: function(){
                this.$el.html(
                    this.template( this.model )
                );

                this.initBindings();

                this.addAttachments();

                var userReadyAction = _.bind(this.userReadyAction, this);
                this.model.user().whenReady(userReadyAction);

                this.updateHtmlCache();

                this.beforeInsert(this.$el);

                return this.$el;
            }

        }),

        PostView = TalkItemView.extend({
            template: _.template(postTPL)
        }),

        CommentView = TalkItemView.extend({
            template: _.template(commentTPL),

            initialize: function(params, options){
                var args = _.toArray(arguments);
                this.shortVersion = options.shortVersion;

                TalkItemView.prototype.initialize.apply(this, args);
            },

            updateHtmlCache: function(){
                this.htmlCache.$answers = this.$el.find('.answers');
                this.htmlCache.$postTime = this.$el.find('.post-time');
                //_.timeAgo(date())
            },

            initBindings: function(){
                this.bindWithField('.comment-body', {
                    withFunction: 'commentText',
                    dependencies: 'text'
                });

                TalkItemView.prototype.initBindings.apply(this);
            },

            appendAnswer: function($child){
                this.htmlCache.$answers
                    .append($child);
            },

            beforeInsert: function($el){
                if(this.shortVersion == 'short-version'){
                    $el.find('.comment-i')
                        .addClass('short-version');
                }

                if(this.shortVersion == 'short-version-just-attachments'){
                    $el.find('.comment-i')
                        .addClass('short-version short-version-just-attachments');
                }

                this.startCronForUpdatingTime();
            },

            startCronForUpdatingTime: function(){
                var f = _.bind(function(){
                    var t = _.timeAgo(this.model.date());
                    this.htmlCache.$postTime.text(t);
                }, this);

                f();
                setInterval(f, 60*1000);
            },

            commentText: function(){
                return this.clearCommentText(this.model.text());
            },

            clearCommentText: function(tx){
                return tx.replace(/\[[^\]]+\|([^\]]+)\]/, function(p1, p2){
                    return p2;
                });
            }
        });

    return {
        PostView: PostView,
        CommentView: CommentView
    };
});