var neednum = 1;
var time=2000;
var selectIndex = 0;
var haveSelect;//有没有色号
var pageType;
var firstflag = true;

$(document).ready(function () {
    init();
    // test();
});

function test() {
    addListener();
    // setTimeout(alert($("#qty").val()),5000);
}

function init() {
    initData();
    // getPageAndProductInfo();
    addListener();
    queryBgWhileNoSelect();
}

function initData(){
    setPageType();
    setHaveSelect();
}

function setPageType() {
    var length = $(".prouct-info").length;
    if(length == 0){    //迪奥999的界面为0
        pageType = 0;
    }else{              //另一个界面为1
        pageType = 1;
    }
}

function setHaveSelect() {
    if(pageType == 0){
        var optionInfo = $(".optionInfo").children("li").children("a");
        if(optionInfo.length > 0){
            haveSelect = true;
        }else{
            haveSelect = false;
        }
    }else if(pageType == 1){
        var colorList = $(".colorList");
        if(colorList.length > 0){
            haveSelect = true;
        }else{
            haveSelect = false;
        }
    }
}


function addListener(){
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.type == "queryProductInfo"){
                sendResponse({"type": "returnProductInfo","data":getPageAndProductInfo(),"haveSelect":haveSelect,"maxNum":getMaxNum()});
            }else if(request.type == "beginClick"){
                neednum = request.neednum;
                time = request.timestamp*1000;
                selectIndex = request.selectIndex;
                firstflag = true;
                auto = setInterval(function () {
                    autoCilck(selectIndex,neednum);
                },time);
            }else if(request.type == "endClick"){
                window.clearInterval(auto);
            }else if(request.type == "reloadContextPage"){
                location.reload();
            }
        });
}

function queryBgWhileNoSelect() {
    if(haveSelect == false){
        chrome.runtime.sendMessage({"type": "queryBgWhileNoSelect"}, function(response) {
            if(response.type == "returnQueryBgWhileNoSelect"){
                if(response.flag == false){

                }else if(response.flag == true && response.isend == false){
                    time = response.data.timestamp;
                    neednum = response.data.neednum;
                    setTimeout(autoClickWhileNoSelect(neednum),time);
                }
            }
        });
    }
}

function getPageAndProductInfo(){
    var array = new Array();
    if(haveSelect) {
        if(pageType==0) {
            var optionInfo = $(".optionInfo").children("li").children("a");
            for (var index = 0; index < optionInfo.length; index++) {
                var obj = new Object();
                obj.index = index;
                obj.value = String(optionInfo[index].getAttribute("value")).trim();
                obj.type = String(optionInfo[index].getAttribute("data-addinptval")).trim();
                array.push(obj);
            }
            return array;
        }else{
            var colorList = $(".colorList").children("a");
            for(var index = 0;index<colorList.length;index++){
                var obj = new Object();
                obj.index = index;
                obj.value = String(colorList[index].getAttribute("data-prdoptno")).trim();
                obj.type = String(colorList[index].getAttribute("data-addinptval")).trim();
                array.push(obj);
            }
            return array;
        }
    }else{
        return null;
    }
}

function autoClickWhileNoSelect(neednum) {
    if(pageType == 0) {
        var tmp = $(".buyBtn:not(.soldOut)").length;
        if (tmp == 0) {
            location.reload();
        } else {
            changeNum(neednum);
            $(".buyBtn:not(.soldOut)").children("a")[1].click();
            chrome.runtime.sendMessage({"type": "over"}, function (response) {

            });
        }
    }else if(pageType == 1){
        checkAjaxOver(function () {
            if(checkIsYouhuo(-1)){
                changeNum(neednum);
                $(".btn").children("a")[0].click();
                chrome.runtime.sendMessage({"type": "over"}, function (response) {

                });
            }else{
                location.reload();
            }
        })
    }
}

function autoCilck(index,neednum) {
    if(pageType == 0) {
        if (firstflag) {
            $(".optionInfo").children("li").children("a")[index].click();
            firstflag = false;
        } else {
            if (!checkIsYouhuo(index)) {
                $(".optionInfo").children("li").children("a")[index].click();
            } else {
                changeNum(neednum);
                $(".buyBtn").children("a")[1].click();
                window.clearInterval(auto);
                chrome.runtime.sendMessage({"type": "over"}, function (response) {

                });
            }
        }

    }else if(pageType == 1){
        checkAjaxOver(function () {
            if(firstflag){
                $(".colorList").children("a")[index].click();
                firstflag = false;
            }else{
                if (!checkIsYouhuo(index)) {
                    $(".colorList").children("a")[index].click();
                } else {
                    changeNum(neednum);
                    $(".btn").children("a")[0].click();
                    window.clearInterval(auto);
                    chrome.runtime.sendMessage({"type": "over"}, function (response) {

                    });
                }
            }
        });
    }
}

function getTime(){
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    console.log("当前时间戳为：" + timestamp);
}

function checkIsYouhuo(index) {
    if(pageType == 0) {
        var selectli = $(".optionInfo").children("li").eq(index);
        var spanArrlength = selectli.children("a").children("span.soldoutIcon").length;
        if (spanArrlength > 0) {
            return false;
        } else {
            return true;
        }
    }else if(pageType == 1){
        var data = $(".btn").children("a").children("img")[0].getAttribute("alt");
        if(data == "立即购买"){
            return true;
        }else{
            return false;
        }
    }
}

function changeNum() {
    if (pageType == 0) {
        var nownum = getNowNum();
        if (nownum < neednum) {
            addNum(neednum - nownum);
        } else if (nownum > neednum) {
            minueNum(nownum - neednum);
        }
    }else if(pageType == 1){
        $("#qty").val(neednum)
    }
}


function addNum(num) {
    for(var i=0;i<num;i++){
        $(".btnSpin.up")[0].click();
    }
}

function minueNum(num) {
    for(var i=0;i<num;i++){
        $(".btnSpin.down")[0].click();
    }
}

function getNowNum() {
    return $("#qty").val();
}

function getMaxNum(){
    if(pageType == 0){
        return $("#qty").attr("data-minqty");
    }else if(pageType == 1){
        return $("#qty").children("option").length;
    }
}

function checkAjaxOver(Func){
    var btn = $("#qty");
    if(btn.length>0){
        Func();
    }else{
        setTimeout(function(){
            checkAjaxOver(Func);},500);
    }
}



