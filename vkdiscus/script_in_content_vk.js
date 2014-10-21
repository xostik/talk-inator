var pid = Math.round(Math.random() * 100000),
    tunelObject = $.Callbacks(),
    lastMeaasageTime = (new Date).getTime(),
    isPopupMinimized = false,
    $window = $(window),
    $doc = $(document),
    $popup,

    styleHTML =
        '<style>' +
            '.discus_btn{display:none; position: absolute; top: -8px; left: -132px; width:16px; height:25px; background:url(https://talk.ru/i/talk-icn.png) 0 0 no-repeat;} ' +
            '.talkinator-tab{position: fixed; top: 50%; left: 50%; margin-top: -23px; margin-left: 388px; width: 100px; padding:10px 0 11px 0; background: rgba(0, 0, 0, 0.7); text-align: center; color: #ddd; text-shadow: 0px 1px 0px #262626; border-radius: 6px; opacity:0.99; cursor: pointer;} ' +
            '.talkinator-tab:after{content: ""; position: absolute; top: 18px; left: -6px; border-right:6px solid rgba(0, 0, 0, 0.7); border-top:6px solid transparent; border-bottom:6px solid transparent;} ' +
            '.bottom-align{position: absolute; bottom: 0; right: -332px; top: auto; left: auto; margin-top:0; } ' +
            '.top-align{position: absolute; top: 0; right: -332px; left: auto; margin-top:0;} ' +
            '.wide_wall_module .top-align, .wide_wall_module .bottom-align{right: -132px;} ' +
            '.wide_wall_module .discus_btn{left:-262px} ' +
            '.post:hover .discus_btn{display:block;} ' +
            '.toggle-talkinator:before{content:""; position:absolute; width:10px; height:0px; border: 1px solid white; top: 13px; left: 9px; border-radius: 2px;} ' +
            '.minimized .toggle-talkinator:before{content:""; position:absolute; width:10px; height:10px; border: 2px solid white; top: 7px; left: 8px; border-radius: 2px;} ' +
        '</style>',
    openTalkinatorIconHtml = '<a class="discus_btn discus_handled_btn bhb-<%= postId%>" data-post-id="<%= postId%>" href="javascript:;" title="Открыть дискуссию в талкинаторе"></a>',
    tabHTML =
        '<div class="talkinator-tab" data-post-id = "<%= postId%>">' +
            'Вернуться к дискуссии' +
        '</div>';

init(); 


/*var $ifr = $('<iframe style="width:300px; height:300px; position:fixed; top:20px; right:20px; z-index: 10000000;" src="http://page2page.ru/vk/#'+pid+'"></iframe>');
$('#system_msg').after($ifr);

setTimeout(function(){
debugger;
},2000);*/

// ------------------------------

function init() {
    initHelperButtons();

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.type == 'toVkSide' && pid == request.pid) {
                var t = (new Date).getTime();

                if (t - lastMeaasageTime > 500) {
                    lastMeaasageTime = t;

                    sendMessage(request.message);
                    return true;
                }
            }
        }
    );
}

function sendMessageToDiscus(message) {
	chrome.runtime.sendMessage({ type: 'messageFromVKSide', pid: pid, message: message }, function (response) { });
}

// ------------------------------

function initHelperButtons() {
    $('head')
        .append(styleHTML);

	setInterval(function(){
		getUnhandledPosts()
			.each(function(){
				var $el = $(this),
					postId = findPostIdByPostElement($el);
				
				$el
					.addClass('discus_handled');

			    $('#post' + postId + ' .post_full_like_wrap')
					.append(openTalkinatorIconHtml.replace(/<%= postId%>/g, postId));
			});
	}, 500);
	
	$doc.on('click', '.discus_handled_btn', function () {
	        var postId = $(this).data('post-id');
	        openPopup(postId);
            createTab($(this), postId);
	    })
        .on('click', '.close-talkinator', function(){removeTab(); closePopup();})
		.on('click', '.toggle-talkinator', togglePopup)
        .on('click', '.talkinator-tab', maximizePopup)
        .scroll(alignTab);

	$window.resize(alignTab);
    $window.resize(adaptPopup);
}


