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

/**
 * 开始一切分析，导入数据，初始化
 */
export async function Start() {
    id_slider_init();

    var data = await d3.csv("../../data/MC1 Data 2015/park-movement-Fri-FIXED-2.0.csv", d => {
        let idmap = MapData.get(d.id);
        if (!idmap) {
            MapData.set(d.id, new Map());
        }
        idmap = MapData.get(d.id);
        idmap.set(d.Timestamp, { id: d.id, Timestamp: d.Timestamp, type: d.type, x: d.X * 10, y: d.Y * 10 })
    });
    MapDataArray= Array.from(MapData.keys());
    id_slider.min = 0;
    id_slider.max = MapDataArray.length - 1;
    CurrentDataIndex = id_slider.value;
    DrawTravelLine(MapDataArray[id_slider.value]);
    Update();
}

/**
 * 不停检查id滑块是否移动，是则更新路线图
 */
function Update(){
    setTimeout(() => {
        if(CurrentDataIndex !== id_slider.value){
            CurrentDataIndex = id_slider.value;
            DrawTravelLine(MapDataArray[CurrentDataIndex]);
        }
        Update();
    }, 100);
}

/**
 * 用于绘制一个用户一天中的行动路线
 * TODO: 检查站应该被标出来
 * @param {number} id 用户id
 */
function DrawTravelLine(id) {
    console.log(id);
    context.clearRect(0,0,width,height);

    // 在这里设置路线图的渐变效果
    var a = d3.rgb(66, 251, 75);//浅绿
    var b = d3.rgb(2, 100, 7);//深绿
    var color = d3.interpolate(a, b);//颜色插值函数

    var posdata = MapData.get(id);

    // 根据每一项数据记录依次绘制路线图
    let ix = -100, iy = -100;
    let fg = true;
    let arr = Array.from(posdata.values());
    for (let i = 0; i < arr.length; i++) {
        const ele = arr[i];
        ix = ele.x;
        iy = ele.y;
        
        if (fg) {
            context.beginPath();
            context.moveTo(ix, iy);
            fg = false;
        }
        context.lineTo(ix, iy);
        context.strokeStyle = color(i / arr.length);
        context.stroke();

        context.beginPath();
        context.moveTo(ix, iy);
    }

    console.log("end");
}

let id_slider;
/**
 * 初始化id滑块
 */
function id_slider_init(){
    id_slider = document.getElementById("id_slider");
    id_slider.onchange = id_select_changed;
}

/**
 * 滑块值改变时立即触发更新路线图
 * @param {*} event 滑动事件
 */
function id_select_changed(event){
    console.log(id_slider.value);
    DrawTravelLine(MapDataArray[id_slider.value]);
    CurrentDataIndex = id_slider.value;
}