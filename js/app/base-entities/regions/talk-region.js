define(['abstract-region', 'underscore', 'user', 'talk-items-views', requirePaths['talk-region.tpl'], 'router', 'utils'], function(Region, _, user, talkItemsViews, tpl, router){
    var TalkRegion = Region.extend({
        tagName: 'div',

        id: 'talk-region-wrap',

        template: _.template(tpl),

        templates: {
            videoPlayer: _.template('<iframe width="720" height="410" border="0" src="<%= player %>"></iframe>')
        },

        htmlCache: {
            $html: $('html'),
            $window: $(window),
            $talkArea: undefined
        },

        windowSize: {},

        views: {
            post: undefined,
            comments: {} // cid: commentView
        },

        /*
         * поле в котором хранится id последнего комментария от текущего пользователя,
         * с момента последней попытки сделать ответ. Нужно для подсветки и центрирования комента пользователя
         * при возвращении из вк в талкинатор
         */
        lastUserCommentAfterLastReply: null,

        events:{
            'click .video-wrap': 'playVideo',
            'click .doc-wrap': 'togglePict',
            'click a.img-wrap': 'togglePict',

            'click .reply-comment': 'startReplyComment',
            'click .cancel-reply-subject': 'closeAnswer',
            'click .comment-post': 'startComment',
            'focusin .answer-text': 'focusAnswer',
            'blur-of-answer .answer-area': 'blurOfAnswerHandler',
            'click .send': 'onCommentSend',
            'click .open-comments': 'openShortComments',

            'click #receiver': 'handleOuterMessage'
        },

        initialize: function(){
            this.refreshWindowSize();
            this.initHandlers();
        },

        initHandlers: function(){
            var refreshWindowSize = _.bind(this.refreshWindowSize, this);
            this.htmlCache.$window.resize(refreshWindowSize);

            this.listenTo(this.model, 'postIsReady', this.postReadyActions);
            this.listenTo(this.model, 'vkCommentIsReady', this.newVkCommentReadyAction);
        },

        refreshWindowSize: function(){
            var $w = this.htmlCache.$window;

            this.windowSize.height = $w.height();
            this.windowSize.width = $w.width();
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

        postReadyActions: function(post){
            var postView = new talkItemsViews.PostView({model: post});
            this.$el.find('#post-area-wrap')
                .html( postView.render() );

            this.views.post = postView;
        },

        newVkCommentReadyAction: function(comment){
            var placementOfComment, view;
            this.checkLastUserCommentAfterLastReply(comment);
            if(this.model.isAllVkCommentsReady()){
                this.checkLastUserCommentAfterLastReply(comment);

                if(user.getCurrentUser().mid() == comment.from_id()){
                    this.insertComment(comment);
                    //this.centeredWindowByComment(comment);
                    return;
                }

                placementOfComment = this.placementOfComment(comment);
                if(placementOfComment < 0){
                    this.insertComment(comment);
                }else{
                    if(placementOfComment > 0){
                        view = this.insertComment(comment);
                        this.offsetWindowOnComment(view);
                    }else{
                        if(comment.hasText()){
                            this.insertComment(comment, 'short-version');
                        }else{
                            this.insertComment(comment, 'short-version-just-attachments');
                        }
                    }
                }
            }else{
                 this.insertComment(comment);
            }
        },

        insertComment: function(comment, shortVersion){
            var commentView = new talkItemsViews.CommentView({model: comment}, {shortVersion: shortVersion}),
                renderResult = commentView.render(),
                parentView;

            if(shortVersion){
                renderResult.css('display', 'none');
            }

            if(comment.parent()){
                parentView = this.views.comments[comment.parent().id];
                parentView.appendAnswer(renderResult);
            }else{
                this.htmlCache.$talkArea
                    .append(renderResult);
            }

            if(shortVersion){
                renderResult.slideDown();
            }

            this.views.comments[comment.id] = commentView;

            return commentView;
        },

        centeredWindowByComment: function(comment){
            var $view = this.views.comments[comment.id].$el,
                $w = this.htmlCache.$window,
                scrollTop = $w.scrollTop(),
                elH = $view.qInnerHeight(),
                elRect = $view.get(0).getBoundingClientRect(),
                diff = (this.windowSize.height - elH)/2;

            if( diff < 200 ){
                diff = 200;
            }

            $w.scrollTop(scrollTop + elRect.top - diff);

            this.accentElements($view);
        },

        placementOfComment: function(comment){
            var parent = comment.parent(),
                siblings, prevEl, prevElView, elRect;

            if(parent){
                siblings = parent.answers();
                if(siblings.length == 1){
                    prevEl = parent;
                }else{
                    prevEl = siblings.last(2)[0];
                }
            }else{
                if(this.model.vk().comments.count() == 1){
                    return 0;
                }else{
                    prevEl = this.model.vk().comments.firstLevel().last(2)[0];
                }
            }

            prevElView = this.views.comments[prevEl.id];
            elRect = prevElView.$el.get(0).getBoundingClientRect();

            if(elRect.bottom < 0){
                return 1;
            }
            if(elRect.top > this.windowSize.height){
                return -1;
            }
            return 0;
        },

        offsetWindowOnComment: function(commentView){
            var h = commentView.$el.qInnerHeight(),
                $w = this.htmlCache.$window;
            $w.scrollTop($w.scrollTop() + h);
        },

        openShortComments: function(e){
            var $el = $(e.target).parent(),
                topPostion = $el.get(0).getBoundingClientRect().top,
                $allShortComments = this.$el.find('.short-version'),
                $w = this.htmlCache.$window,
                positionDiff;

            $allShortComments
                .removeClass('short-version short-version-just-attachments');
            this.accentElements($allShortComments);

            positionDiff = $el.get(0).getBoundingClientRect().top - topPostion;
            $w.scrollTop($w.scrollTop() + positionDiff);
        },

        accentElements: function($el){
            $el.css({backgroundColor: 'rgba(255, 223, 0, 0.2)'})
                .animate({backgroundColor: 'rgba(255, 223, 0, 0)'}, {duration: 3000});
        },
/*
        handleNewComment: function(comment){
            debugger; // Это еще работает?!
            var $comment = this.buildComment(comment),
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


            /*if(this.model.handlers().onAllCommentsReady.state() != 'resolved'){
                if(comment.reply_to_comment){
                    $parent = $('.talk-area .comment-' + comment.reply_to_comment + '>.answers');
                }
                this.quickInsertComment($comment, $parent);
            }else{
                if(!comment.reply_to_comment){
                    this.insertComment($comment, undefined, true);
                }else{
                    $parent = $('.talk-area .comment-' + comment.reply_to_comment + '>.answers');
                    $notOpenAnswers = $parent.children('.not-open-answers');

                    if($notOpenAnswersOuter.data('count') > 0){
                        $parent.append($comment);
                        this.commentUpInNotOpenAnswers($notOpenAnswersOuter);
                    }
                }
            }
        },

        quickInsertComment: function($comment, $parent){
            debugger; // Это еще работает?!
            if(!$parent){
                this.htmlCache.$talkArea
                    .append($comment);
            }else{
                $parent.append($comment);
            }
        },

        insertComment2: function($comment, $parent, isNotReadedComment){
            debugger; // Это еще работает?!
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
    */
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
            this.clearLastUserCommentAfterLastReply();

            var _this = this,
                $el = $(e.currentTarget),
                $comment = $el.parents('.comment-i'),
                dt = $comment.data(),
                user = this.model.vk().users[dt.from_id];

            //_this.startReplyCommentAction(user, dt.comment_id, dt.from_id);

            if(user.dat_first_name() != -1){

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
            this.clearLastUserCommentAfterLastReply();

            this.cancelReplyComment();
            this.openAnswer();
        },

        startReplyCommentAction: function(user, comment_id, from_id){
            var commentData = {
                datFirstName: user.dat_first_name(),
                datLastName: user.dat_last_name(),
                nomFirstName: user.first_name(),
                subjectCid: comment_id,
                subjectUid: from_id
            };

            $('#receiver')
                .attr('data-message', JSON.stringify(commentData))
            .get(0)
                .click();
            this.openAnswer();
            /*$('.action-panel .reply-subject .val')
                .text(user.dat_first_name())
                .attr('data-dat-first-name', user.dat_first_name())
                .attr('data-dat-last-name', user.dat_last_name())
                .attr('data-nom-first-name', user.first_name())
                .attr('data-subject-cid', comment_id)
                .attr('data-subject-uid', from_id);*/

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
            }else{  /*
                if(!$('.answer-area').hasClass('active')){
                    $('.answer-area')
                        .addClass('active')
                        .find('textarea')
                        .focus();
                    this.startWatchBlurOfAnswer();
                }           */
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
            this.model.vk().talkLoader.forceCommentUpdate(700);
        },

        render: function(){
            var _this = this;

            this.$el.html(this.template({}));

            this.htmlCache.$talkArea = this.$el.find('.talk-area');

            user.getCurrentUser().whenReady(function(u){
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
        },

        handleOuterMessage: function(e){
            var message = JSON.parse($(e.currentTarget).attr('data-message'));
            console.log(message);
        },

        clearLastUserCommentAfterLastReply: function(){
            this.lastUserCommentAfterLastReply = null;
        },

        setLastUserCommentAfterLastReply: function(comment){
            this.lastUserCommentAfterLastReply = comment;
        },

        getLastUserCommentAfterLastReply: function(){
            return this.lastUserCommentAfterLastReply;
        },

        checkLastUserCommentAfterLastReply: function(comment){
            if(user.getCurrentUser().mid() == comment.from_id()){
                this.setLastUserCommentAfterLastReply( comment.id );
            }
        }

    });

    TalkRegion.prototype.regionName = 'talk-region';

    return TalkRegion;
});

