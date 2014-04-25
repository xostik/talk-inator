define(['underscore', 'backbone', 'jquery', 'user', 'aspic'], function( _, Backbone, $, user ){
    var TalkRegion = Backbone.AspicModel.extend({
        initialize: function () {
            var _this = this;

            this.set({
                user: user.getCurrentUser(),
                lastCommentCount: 0,
                postObj: -1,
                pingInterval: -1,
                handlers: {
                    onPostReady: $.Callbacks(),
                    onCommentsListReady: $.Callbacks(),
                    onUsersListReady: $.Callbacks()
                },
                userCash: {}, // uid: userObj
                userForFindList: [],
                commentsCash: {}, // cid: commentObj
                commentsReplyCash: {}, // cid (reply on comment): []
                exeQueue: [],
                lastExeTime: 0,
                usersDataRequestInQueue: false
            });

            this.user().whenReady(function(u){
                if(u.isAuth()){
                    _this._startRequestingTalk(_this.talkPath());
                }
            });

            this.user().onChangeStatus(function(u){
                if(u.isAuth()){
                    _this._startRequestingTalk(_this.talkPath());
                }
            });
        },

        // ------------------

        _startRequestingTalk: function(talkPath){
            var _this = this;

            // делаем запрос поста
            VK.Api.call('wall.getById', { posts: [talkPath], v:5.21 }, function (r) {
                var n = r.response[0].comments.count;
                _this.postObj(r.response[0]);
                _this.lastCommentCount(n);

                _this._postReadyHandler(r.response[0]);
                _this._rangeCommentRequest(0, Math.floor(n/100.0));
            });

            // заводим очередь запросов комментариев с промежутком в 400мс
            // каждые 5 секунд перезапрашиваем комментарий на наличие новых

            // оповещаем о наличии новых комментариев
        },

        // ------------------

        _postReadyHandler: function(postObj){
            this.handlers().onPostReady.fire(postObj);
        },

        // ------------------

        _rangeCommentRequest: function(from, to){
            if(this.pingInterval()){
                clearInterval(this.pingInterval());
            }

            for(var i = from; i <= to; i++){
                this._addToExeQueue(this._commentRequestFunction, this.postObj(), i*100);
            }

            _.delay(function(ctx, i){
                var f = _.bind( ctx._commentRequestFunction, ctx, ctx.postObj(), i*100 ),
                    pingInterval = setInterval(f, config.PING_NEW_COMMENT_PERIOD);
                ctx.pingInterval(pingInterval);
            }, to*config.MIN_REQUEST_PERIOD, this, to);
        },

        // ------------------

        _commentRequestFunction: function(postObj, offset){
            var f = _.bind(this._commentsReadyHandler, this);
            VK.Api.call('wall.getComments', {
                owner_id: postObj.from_id,
                post_id: postObj.id,
                count: 100,
                need_likes: 1,
                offset: offset,
                v: 5.21
            }, f);
        },

        // ------------------

        _commentsReadyHandler: function (response) {
            var newComment,
                newCommentsList = [];
            response = response.response;
            if(Math.floor(response.count) > Math.floor(this.lastCommentCount())){
                this._rangeCommentRequest(Math.floor(this.lastCommentCount()/100.0) + 1, Math.floor(response.count/100.0));
            }

            this.lastCommentCount(response.count);

            for (var i = 0, ii = response.items.length; i < ii; i++) {
                newComment = this._handleComment(response.items[i]);
                if(newComment){
                    newCommentsList.push(newComment);
                }
            }

            if(newCommentsList.length > 0){
                this.handlers().onCommentsListReady.fire(newCommentsList);
            }

            if(!this.usersDataRequestInQueue()){
                this.usersDataRequestInQueue(true);
                this._injectionInQueue(3, this._requestUserData);
            }

        },

        // ------------------

        _handleComment: function(commentObj){

            if(this.commentsCash()[commentObj.id] === undefined){
                this._handleUser(commentObj.from_id);
                this.commentsCash()[commentObj.id] = commentObj;
                if(commentObj.reply_to_comment){
                    this.commentsReplyCash()[commentObj.reply_to_comment] = commentObj;
                }

                return commentObj;
            }else{
                return false;
            }
            /*
            * cid: 1302649
             date: 1397731214
             from_id: 70437299
             text: "тытыры ты ты ты."
             uid: 70437299
            * */
        },

        // ------------------

        _handleUser: function(uid){
            if(this.userCash()[uid] === undefined){
                this.userForFindList().push(uid);
            }
        },

        // ------------------

        _requestUserData: function(){
            var f = _.bind(this._usersDataReadyHandler, this);
            this.usersDataRequestInQueue(false);

            if(this.userForFindList().length){
              var uids = this.userForFindList().join(',');
              this.userForFindList([]);
              VK.Api.call('users.get', {
                  user_ids: uids,
                  fields: 'photo_50',
                  v: 5.21
              }, f);
            }

        },

        // ------------------

        _usersDataReadyHandler: function(response){
            response = response.response;

            for(var i = 0, ii = response.length; i < ii; i++){
                this.userCash()[response[i].id] = response[i];
            }

            this.handlers().onUsersListReady.fire(response);
        },

        // ------------------

        _addToExeQueue: function(/*arguments*/){
            var args = _.toArray(arguments),
                functionForQueue = this._bindForQueue.apply(this, args),
                queue = this.exeQueue(),
                n = queue.length;
            this.exeQueue().push(functionForQueue);
            if(n < 2){
                this._checkExequtionOfQueue();
            }
        },

        // ------------------

        _bindForQueue: function(/*arguments*/){
            var args = _.toArray(arguments);
            args.splice(1, 0, this);

            return _.bind.apply(_, args);
        },

        // ------------------

        _checkExequtionOfQueue: function(){
            var t = (new Date).getTime(),
                delay = config.MIN_REQUEST_PERIOD + 10,
                f;
            if(t - this.lastExeTime() >= config.MIN_REQUEST_PERIOD && this.exeQueue().length > 0){
                this.exeQueue().shift()();
                this.lastExeTime(t);
            }else{
                delay = delay + this.lastExeTime() - t;
            }

            if(this.exeQueue().length>0){
                f = _.bind(this._checkExequtionOfQueue, this);
                setTimeout(f, delay);
            }
        },

        // ------------------

        _injectionInQueue: function(maxIndex /*func, arguments*/){
            var args = _.toArray(arguments),
                f;
            args = args.slice(1);

            if(this.exeQueue().length <= maxIndex){
                this._addToExeQueue.apply(this, args);
            }else{
                f = this._bindForQueue(args);
                this.exeQueue().splice(maxIndex, 0, f);
            }
        }
    });

    // ------------------

    return {
        getModel: function (talkPath) {
            return new TalkRegion({
                talkPath: talkPath
            });
        }
    };
});

