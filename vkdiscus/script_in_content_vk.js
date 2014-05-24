var pid = Math.round(Math.random() * 100000),
    tunelObject = $.Callbacks(),
    lastMeaasageTime = (new Date).getTime(),
    $popup;

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
        .append('<style>.discus_btn{display:none; position: absolute; top: -8px; left: -132px; width:16px; height:25px; background:url(http://talk.ru/i/talk-icn.png) 0 0 no-repeat;} .wide_wall_module .discus_btn{left:-262px} .post:hover .discus_btn{display:block;} .toggle-talkinator:before{content:""; position:absolute; width:10px; height:0px; border: 1px solid white; top: 13px; left: 9px; border-radius: 2px;} .minimized .toggle-talkinator:before{content:""; position:absolute; width:10px; height:10px; border: 2px solid white; top: 7px; left: 8px; border-radius: 2px;} </style>');

	setInterval(function(){
		getUnhandledPosts()
			.each(function(){
				var $el = $(this),
					postId = findPostIdByPostElement($el);
				
				$el
					.addClass('discus_handled');

			    $('#post' + postId + ' .post_full_like_wrap')
					.append('<a class="discus_btn discus_handled_btn bhb-' + postId + '" data-post-id="' + postId + '" href="javascript:;" title="Открыть дискуссию в талкинаторе"></a>');
					//.prepend('<button class="discus_for_send_btn bfsb-' + postId +  '" style="position: absolute; top: 0px; right: 20px;">-1</button>');
			});
	}, 500);
	
	$(document).on('click', '.discus_handled_btn', function () {
	        var postId = $(this).data('post-id');
	        openPopup(postId);
	    })
        .on('click', '.close-talkinator', closePopup)
		.on('click', '.toggle-talkinator', togglePopup);

	$(window).resize(adaptPopup);
    //console.log(window);
    //onclick="Wall.replyClick(' + "'" +'961253_387' + "'" +', 394, event, 191414339)"
}


// ------------------------------

function creatPopup() {
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
        creatPopup();
    }

    $popup.find('iframe')
        .attr('src', 'http://talk.ru/wall' + postId + '#' + pid);
    $popup.show();
    $('body').css('overflow', 'hidden');
    adaptPopup();
}

// ------------------------------

function minimizePopup(){
	if($popup.hasClass('minimized')){
		return;
	}
	$popup
		.animate({height: 0}, 600)
	.find('iframe')
		.fadeOut('slow');
	setTimeout(function(){
		$('body').css('overflow', 'auto');
	}, 300);
	$popup.addClass('minimized');
}

// ------------------------------

function maximizePopup(){
	if(!$popup.hasClass('minimized')){
		return;
	}
	
	var h = $(window).height() - 25; 
	$popup
		.animate({height: h}, 600)
	.find('iframe')
		.fadeIn('slow');
	setTimeout(function(){
		$('body').css('overflow', 'hidden');
	}, 300);
	$popup.removeClass('minimized');
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
}

// ------------------------------

function adaptPopup() {
    var $w = $(window),
        w = $w.width(),
        h = $w.height();
    $popup
        .height(h - 25)
        .width(w - 10);
}

// ------------------------------

function getUnhandledPosts() {
    return $('#page_wall_posts .post_table, #feed_rows .post_table').not('.discus_handled');
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