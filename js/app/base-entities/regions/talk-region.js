define(['abstract-region', 'underscore', 'user', requirePaths['talk-region.tpl'], requirePaths['comment.tpl'], 'router', 'utils'], function(Region, _, user, tpl, commentTpl, router){
    var TalkRegion = Region.extend({
        tagName: 'div',

        id: 'talk-region-wrap',

        template: _.template(tpl),

        templates: {
            comment: _.template(commentTpl),
            photoAttachment: _.template('<a class="img-wrap preview" href="javascript:;" data-preview-url="<%= photo_130 %>" data-origin-url="<%= photo_604 %>"><img src="<%= photo_130 %>" /></a>'),
            videoAttachment: _.template('<a class="video-wrap preview" href="javascript:;" data-id="<%= id %>" data-owner-id="<%= owner_id %>" data-key="<%= access_key %>" data-content="<%= title %>"><img src="<%= photo_320 %>" /></a>'),
            docAttachment: _.template('<a class="doc-wrap preview" href="javascript:;" data-preview-url="<%= photo_130 %>" data-origin-url="<%= url %>"><img src="<%= photo_130 %>" /></a>'),
            audioAttachment: _.template('<a href="<%= url %>" target="_blank" class="audio-wrap" data-content="(♪)"><%= artist %> &ndash; <%= title %></a>'),
            linkAttachment: _.template('<a href="<%= url %>" target="_blank" class="link-wrap"><h2 class="link-title" data-content="Ссылка" data-link="<%= url %>"><%= title %></h2> <p class="link-body"><%= description %></p></a>'),
            pageAttachment: _.template('<a href="<%= view_url %>" target="_blank" class="page-wrap"><h2 class="page-title" data-content="Страница"><%= title %></h2></a>'),

            videoPlayer: _.template('<iframe width="720" height="410" border="0" src="<%= player %>"></iframe>')
        },

        htmlCache: {
            $html: $('html'),
            $talkArea: undefined
        },

        events:{
            'click .video-wrap': 'playVideo',
            'click .doc-wrap': 'togglePict',
            'click .reply-comment': 'startReplyComment',
            'click .cancel-reply-subject': 'closeAnswer',
            'click a.img-wrap': 'togglePict',
            'click .comment-post': 'startComment',
            'focusin .answer-text': 'focusAnswer',
            'blur-of-answer .answer-area': 'blurOfAnswerHandler',
            'click .send': 'onCommentSend'
        },

        initialize: function(){
            var _this = this;

            this.initHandlers();
        },

        initHandlers: function(){
            var _this = this;

            this.model.handlers().onPostReady
                .add(function(r){
                    $('div.post-area')
                        .html(r.text)
                    .siblings('.likes')
                        .text(r.likes.count);

                    if(r.attachments){
                        _this.addAttachments($('section.post-area'), r.attachments);
                    }
                });

            this.model.handlers().onCommentsListReady
                .add(function(r){
                    for(var i = 0, ii = r.length; i < ii; i++){
                        _this.handleNewComment(r[i]);
                    }
                });

            this.model.handlers().onUsersListReady
                .add(function(r){
                    for(var i = 0, ii = r.length; i < ii; i++){
                        _this.handleNewUser(r[i]);
                    }
                });
        },

        showNotAuthMessage: function(){
            this.$el.find('.not-auth-message').show();
        },

        hideNotAuthMessage: function(){
            this.$el.find('.not-auth-message').hide();
        },

        destroy: function(){
            this.$el.off();
        },

        handleNewComment: function(commentObj){
            var $comment = this.buildComment(commentObj),
                $parent, $notOpenAnswers;
            /*if(commentObj.reply_to_comment){
                $('.talk-area .comment-' + commentObj.reply_to_comment + '>.answers')
                    .append($comment);
            }else{
                $('.talk-area').append($comment);
            }

            if(this.model.handlers().onAllCommentsReady.state() == 'resolved'){
                $comment
                    .css({backgroundColor: 'rgba(255, 223, 0, 0.2)'})
                    .animate({backgroundColor: 'rgba(255, 223, 0, 0)'}, {duration: 1000});
            }*/

            // this.model.handlers().onAllCommentsReady.state() == 'resolved'
            // нет - просто всавляем, как и раньше

            // ДА -
            // является ли ответом на другой коммент
            // нет - вставляем вниз как unreadable
            // да - смотрим, нет ли в его потомках, кого нибудь, лежащего в not-open области
            // есть - вставляем его как unreadable и увеличиваем count not-open области

            // нет - смотрим где лежит current-коммент
            // выше экрана - вставляем как unreadable с адаптацией скролла
            // ниже - вставляем вниз как unreadable
            // внутри - добавляем в not-open область


            if(this.model.handlers().onAllCommentsReady.state() != 'resolved'){
                if(commentObj.reply_to_comment){
                    $parent = $('.talk-area .comment-' + commentObj.reply_to_comment + '>.answers');
                }
                this.quickInsertComment($comment, $parent);
            }else{
                if(!commentObj.reply_to_comment){
                    this.insertComment($comment, undefined, true);
                }else{
                    $parent = $('.talk-area .comment-' + commentObj.reply_to_comment + '>.answers');
                    $notOpenAnswers = $parent.children('.not-open-answers');

                    if($notOpenAnswersOuter.data('count') > 0){
                        $parent.append($comment);
                        this.commentUpInNotOpenAnswers($notOpenAnswersOuter);
                    }
                }
            }
        },

        quickInsertComment: function($comment, $parent){
            if(!$parent){
                this.htmlCache.$talkArea
                    .append($comment);
            }else{
                $parent.append($comment);
            }
        },

        insertComment: function($comment, $parent, isNotReadedComment){
            var $notOpenAnswersOuter;

            if(isNotReadedComment){
                $comment.addClass('not-readed');
                // добавляем в наблюдаемые
            }

            if(!$parent){
                this.htmlCache.$talkArea
                    .append($comment);
            }else{
                $notOpenAnswersOuter = $parent.children('.not-open-answers');

                if($notOpenAnswersOuter.data('count') > 0){
                    $notOpenAnswersOuter
                        .append($comment);

                    this.commentUpInNotOpenAnswers($notOpenAnswersOuter);
                }else{
                    $parent.append($comment);

                    $notOpenAnswersOuter = $parent.parents('.not-open-answers');

                    if($notOpenAnswersOuter.length){
                        this.commentUpInNotOpenAnswers($notOpenAnswersOuter);
                    }
                }
            }
        },

        commentUpInNotOpenAnswers: function($notOpenAnswers){
            var n = $notOpenAnswers.data('count') + 1,
                tx = this.genNotOpenAnswersText(n);

            if(n == 1){
                $notOpenedAnswersArea.addClass('active');
            }

            $notOpenAnswers.data('text', tx);
            $notOpenAnswers.data('count', n);
        },

        appendCommentToNotOpenedBox: function($comment, $parentComment){
            var $notOpenedAnswersArea = $parentComment.find('.not-open-answers');
            $notOpenedAnswersArea
                .append($comment);
            this.commentUpInNotOpenAnswers($notOpenedAnswersArea);
        },

        handleNewUser: function(user){
            var $comment = $('.from-user-'+user.id);
            this.addUserDataToComment($comment, user);
        },

        buildComment: function(commentObj){
            var tx = this.clearCommentText(commentObj.text);
            var $c = $(this.templates.comment(commentObj)),
                user = this.model.userCache()[commentObj.from_id];

            if(user.isReady()){
                this.addUserDataToComment($c, user);
            }else{
                $c.find('.user-name')
                    .text(commentObj.from_id);
            }

            $c.find('.comment-body')
                .text(tx);

            if(commentObj.attachments){
                this.addAttachments($c, commentObj.attachments);
            }

            return $c;
        },

        clearCommentText: function(tx){
            return tx.replace(/\[[^\]]+\|([^\]]+)\]/, function(p1, p2){
                return p2;
            });
        },

        addUserDataToComment: function($comment, user){
            if(user.type() != 'user'){
                $comment.children('.comment-area').find('.user-name')
                    .text(user.name());
            }else{
                $comment.children('.comment-area').find('.user-name')
                    .text(user.last_name() + ' ' + user.first_name());
            }

            $comment.children('.img-wrap').find('.img-in')
                .attr('src', user.photo_50());
        },

        addAttachments: function($el, attachments){
            for(var i = 0, ii=attachments.length; i < ii; i++){
                switch (attachments[i].type){
                    case 'photo':{
                     this.addPhoto($el, attachments[i].photo);
                    } break;
                    case 'video':{
                     this.addVideo($el, attachments[i].video);
                    } break;
                    case 'page':{
                     this.addPage($el, attachments[i].page)

                    } break;
                    case 'audio':{
                     this.addAudio($el, attachments[i].audio);
                    } break;
                    case 'link':{
                     this.addLink($el, attachments[i].link);
                    } break;
                    case 'doc':{
                     this.addDoc($el, attachments[i].doc);
                    } break;
                }
            }
        },

        addPhoto: function($el, attachment){
            $el.find('.photo-attachments')
                .append(this.templates.photoAttachment(attachment))
                .show();
        },

        addVideo: function($el, attachment){
            $el.find('.video-attachments')
                .append(this.templates.videoAttachment(attachment))
                .show();
        },

        addPage: function($el, attachment){
            $el.find('.page-attachments')
                .append(this.templates.pageAttachment(attachment))
                .show()
        },

        addAudio: function($el, attachment){
            $el.find('.audio-attachments')
                .append(this.templates.audioAttachment(attachment))
                .show();
        },

        addLink: function($el, attachment){
            $el.find('.link-attachments')
                .append(this.templates.linkAttachment(attachment))
                .show();
        },

        addDoc: function($el, attachment){
            if(attachment.ext == 'gif'){
                $el.find('.doc-attachments')
                    .append(this.templates.docAttachment(attachment))
                    .show();
            }
        },

        playVideo: function(e){
            var _this = this,
                $el = $(e.currentTarget),
                dt = $el.data(),
                vid = dt.ownerId + '_' + dt.id + '_' + dt.key;

            VK.Api.call('video.get', { videos: [vid], v:5.21 }, function (r) {
                var player = _this.templates.videoPlayer(r.response.items[0]);
                $el
                    .after(player)
                    .remove();
            });
        },

        togglePict: function(e){
            var $el = $(e.currentTarget),
                isOpen = $el.data('is-open'),
                url;

            if(isOpen){
                url = $el.data('preview-url');
            }else{
                url = $el.data('origin-url');
            }
            $el
                .data('is-open', !isOpen)
                .toggleClass('preview')
            .find('img')
                .attr('src', url);
        },

        startReplyComment: function(e){
            var _this = this,
                $el = $(e.currentTarget),
                $comment = $el.parents('.comment-i'),
                dt = $comment.data(),
                user = this.model.userCache()[dt.from_id];
            if(user.dat_first_name()){
                _this.startReplyCommentAction(user, dt.comment_id, dt.from_id);
            }else{
                VK.Api.call('users.get', {
                    user_ids: [user.id],
                    name_case: 'dat',
                    v: 5.21
                }, function(r){
                    user.dat_first_name( r.response[0].first_name );
                    user.dat_last_name( r.response[0].last_name );
                    _this.startReplyCommentAction(user, dt.comment_id, dt.from_id);
                });
            }
        },

        startComment: function(){
            this.openAnswer();
        },

        startReplyCommentAction: function(user, comment_id, from_id){
            this.openAnswer();

            $('.action-panel .reply-subject .val')
                .text(user.dat_first_name)
                .attr('data-dat-first-name', user.dat_first_name)
                .attr('data-dat-last-name', user.dat_last_name)
                .attr('data-nom-first-name', user.first_name)
                .attr('data-subject-cid', comment_id)
                .attr('data-subject-uid', from_id);
        },

        cancelReplyComment: function(){
            $('.action-panel .reply-subject .val')
                .text('')
                .attr('data-dat-first-name', '')
                .attr('data-dat-last-name', '')
                .attr('data-nom-first-name', '')
                .attr('data-subject-cid', '')
                .attr('data-subject-uid', '');
        },

        focusAnswer: function(){
            this.openAnswer();
        },

        blurOfAnswerHandler: function(e){
            var $el = $(e.currentTarget).find('.answer-text');
            if($el.val().length == 0){
                this.closeAnswer();
            }
        },

        openAnswer: function(){
            if(!this.isInVk()){
                $('.answer-area textarea').blur();
                this.showAttention('Оставлять комментарии можно только после установки нашего приложения для браузера google chrome. Это связано с тем, что Вконтакте не позволяет оставлять комментарии с других сайтов.');
            }else{
                if(!$('.answer-area').hasClass('active')){
                    $('.answer-area')
                        .addClass('active')
                        .find('textarea')
                        .focus();
                    this.startWatchBlurOfAnswer();
                }
            }
        },

        closeAnswer: function(){
            var $answerArea = $('.answer-area');
            $answerArea.removeClass('active');
            this.stopWatchBlurOfAnswer();
            this.cancelReplyComment();
        },

        startWatchBlurOfAnswer: function(){
            var _this = this;
            setTimeout(function(){
                $(document).on('click', _this.watchBlurOfAnswer);
            }, 200);

        },

        stopWatchBlurOfAnswer: function(){
            $(document).off('click', this.watchBlurOfAnswer);
        },

        watchBlurOfAnswer: function(e){
            if ($(e.target).closest('.answer-area, .reply-comment, .comment-post').length == 0){
                $('.answer-area').trigger('blur-of-answer');
            }
        },

        onCommentSend: function(){
            this.model.forceCommentUpdate(700);
        },

        render: function(){
            var _this = this;

            this.$el.html(this.template({}));

            this.htmlCache.$talkArea = this.$el.find('.talk-area');

            this.model.user().whenReady(function(u){
                if(u.isAuth()){
                    _this.hideNotAuthMessage();
                }else{
                    _this.showNotAuthMessage();
                }
            });

            return this.$el;
        },

        showAttention: function(mess){
            alert(mess);
        },

        genNotOpenAnswersText: function(n){
            return n + ' новых комментария';
        },

        isInVk: function(){
             return location.hash.length > 0;
        }

    });

    TalkRegion.prototype.regionName = 'talk-region';

    return TalkRegion;
});

