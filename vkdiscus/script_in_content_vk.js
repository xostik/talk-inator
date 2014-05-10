var pid = Math.round(Math.random() * 100000),
    tunelObject = $.Callbacks(),
    lastMeaasageTime = (new Date).getTime();

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

// ------------------------------

function initHelperButtons() {
	setInterval(function(){
		getUnhandledPosts()
			.each(function(){
				var $el = $(this),
					postId = findPostIdByPostElement($el);
					
				$el
					.prepend('<button class="discus_btn discus_handled_btn bhb-' + postId + '" style="position: absolute; top: 0px; right: 20px; z-index: 10000000;" data-post-id="' + postId + '">go</button>')
					//.prepend('<button class="discus_for_send_btn bfsb-' + postId +  '" style="position: absolute; top: 0px; right: 20px;">-1</button>')
					.addClass('discus_handled');
			});
	}, 500);
	
	$(document).on('click', '.discus_handled_btn', function () {
	    var postId = $(this).data('post-id'),
            src = 'http://talk.ru/' + postId + '#' + pid,
            $ifr = $('<iframe style="width:700px; height:500px; position:fixed; top:20px; right:20px; z-index: 10000000;" src="' + src + '"></iframe>');
	    $('#system_msg').after($ifr);
	});
    //console.log(window);
    //onclick="Wall.replyClick(' + "'" +'961253_387' + "'" +', 394, event, 191414339)"
}

// ------------------------------

function getUnhandledPosts() {
    return $('#page_wall_posts .post_table').not('.discus_handled');
}

// ------------------------------

function findPostIdByPostElement($el) {
    return $el.parent().attr('id').substr(4);
}

// ------------------------------

function sendMessage(message) {
    var postId = message.wallId + '_' + message.topicId;/*,
        onclick = "Wall.replyClick('" + postId + "', " + message.cid + ", event, " + message.uid + ")"; 

    $('.bfsb-' + postId)
        .attr('onclick', onclick);

    $('.bfsb-' + postId).get(0).click();
    console.log(message);*/
    if (message.uid) {
        replyAction(message.wallId, message.topicId, message.cid, message.uid, message.names);
    } else {
        commentPostAction(message.wallId, message.topicId);
    }

    setTimeout(function () {
        answerAction(postId, message.text);
    }, 300);
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