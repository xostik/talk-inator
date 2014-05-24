var vk_pid = location.hash.substr(1) - 0,
    qObj = getPath(),
    qDetails = getDetails(qObj);


//------------------

function getPath() {
    return location.pathname.substr(1)

    /*var s = location.search.substr(1),
        res = s.split('&'),
        result = {},
        tmp;
    for (var i = 0, ii = res.length; i < ii; i++) {
        tmp = res[i].split('=');
        result[tmp[0]] = tmp[1];
    }
    return result;*/
}

//------------------

function getDetails(s) {
    var tmp = s.split('_');
    return {
        wallId: tmp[0].substr(4),
        topicId: tmp[1]
    };
}

init();

// ------------------------------

function init() {
    initHandlers();
}

// ------------------------------

function sendMessage(message) {
    if (vk_pid != '') {
        chrome.runtime.sendMessage({ type: 'messageFromDiscusSide', pid: vk_pid, message: message }, function (response) { });
    }
}

// ------------------------------

function initHandlers() {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.type == 'toDiscusSide' && vk_pid == request.pid) {
                handleMessageFromVK(request.message);
            }
        }
    );

    setTimeout(function () {
		if (vk_pid != ''){
			$(document).on('click', '.comment-post, .reply-comment', function(){
				setTimeout( commentMode, 50 );
			});
		
		}

        $('.action-panel .send').click(function () {
            var $wrap = $(this).parents('.answer-area'),
                $reply = $wrap.find('.reply-subject .val'),
                replyUID = $reply.attr('data-subject-uid'),
                replyCID = $reply.attr('data-subject-cid'),
                replyUserDatFirstName = $reply.attr('data-dat-first-name'),
                replyUserDatLastName = $reply.attr('data-dat-last-name'),
                replyUserNomFirstName = $reply.attr('data-nom-first-name'),
                tx = $wrap.find('.answer-text').val(),
                message = {
                    text: tx,
                    wallId: qDetails.wallId,
                    topicId: qDetails.topicId
                };
            
            if (tx.length > 0) {
                if (replyUID) {
                    message.cid = replyCID;
                    message.uid = replyUID;
                    message.names = {
                        dat: {
                            first_name: replyUserDatFirstName,
                            last_name: replyUserDatLastName
                        },
                        nom: {
                            first_name: replyUserNomFirstName
                        }
                    };
                }
                sendMessage(message);
            }
        });
    }, 700);
}

// ------------------------------

function commentMode(){
	var $wrap = $('.answer-area'),
		$reply = $wrap.find('.reply-subject .val'),
		replyUID = $reply.attr('data-subject-uid'),
		replyCID = $reply.attr('data-subject-cid'),
		replyUserDatFirstName = $reply.attr('data-dat-first-name'),
		replyUserDatLastName = $reply.attr('data-dat-last-name'),
		replyUserNomFirstName = $reply.attr('data-nom-first-name'),
		tx = $wrap.find('.answer-text').val(),
		message = {
			text: tx,
			wallId: qDetails.wallId,
			topicId: qDetails.topicId
		};
	

	if (replyUID) {
		message.cid = replyCID;
		message.uid = replyUID;
		message.names = {
			dat: {
				first_name: replyUserDatFirstName,
				last_name: replyUserDatLastName
			},
			nom: {
				first_name: replyUserNomFirstName
			}
		};
	}
	sendMessage(message);
}

// ------------------------------

function handleMessageFromVK(message){
	$('#receiver')
		.attr('data-message', JSON.stringify(message))
		.click();
}