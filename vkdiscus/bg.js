chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.type == 'messageFromDiscusSide') {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'toVkSide', message: request.message, pid: request.pid }, function (response) { });
            });
            return true;
        }
		
		if (request.type == 'messageFromVKSide') {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'toDiscusSide', message: request.message, pid: request.pid }, function (response) { });
            });
            return true;
        }
    }
);