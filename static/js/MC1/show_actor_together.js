
var canvas = document.querySelector("#comm_wheel"),
    context = canvas.getContext("2d"),
    width = canvas.clientHeight,
    height = canvas.clientWidth;
var mapimg = new Image();
var svg_cavas = d3.select("#svg_map").append("svg:svg").attr("width", 1000).attr("height", 1000);
var svg = svg_cavas.append("g")
var svgmid = svg_cavas.append("g")
var svgtop = svg_cavas.append("g")
var svgvip = svg_cavas.append("g")

let id_slider;
let speed_slider;
let id_input;
/**
 * 初始化id滑块
 */
function id_slider_init() {
    //id_slider = document.getElementById("id_slider");
    //id_slider.onchange = id_select_changed;
    //id_slider.value = 0
    speed_slider = document.getElementById("speed_slider");
    speed_slider.value = 1
    speed_slider.max = 60
    speed_slider.min = 0
    speed_slider.onchange = speed_select_changed;
    //id_input = document.getElementById("id_input")
    //id_input.onchange = id_input_change
}
function id_input_change() {
    for (let i = 0; i < group.length; i++) {
        const el = group[i];
        if (el.id == id_input.value) {
            gid = i
            id_slider.value = i
            showLeven()
            return
        }
    }
}

function Start() {
    id_slider_init();
    mapimg.src = "/analyse/ParkMap.jpg";
    mapimg.onload = () => {
        context.drawImage(mapimg, 0, 0, 1000, 1000);
    }
    getLeven()
    //updateTimeLine(0)
}
let levenFliter = 0
let vipMap = new Map()
let leven = []
let group = []
let gid = 0;
let strength = 0
let speed = 1
async function getLeven() {
    group = []
    let rec = await d3.json("/api/users/actor")
    let list = document.getElementById("actor-list")
    let content = ""
    rec.forEach(a => {
        group.push(a.id)
        content+="<li>"+a.id+"</li>"
    })
    list.innerHTML = content
    //id_slider.max = group.length - 1
    console.log("获取数据完成")
    startTime++
    showLeven()
}
let startTime = 0;
async function showLeven() {
    pathbuff = []
    for (let i = 0; i < group.length; i++) {
        const d = group[i];
        let wantdraw = d
        //id_input.value = wantdraw
        let pathdata = await d3.json("/api/users/path?id=" + wantdraw);
        pathbuff.push(pathdata);
    }

    drawPath();
}


let betweenTime = 10;
let forceSetTime = -1;

var a = d3.rgb(255, 0, 0);
var b = d3.rgb(255, 200, 200);

var computeColor = d3.interpolate(b, a);
var linear = d3.scaleLinear()
    .domain([0, 150])
    .range([0, 1]);

var checkRectColor =
    x => d3.interpolate(d3.rgb("#00CC00"), d3.rgb("#FF3300"))(d3.scaleLinear()
        .domain([0, 200])
        .range([0, 1])(x))

let timetext = document.getElementById("Timestamp");
let previous = new Map();
let skiptime = 60;
let onlyvip = 0;

let k = 1 + 2;

var pause = false;

var neihigh_map = new Map();
var neiborUser = new Map();

let neibor = new Map()

function removeUserPath(d) {
    user_show_path.delete(d.id);
    let newbuff = [];
    pathbuff.forEach(p => {
        if (p.id != d.id)
            newbuff.push(p)
    })
    pathbuff = newbuff;
    drawPath()
}
let user_show_path = new Map();
let pathbuff = []
var p1 = d3.color(255, 0, 0)
var p2 = d3.color(0, 0, 0)
var pathColor = d3.interpolate(p1, p2);
var pathLinear = d3.scaleLinear()
    .domain([0, 20])
    .range([0, 1]);
