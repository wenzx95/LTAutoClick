var isRefresh = false;
var productInfo;
var bg;
$(document).ready(function () {
        bg = chrome.extension.getBackgroundPage();
        $("#refresh").click(refresh);
        $("#begin").click(begin);
        $("#end").click(end);
        if(bg.getDataFlag()){
            $("#proType").empty();
            var data = bg.getData();
            $("#time").val(data.time);
            $("#neednum").val(data.neednum);
            addOption(data.productInfo);
            productInfo = data.productInfo;
            $("#proType").val(data.selectIndex);
            isRefresh = true;
        }
    }
);

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
    var neednum = $("#neednum").val();
    var selectIndex = $("#proType").val();
    if(timestamp==""||neednum==""){
        alert("请输入数量或者时间间隔");
        return;
    }
    saveData(timestamp,neednum,selectIndex);
    chrome.tabs.query(
        {active: true, currentWindow: true},
        function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {"type": "beginClick","neednum":neednum,"timestamp":timestamp,"selectIndex":selectIndex},
                function(response) {

                });
        });
}

function end() {
    chrome.tabs.query(
        {active: true, currentWindow: true},
        function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {"type": "endClick"},
                function(response) {

                });
        });
}

function queryProductInfo(){
    chrome.tabs.query(
        {active: true, currentWindow: true},
        function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {type: "queryProductInfo"},
                function(response) {
                    if(response.type == "returnProductInfo"){
                        productInfo = response.data;
                        addOption(response.data);
                    }
                });
        });
}

function addOption(data){
    for(var i=0;i<data.length;i++){
        $("#proType").append("<option value='"+data[i].index+"'>"+data[i].type+" </option>");
    }
    // $("#proType").val(0);
    }

function saveData(timestamp,neednum,selectIndex) {
    var data = new Object();
    data.neednum = neednum;
    data.selectIndex = selectIndex;
    data.time = timestamp;
    data.productInfo = productInfo;
    chrome.runtime.sendMessage({"type": "saveData","data":data}, function(response) { });
}