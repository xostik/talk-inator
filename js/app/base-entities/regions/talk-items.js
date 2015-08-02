define(['jquery', 'underscore', 'backbone', 'post', requirePaths['comment.tpl'], requirePaths['post.tpl'], 'aspic'], function( $, _, Backbone, Post, commentTPL, postTPL ){
    var localTpls = {
            photoAttachment: _.template('<a class="img-wrap preview" href="javascript:;" data-preview-url="<%= photo_130 %>" data-origin-url="<%= photo_604 %>"><img src="<%= photo_130 %>" /></a>'),
            videoAttachment: _.template('<a class="video-wrap preview" href="javascript:;" data-id="<%= id %>" data-owner-id="<%= owner_id %>" data-key="<%= access_key %>" data-content="<%= title %>"><img src="<%= photo_320 %>" /></a>'),
            docAttachment: _.template('<a class="doc-wrap preview" href="javascript:;" data-preview-url="<%= photo_130 %>" data-origin-url="<%= url %>"><img src="<%= photo_130 %>" /></a>'),
            audioAttachment: _.template('<a href="<%= url %>" target="_blank" class="audio-wrap" data-content="(♪)"><%= artist %> &ndash; <%= title %></a>'),
            linkAttachment: _.template('<a href="<%= url %>" target="_blank" class="link-wrap"><h2 class="link-title" data-content="Ссылка" data-link="<%= url %>"><%= title %></h2> <p class="link-body"><%= description %></p></a>'),
            pageAttachment: _.template('<a href="<%= view_url %>" target="_blank" class="page-wrap"><h2 class="page-title" data-content="Страница"><%= title %></h2></a>'),
            stickerAttachment: _.template('<img src="<%= photo_64 %>" />')
        },

        repostTPL = _.template('<img src="<%= photo_64 %>" />');


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
                        case 'sticker':{
                            this.addSticker(attachments[i].sticker);
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
                attachment.description = attachment.description || '';

                this.$el.find('.link-attachments')
                    .append(this.templates.linkAttachment(attachment))
                    .show();
            },

            addDoc: function(attachment){
                attachment.description = attachment.description || '';

                this.$el.find('.sticker-attachments')
                    .append(this.templates.linkAttachment(attachment))
                    .show();
            },

            addSticker: function(attachment){
                this.$el.find('.sticker-attachments')
                    .append(this.templates.stickerAttachment(attachment))
                    .show();
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
            template: _.template(postTPL),
            //repostTemplate: _.template(localTpls.repostTPL),

            events: {
                'click .show-repost': 'onShowRepostClickHandler'
            },

            addRepost: function(repost){

            },

            beforeInsert: function($el){
                this.appendRepostSource($el);
            },

            appendRepostSource: function($el){
                // если есть источник:
                // создаем вью источника
                // вставляем нам
                var userProvider = this.model.get('userProvider');

                if(this.model.copy_history().length == 0){
                    return;
                }

                this.repostSourceView = new PostView({
                    model: new Post(this.model.copy_history()[0], {userProvider: userProvider})
                });

                $el.find('.repost-from').append(
                    this.repostSourceView.render()
                );
            },

            onShowRepostClickHandler: function(e){
                var _this = this,
                    $el = $(e.currentTarget),
                    repostId = $el.data('repost-id');

                this.trigger('startWaitingRepost', repostId);
            }
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
                var tx = this.model.text();
                tx = this.clearCommentText(tx);
                tx = _.adaptVkEmoji(tx);
                return tx;
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