function drawDPathTo(d, limittime) {
    //groupId.innerHTML = gid
    groupStrength.innerHTML = speed
    let allCheckIn = []
    for (let i = 0; i < d.pathlist.length; i++) {
        const daypath = d.pathlist[i];
        let color
        let checkinR = 10
        let checkinList = new Map()
        if (daypath.day == 5) {
            checkinR = 10
            color = d3.rgb(255, 100, 255)
        }
        if (daypath.day == 6) {
            checkinR = 7
            color = d3.rgb(100, 255, 100)
        }
        if (daypath.day == 7) {
            checkinR = 4
            color = d3.rgb(100, 100, 255)
        }
        context.beginPath();
        let begin = 0
        for (let j = 0; j < daypath.path.length; j++) {
            const point = daypath.path[j];
            if (j == 0) {
                context.moveTo(point.X * 10, (100 - point.Y) * 10)
            } else {
                context.lineTo(point.X * 10, (100 - point.Y) * 10)
                if (point.type == "check-in") {
                    if (!checkinList.has(point.X * 100 + point.Y)) {
                        checkinList.set(point.X * 100 + point.Y, { count: 1, X: point.X, Y: point.Y })
                    } else {
                        let c = checkinList.get(point.X * 100 + point.Y)
                        c.count++
                    }
                }
            }
        }
        //context.stroke();
        allCheckIn.push({ day: daypath.day, data: checkinList })
    }
    for (let i = 0; i < allCheckIn.length; i++) {
        const daypath = allCheckIn[i];
        let color
        let checkinR = 10
        if (daypath.day == 5) {
            checkinR = 10
            color = d3.rgb(255, 100, 255)
        }
        if (daypath.day == 6) {
            checkinR = 7
            color = d3.rgb(100, 255, 100)
        }
        if (daypath.day == 7) {
            checkinR = 4
            color = d3.rgb(100, 100, 255)
        }
        daypath.data.forEach((v, k) => {
            const point = v
            if (i == 0) {
                context.beginPath()
                context.arc(point.X * 10, (100 - point.Y) * 10, 12, 0, 2 * Math.PI)
                context.fillStyle = d3.rgb(255, 255, 255)
                context.shadowBlur = 20
                context.fill()
            }
            context.beginPath()
            context.arc(point.X * 10, (100 - point.Y) * 10, checkinR, 0, 2 * Math.PI)
            context.fillStyle = color
            context.fill()
        })



    }
    let timenow
    for (let i = 0; i < d.pathlist.length; i++) {
        const daypath = d.pathlist[i];
        if (daypath.day == theday) {
            context.beginPath();
            let begin = 0
            let pathi = 0
            
            let iiii = 0
            for (let j = begin; j < daypath.path.length; j++) {
                timenow = daypath.path[j].Timestamp
                let dateobj = new Date(Date.parse(timenow))
                let ttime = new Date(2014, 6, theday + 1, dateobj.getHours(), dateobj.getMinutes(), dateobj.getSeconds(), 0).getTime()
                if (ttime > limittime) {
                    pathi = j;
                    break;
                }
            }
            if (pathi - 20 >= 0)
                begin = pathi - 20
            for (let j = begin; j < daypath.path.length && j < pathi; j++) {
                const point = daypath.path[j];
                if (j == 0) {
                    context.moveTo(point.X * 10, (100 - point.Y) * 10)
                } else {
                    context.lineTo(point.X * 10, (100 - point.Y) * 10)
                    let dis = distance(point, daypath.path[j - 1])
                    if (dis > 5) {
                        context.strokeStyle = d3.rgb(222, 222, 222);
                        context.lineWidth = 2
                        context.stroke()
                        context.beginPath()
                    } else if (dis <= 5) {
                        context.strokeStyle = computeColor(pathLinear(iiii))
                        context.lineWidth = 5
                        context.stroke()
                        context.beginPath()
                    }
                    context.moveTo(point.X * 10, (100 - point.Y) * 10)
                }
                iiii++
            }
            context.stroke();
        }
    }
}
function beginDrawFunc(id, starttime, timenow) {
    if (gid != id || startTime != starttime)
        return
    context.clearRect(0, 0, 1000, 1000);
    context.drawImage(mapimg, 0, 0, 1000, 1000);
    pathbuff.forEach(d => {
        drawDPathTo(d, timenow)
    })
    if (timenow) {
        let dateobj = new Date(timenow)
        timetext.innerHTML = dateobj.getMonth() + "月 " + (dateobj.getDay() + 6) + "日: " + dateobj.getHours() + "时 " + dateobj.getMinutes() + "分 " + dateobj.getSeconds() + "秒"
    }
    timenow += 1000 * speed
    setTimeout(() => {
        beginDrawFunc(id, starttime, timenow)
    }, 50);
}

function drawPath() {
    startTime++
    beginDrawFunc(gid, startTime, (new Date(2014, 6, theday + 1, 8, 0, 0, 0)).getTime())
}
let groupId = document.getElementById("group-id")
let groupStrength = document.getElementById("group-strength")

/**
 * 将坐标转换为字典可用的id
 * @param {int} x 
 * @param {int} y 
 */
function pos2id(x, y) {
    return x + "," + y;
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.X - p2.X, 2) + Math.pow(p1.Y - p2.Y, 2))
}

function id_select_changed() {
    gid = id_slider.value;
    id_input.value = group[gid].id
    showLeven()
}
function speed_select_changed() {
    speed = speed_slider.value
}
var theday = 7;

let checked = []


function switchTo(to_day) {
    theday = to_day;
    showLeven()
}

Start()