// ------------------------------

function createPopup() {
    var $ifr = $('<iframe frameborder="no" style="width: 100%; height:100%;" src="about:blank"></iframe>'),
		$cls = $('<div class="close-talkinator" title="закрыть дискуссию" style="position:absolute; top:-5px; right:12px; -webkit-transform: scale(0.5); cursor: pointer; font-size: 20pt; line-height: 12pt; padding: 5px 5px 8px 5px; background: rgba(0,0,0,0.5); border-radius: 100px; color: white;">×</div>'),
		$toggle = $('<div class="toggle-talkinator" title="свернуть/развернуть дискуссию" style="position:absolute; top:-5px; right:32px; -webkit-transform: scale(0.5); cursor: pointer; font-size: 20pt; line-height: 12pt; padding: 5px 11px 8px 11px; background: rgba(0,0,0,0.5); border-radius: 100px;">&nbsp;</div>');
    $popup = $('<div class="talkinator-popup-wrap" style="display: none; position:fixed; top:0; left:0; padding:20px 5px 5px 5px; background-color: rgba(180, 180, 180, 0.9); z-index: 10000000;"></div>');

    $popup
		.append($cls)
		.append($toggle)
		.prepend($ifr);

    $('#system_msg').after($popup);
}


// ------------------------------

function openPopup(postId) {
    if (!$popup) {
        createPopup();
    }

    $popup.find('iframe')
        .attr('src', 'https://talk.ru/wall' + postId + '#' + pid);
    $popup.show();
    $('body').css('overflow', 'hidden');
    adaptPopup();
}

// ------------------------------

function minimizePopup(){
	if($popup.hasClass('minimized')){
		return;
	}

    var rect = $('.talkinator-tab').get(0).getBoundingClientRect(),
        top = rect.top - rect.height/2.0;

	$popup
		.animate({height: 0, opacity: 0, top: top}, 600)
        .queue(function () {
            $(this).hide();
            $(this).dequeue();
        });

	setTimeout(function(){
		$('body').css('overflow', 'auto');
	}, 300);
	$popup.addClass('minimized');

    isPopupMinimized = true;
    alignTab();
}

// ------------------------------

function maximizePopup(quiq, notHiddenOverflow){
	if(!$popup.hasClass('minimized')){
		return;
	}
	
	var h = $window.height() - 25,
        time = (quiq === true) ? 0 : 600;
	$popup
        .queue(function () {
            if(!notHiddenOverflow){
                $(this).show();
            }
            $(this).dequeue();
        })
        .animate({height: h, opacity: 1, top:0}, time);

    if(!notHiddenOverflow){
        setTimeout(function(){
            $('body').css('overflow', 'hidden');
        }, 300);
    }
	$popup.removeClass('minimized');

    isPopupMinimized = false;
}

// ------------------------------

function togglePopup(){
	if($popup.hasClass('minimized')){
		maximizePopup();
	}else{
		minimizePopup();
	}
}

// ------------------------------

function closePopup() {
    $popup.find('iframe')
        .attr('src', 'about:blank');
    $popup.hide();
    $('body').css('overflow', 'auto');

    removeTab();
    maximizePopup(true, true);
}

// ------------------------------

function adaptPopup() {
    if($popup){
        var $w = $window,
            w = $w.width(),
            h = $w.height();
        $popup
            .height(h - 25)
            .width(w - 10);
    }
}

// ------------------------------

function createTab($talkinatorIcon, postId){
    var $tab = $(tabHTML.replace('<%= postId%>', postId));
    $('.talkinator-tab').remove();

    $talkinatorIcon.parents('.post_table')
        .append($tab);
}

// ------------------------------

function removeTab(){
    $('.talkinator-tab').remove();
}

// ------------------------------

function getUnhandledPosts() {
    return $('#page_wall_posts .post_table, #feed_rows .post_table').not('.discus_handled');
}

