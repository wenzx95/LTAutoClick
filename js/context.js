var flag = false;
var array;
var beginflag = false;
var nownum = 1;
var neednum = 1;
var time=2000;
var selectIndex = 0;
// setTimeout(getBuys(),4000);
init();
// var auto = setInterval(function () {
//     autoCilck(1);
// },4000);

function init() {
    getBuys();

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.type == "queryProductInfo"){
                sendResponse({type: "returnProductInfo","data":getBuys()});
            }else if(request.type == "beginClick"){
                neednum = request.neednum;
                time = request.timestamp*1000;
                selectIndex = request.selectIndex;
                auto = setInterval(function () {
                    autoCilck(selectIndex,neednum);
                },time);
            }else if(request.type == "endClick"){
                window.clearInterval(auto);
            }
        });
}


function autoCilck(index,neednum) {
     if(!checkIsYouhuo(index)){
         $(".optionInfo").children("li").children("a")[index].click();
     }else{
         changeNum(neednum);
         $(".buyBtn").children("a")[1].click();
         window.clearInterval(auto);
     }
}
function getBuys(){
    array = new Array();
    var buysArray = $(".optionInfo").children("li").children("a");
    for(var index =0;index<buysArray.length;index++){
        var obj = new Object();
        obj.index = index;
        obj.value = String(buysArray[index].getAttribute("value")).trim();
        obj.type = String(buysArray[index].getAttribute("data-addinptval")).trim();
        array.push(obj);
    }
    return array;
}
function getTime(){
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    console.log("当前时间戳为：" + timestamp);
}

function checkIsYouhuo(index) {
    var selectli = $(".optionInfo").children("li").eq(index);
    var spanArrlength = selectli.children("a").children("span.soldoutIcon").length;
    if(spanArrlength>0){
        return false;
    }else{
        return true;
    }
}

function changeNum(){
    if(nownum<neednum){
        addNum(neednum-nownum);
    }else if(nownum>neednum){
        minueNum(nownum-neednum);
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



