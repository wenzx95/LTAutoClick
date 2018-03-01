var isRefresh = false;
var bg;
var maxNum;
var productInfo;
var haveSelect = false;
$(document).ready(function () {
        addListener();
        initData();
    });

function initData() {
    bg = chrome.extension.getBackgroundPage();
    if(bg.getDataFlag()){
        $("#proType").empty();
        var data = bg.getData();
        $("#time").val(data.time);
        addOption(data.productInfo,maxNum);
        // $("#qty").val(data.neednum);
        $("#neednum").val(data.neednum);
        $("#proType").val(data.selectIndex);
        isRefresh = true;
    }
}

function refresh() {
    $("#proType").empty();
    queryProductInfo();
    isRefresh = true;
}

function begin() {
    if(!isRefresh){
        alert("请先刷新获取数据");
        return;
    }
    var timestamp = $("#time").val();
    // var neednum = $("#qty").val();
    var neednum = $("#neednum").val();
    var selectIndex = $("#proType").val();
    if(timestamp==""||neednum==""){
        alert("请输入时间间隔");
        return;
    }
    saveData(timestamp,neednum,selectIndex);
    if(haveSelect){
        chrome.tabs.query(
            {active: true, currentWindow: true},
            function(tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {"type": "beginClick","neednum":neednum,"timestamp":timestamp,"selectIndex":selectIndex},
                    function(response) {

                    });
            });
    }else{
        var data = new Object();
        data.selectIndex = -1;
        data.neednum = neednum;
        data.time = timestamp;
        chrome.runtime.sendMessage({"type": "beginWhileNoSelectFromPopup","data":data}, function(response) {
            if(response.type == "returnBeginWhileNoSelectFromPopup"){
                reloadContextPage();
            }
        });
    }
}

function end() {
    if(haveSelect){
        chrome.tabs.query(
            {active: true, currentWindow: true},
            function(tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {"type": "endClick"},
                    function(response) {

                    });
            });
    }else{
        bg.cleanData();
    }
}

function queryProductInfo(){
    chrome.tabs.query(
        {active: true, currentWindow: true},
        function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {type: "queryProductInfo"},
                function(response) {
                    if(response.type == "returnProductInfo") {
                        if (response.haveSelect == true) {
                            haveSelect = true;
                            productInfo = response.data;
                            maxNum = response.maxNum;
                            addOption(response.data,maxNum);
                        }else{
                            haveSelect = false;
                            maxNum = response.maxNum;
                            chrome.runtime.sendMessage({"type": "clearOrInitDataWhileNoSelect"}, function(response) {
                                var arr = new Array();
                                var obj = new Object();
                                obj.index = -1;
                                obj.type = "不存在色号选择";
                                arr.push(obj);
                                addOption(arr,maxNum);
                            });
                        }
                    }
                });
        });
}

function addOption(data,maxNum){
    for(var i=0;i<data.length;i++){
        $("#proType").append("<option value='"+data[i].index+"'>"+data[i].type+" </option>");
    }
    // for(var i=0;i<maxNum;i++){
    //     var tmp = i+1;
    //     $("#qty").append("<option value='"+tmp+"'>"+tmp+" </option>");
    // }
}

function saveData(timestamp,neednum,selectIndex) {
    var data = new Object();
    data.neednum = neednum;
    data.selectIndex = selectIndex;
    data.timestamp = timestamp;
    data.productInfo = productInfo;
    chrome.runtime.sendMessage({"type": "saveData","data":data}, function(response) { });
}

function reloadContextPage(){
    chrome.tabs.query(
        {active: true, currentWindow: true},
        function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {type: "reloadContextPage"},
                function(response) {

                });
        });
}

function addListener() {
    $("#refresh").click(refresh);
    $("#begin").click(begin);
    $("#end").click(end);
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.type == "playmusic") {
                $("#mp3")[0].play();
            }
        });
}