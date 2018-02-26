var haveSelect = false;
var haveData = false;
var isend = true;
var data;
init();

function init() {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.type == "saveData") {
                data = request.data;
                haveData = true;
                haveSelect = true;
            }else if(request.type == "queryBgWhileNoSelect"){
                haveSelect = false
                if(haveData == false){
                    sendResponse({"type":"returnQueryBgWhileNoSelect","flag":false});
                }else{
                    sendResponse({"type":"returnQueryBgWhileNoSelect","flag":true,"data":data,"isend":isend});
                }
            }else if(request.type == "clearOrInitDataWhileNoSelect"){
                cleanData();
            }else if(request.type == "beginWhileNoSelectFromPopup"){
                data = request.data;
                haveData = true;
                haveSelect = false;
                isend = false;
                sendResponse({"type":"returnBeginWhileNoSelectFromPopup"});
            }else if(request.type == "over"){
                cleanData();
                chrome.runtime.sendMessage({"type": "playmusic"}, function(response) { });
            }
        });
}

function cleanData(){
    data = null;
    isend = true;
    haveSelect = false;
    haveData = false

}

function getDataFlag(){
    return haveData;
}

function getData() {
    if(haveSelect) {
        return data;
    }else{
        var arr = new Array();
        var obj = new Object();
        obj.index = -1;
        obj.type = "不存在色号选择";
        arr.push(obj);
        data.productInfo = arr;
        return data;
    }
}