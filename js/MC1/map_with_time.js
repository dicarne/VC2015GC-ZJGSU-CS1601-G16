// * * * * * * * * * * * * * * * * * * * * * * * * * * *
// * Ding jiahe Created 2019-5-24 
// * 用于绘制用户在园内一天的路径图
// * State:     ~. 开发中
// * Complete:  1. 通过滑块切换不同用户进行观察
// *            2. 路线根据时间顺序渐变显示
// * Todo:      1. 切换三天的数据
// *            2. 分析比较不同用户之间的关系
// *            3. 根据时间动态显示多个用户的行动状况
// * * * * * * * * * * * * * * * * * * * * * * * * * * *

let MapData = new Map();

var canvas = document.querySelector("#comm_wheel"),
    context = canvas.getContext("2d"),
    width = canvas.clientHeight,
    height = canvas.clientWidth;

var MapDataArray;
let CurrentDataIndex;
var posdata = [];
var mapimg = new Image();
var maploaded = false;
/**
 * 开始一切分析，导入数据，初始化
 */
export async function Start() {
    id_slider_init();
    mapimg.src = "../analyse/ParkMap.jpg";
    mapimg.onload = function() {
        maploaded = true;
    }
    await d3.csv("../../data/MC1 Data 2015/park-movement-Fri-FIXED-2.0.csv", d => {
        let idmap = MapData.get(d.id);
        if (!idmap) {
            MapData.set(d.id, new Map());
            idmap = MapData.get(d.id);
        }
        idmap.set(d.Timestamp, { id: d.id, Timestamp: d.Timestamp, type: d.type, x: d.X * 10, y: d.Y * 10 })
        posdata.push(d);
    });
    MapDataArray = Array.from(MapData.keys());
    id_slider.min = 0;
    id_slider.max = MapDataArray.length - 1;
    CurrentDataIndex = id_slider.value;
    //DrawTravelLine(MapDataArray[id_slider.value]);
    //UpdateOneUserLine();
    UpdateAllUsersWithTime();
}

/**
 * 不停检查id滑块是否移动，是则更新路线图
 */
function UpdateOneUserLine() {
    setTimeout(() => {
        if (CurrentDataIndex !== id_slider.value) {
            CurrentDataIndex = id_slider.value;
            DrawTravelLine(MapDataArray[CurrentDataIndex]);
        }
        UpdateOneUserLine();
        DrawLoop();
    }, 100);
}

/**
 * 用于绘制一个用户一天中的行动路线
 * TODO: 检查站应该被标出来
 * @param {number} id 用户id
 */
function DrawTravelLine(id) {
    drawData = [];
    drawDataIndex = 0;
    console.log(id);
    context.clearRect(0, 0, width, height);

    // 在这里设置路线图的渐变效果
    var a = d3.rgb(66, 251, 75);//浅绿
    var b = d3.rgb(2, 100, 7);//深绿
    var color = d3.interpolate(a, b);//颜色插值函数

    var posdata = MapData.get(id);

    // 根据每一项数据记录依次绘制路线图
    let arr = Array.from(posdata.values());
    for (let i = 0; i < arr.length - 1; i++) {
        let data = {
            array: new Array()
        }
        data.array.push({
            begin: arr[i],
            end: arr[i + 1],
        });
        DrawMap(data);
    }
    console.log("end");
}

let id_slider;
/**
 * 初始化id滑块
 */
function id_slider_init() {
    id_slider = document.getElementById("id_slider");
    id_slider.onchange = id_select_changed;
}

/**
 * 滑块值改变时立即触发更新路线图
 * @param {*} event 滑动事件
 */
function id_select_changed(event) {
    console.log(id_slider.value);
    DrawTravelLine(MapDataArray[id_slider.value]);
    CurrentDataIndex = id_slider.value;
}
/**
 * 数据绘制列表
 */
let drawData = [];
let drawDataIndex = 0;
function DrawMap(data) {
    drawData.push(data);
}

/**
 * 根据drawData中的数据依次绘制路线
 */
function DrawLoop() {
    if (drawData.length == 0 || drawDataIndex >= drawData.length) return;

    let data = drawData[drawDataIndex];
    drawDataIndex++;
    let arr = data.array;
    for (let i = 0; i < arr.length; i++) {
        const ele = arr[i];
        context.beginPath();
        context.moveTo(ele.begin.x, ele.begin.y);
        context.lineTo(ele.end.x, ele.end.y);
        context.stroke();
    }
}

/*************************************************************** */
function UpdateAllUsersWithTime() {
    setTimeout(() => {
        DrawAllUsersPos();
        UpdateAllUsersWithTime();
    }, 10);
}

var UAUWT_index = 0;
var PassedTimeQueue = [];
var timetext;
var LastUsers = new Map();
function DrawAllUsersPos() {
    if (!timetext)
        timetext = document.getElementById("Timestamp");
    context.clearRect(0, 0, width, height);
    context.drawImage(mapimg,0,0,1000, 1000)
    if (UAUWT_index >= posdata.length) {
        UAUWT_index = 0;
        LastUsers = new Map();
    }
    let currentTime = posdata[UAUWT_index].Timestamp;
    let CurrentUsersPos = new Map();
    // 将当前时间戳的所有用户保存起来
    while (posdata[UAUWT_index].Timestamp == currentTime) {
        let thisuser = posdata[UAUWT_index];
        let key = thisuser.X + "," + thisuser.Y;
        if (!CurrentUsersPos.has(key))
            CurrentUsersPos.set(key, []);
        CurrentUsersPos.get(key).push(thisuser);
        UAUWT_index++;
    }
    let CurrentUsers = new Map();
    // 绘制当前时间和前一个时刻的用户位置及方向
    CurrentUsersPos.forEach((value) => {
        context.beginPath();
        context.arc(value[0].X * 10, 1000 - value[0].Y * 10, 3, 0, 2 * Math.PI);
        for (let i = 0; i < value.length; i++) {
            const ele = value[i];
            CurrentUsers.set(ele.id, ele);
            const pre = LastUsers.get(ele.id);
            if (pre) {
                context.moveTo(pre.X * 10, 1000 - pre.Y * 10);
                context.lineTo(ele.X * 10, 1000 - ele.Y * 10);
                context.stroke();
            }
        }
        context.fillStyle = "#000";
        context.fill();
    })

    LastUsers.forEach((value) => {
        context.beginPath();
        context.arc(value.X * 10, 1000 - value.Y * 10, 2, 0, 2 * Math.PI);
        context.fillStyle = "#aaa";
        context.fill();
    })

    timetext.innerHTML = currentTime;
    PassedTimeQueue.push(currentTime);
    CurrentUsers.forEach((value, key) => {
        LastUsers.set(key, value);
    })
}