// ------------------------------

function alignTab(){
    if(isPopupMinimized){
        var $tab = $('.talkinator-tab'),
            $post = $tab.parents('.post_table'),
            tabRect = $tab.get(0).getBoundingClientRect(),
            postRect = $post.get(0).getBoundingClientRect(),
            windowH = $window.height();

        if(postRect.top > windowH/2.0){
            $tab.removeClass('bottom-align');
            $tab.addClass('top-align');

            checkDiscussionConditionality( windowH - postRect.top, $tab );
        }else{
            if(postRect.bottom < windowH/2.0){
                $tab.removeClass('top-align');
                $tab.addClass('bottom-align');

                checkDiscussionConditionality( postRect.bottom, $tab );
            }else{
                $tab.removeClass('bottom-align');
                $tab.removeClass('top-align');
            }
        }
    }
}

// ------------------------------

function checkDiscussionConditionality(postPieceInWindow, $tab){
    if(postPieceInWindow < 0){
        closePopup();
    }else{
        if(postPieceInWindow < 200){
            $tab.css({opacity: postPieceInWindow/203.0});
        }else{
            $tab.css({opacity: 0.99});
        }
    }
}

// ------------------------------

function findPostIdByPostElement($el) {
    return $el.parent().attr('id').substr(4);
}

// ------------------------------

function sendMessage(message) {
	minimizePopup();
	
    var postId = message.wallId + '_' + message.topicId;/*,
        onclick = "Wall.replyClick('" + postId + "', " + message.cid + ", event, " + message.uid + ")"; 

    $('.bfsb-' + postId)
        .attr('onclick', onclick);

    $('.bfsb-' + postId).get(0).click();
    console.log(message);*/ //debugger;
    if (message.uid) {
        replyAction(message.wallId, message.topicId, message.cid, message.uid, message.names);
    } else {
        commentPostAction(message.wallId, message.topicId);
    }

    /*setTimeout(function () {
        answerAction(postId, message.text);
    }, 300);*/
}

// ------------------------------

function replyAction(wallId, topicId, cid, uid, userNames) {
    var postId = wallId + '_' + topicId,
        commentId = wallId + '_' + cid,
        jsAction = 'cur.options.reply_names[' + uid + '] = [' + "'" + '<a href=&quot;&#47;id' + uid + '&quot; class=&quot;mem_link&quot;>' + userNames.dat.first_name + ' ' + userNames.dat.last_name + '<&#47;a>' + "'" + ', ' + "'" + userNames.nom.first_name + ', ' + "'" + '];',
        onclick = jsAction + "Wall.replyClick('" + postId + "', " + cid + ", event, " + uid + ");",
        $btn = $('<button style="position: absolute; top: 0px; right: 20px;" onclick="' + onclick + '">-1</button>');

    if ($('#wpt' + commentId).length) {
        $('#wpt' + commentId).get(0).click();
    } else {
        $('.bhb-' + postId).after($btn);
        $btn.get(0).click();
        $btn.remove();
    }

    answerFieldOnCenter(postId);
}

function commentPostAction(wallId, topicId) {
    var postId = wallId + '_' + topicId;
    $('#post' + postId + ' .post_table').get(0).click();
    $('#reply_fakebox' + postId + ', #reply_box' + postId).get(0).click();
}

// ------------------------------

function answerAction(postId, text) {

    $('#reply_field' + postId).val(text);

    $('#reply_button' + postId).get(0).click();
}

// -------------------------------

function answerFieldOnCenter(postId){
     var $replyBox = $('#reply_box' + postId),
         replyBoxRect = $replyBox.get(0).getBoundingClientRect(),
         windowH = $window.height(),
         scrollTopOld = $doc.scrollTop(),
         offset = replyBoxRect.top - windowH/2.0 + 25,
         scrollTop = scrollTopOld + offset;
    //debugger;
    setTimeout(function(){
        //debugger;
        $doc.scrollTop(scrollTop);
    }, 70);
}