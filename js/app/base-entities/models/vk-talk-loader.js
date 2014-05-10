/*
*
* talk-region = {
*   post
*   vk:{
*       talk-loader
*       comment-tree
*       is-active
*   }
*   talkinator: {
*       talk-loader
*       comment-tree
*       is-active
*   }
*   active: vk
* }
*
* */

define(['underscore', 'backbone', 'jquery', 'user', 'user-models', 'comments-tree', 'aspic'], function( _, Backbone, $, user, UserModels, CommentsTree ){
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
                    onUsersListReady: $.Callbacks(),
                    onAllCommentsReady: $.Deferred()
                },
                userCache: {}, // uid: userObj
                userForFindList: [],
                comments: new CommentsTree(),
                commentsCash: {}, // cid: commentObj
                commentsReplyCash: {}, // cid (reply on comment): []
                exeQueue: [],
                lastExeTime: 0,
                usersDataRequestInQueue: false
            });

            this.user().whenReady(function(u){
                if(u.isAuth()){
                    _this._startRequestingTalk(_this.talkPath());

                    _this._handleUser(u.mid());
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
            VK.Api.call('wall.getById', { posts: [talkPath], extended: 1, v:5.21 }, function (r) {
                var n = r.response.items[0].comments.count;
                _this.postObj(r.response.items[0]);
                _this._handleExtendedInfo(r.response);
                _this.lastCommentCount(n);

                _this._postReadyHandler(r.response.items[0]);
                _this._rangeCommentRequest(0, Math.floor(n/100.0));

                _this._resolveAllCommentsReady((Math.floor(n/100.0)+4)*config.MIN_REQUEST_PERIOD);
            });
        },

        // ------------------

        _postReadyHandler: function(postObj){
            this.handlers().onPostReady.fire(postObj);
        },

        // ------------------

        _handleExtendedInfo: function(postObj){
            // группы
            if(postObj.groups){
                var group;
                for(var i = 0, ii = postObj.groups.length; i < ii; i++){
                    group = postObj.groups[i];
                    group.id = -group.id;
                    this.userCache()[group.id] = new UserModels.PublicPage({
                        promiseInitData: $.Deferred().resolve(group)
                    });
                }
            }
        },

        // ------------------

        _rangeCommentRequest: function(from, to){
            this._stopPingNewComments();

            for(var i = from; i <= to; i++){
                this._addToExeQueue(this._commentRequestFunction, this.postObj(), i*100);
            }

            this._startPingNewComments(to*config.MIN_REQUEST_PERIOD);
        },

        // ------------------

        _startPingNewComments: function(delay){
            var offset = Math.round(this.lastCommentCount()/50.0) * 50 - 50;
            offset = (offset<0) ? 0: offset;

            _.delay(function(ctx, offs){
                var f = _.bind( ctx._commentRequestFunction, ctx, ctx.postObj(), offs ),
                    pingInterval = setInterval(f, config.PING_NEW_COMMENT_PERIOD);
                ctx.pingInterval(pingInterval);
            }, delay, this, offset);
        },

        // ------------------

        _stopPingNewComments: function(){
            if(this.pingInterval()){
                clearInterval(this.pingInterval());
            }
        },

        // ------------------

        _commentRequestFunction: function(postObj, offset, count){
            var f = _.bind(this._commentsReadyHandler, this);
            count = count || 100;

            VK.Api.call('wall.getComments', {
                owner_id: postObj.from_id,
                post_id: postObj.id,
                count: count,
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
            if(Math.round(response.count/50.0) > Math.round(this.lastCommentCount()/50.0)){
                this._stopPingNewComments();
                this._startPingNewComments(0);
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
        },

        // ------------------

        _handleUser: function(uid){
            if(this.userCache()[uid] === undefined){
                this.userForFindList().push(uid);
                this.userCache()[uid] = new UserModels.OtherUser({promiseInitData: $.Deferred()});
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
            var newUsers = [];
            response = response.response;

            for(var i = 0, ii = response.length; i < ii; i++){
                this.userCache()[response[i].id].promiseInitData()
                    .resolve(response[i]);

                newUsers.push(this.userCache()[response[i].id]);
            }

            this.handlers().onUsersListReady.fire(newUsers);
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
                f = this._bindForQueue.apply(this, args);
                this.exeQueue().splice(maxIndex, 0, f);
            }
        },

        // ------------------

        _resolveAllCommentsReady: function(delay){
            setTimeout(_.bind( function(){
                this.handlers().onAllCommentsReady.resolve();
            },this), delay);
        },

        // ------------------

        forceCommentUpdate: function(delay){
            setTimeout(_.bind( function(dly){
                this._stopPingNewComments();

                var offset = Math.round(this.lastCommentCount()/50.0) * 50 - 50;
                offset = (offset<0) ? 0: offset;
                this._addToExeQueue(this._commentRequestFunction, this.postObj(), offset);

                this._startPingNewComments(dly);
            },this, delay), delay);
        },

        // -------------------

        addUserRequest: function(uid){
            this._handleUser(uid);

            return this.userCache()[uid].getWhenReadyDeferred();
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

