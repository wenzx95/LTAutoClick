var haveData = false;
var data;
init();

function init() {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.type == "saveData") {
                data = request.data;
                haveData = true;
            }
        });
}

function getDataFlag(){
    return haveData;
}

function getData() {
    return data;
}