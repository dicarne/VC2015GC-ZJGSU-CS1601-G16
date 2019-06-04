
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
    id_slider = document.getElementById("id_slider");
    id_slider.onchange = id_select_changed;
    id_slider.value = 0
    speed_slider = document.getElementById("speed_slider");
    speed_slider.value = 0
    speed_slider.max = 5
    speed_slider.min = 0
    speed_slider.onchange = speed_select_changed;
    id_input = document.getElementById("id_input")
    id_input.onchange = id_input_change
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
async function getLeven() {
    group = ["1983765", "1723967", "1089132"]
    id_slider.max = group.length - 1
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
        id_input.value = wantdraw
        let pathdata = await d3.json("/api/users/path?id=" + wantdraw);
        pathbuff.push(pathdata);
    }

    drawPath();
}


let betweenTime = 10;
let forceSetTime = -1;
function updateTimeLine(t) {
    setTimeout(() => {
        if (forceSetTime >= 0) {
            t = forceSetTime;
            forceSetTime = -1;
        }
        showPosAtTime(t);
    }, betweenTime);
}
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
async function showPosAtTime(time_t) {
    let time_should_be = theday
    if (time_t == 0) {
        let time_length = await d3.json("/api/map/max?day=" + theday)
        id_slider.value = 0;
        id_slider.max = time_length.length;
    }
    let timedata;
    if (pause) {
        setTimeout(() => {
            updateTimeLine(time_t)
        }, 500);

        return
    }
    for (let i = 0; i < skiptime; i++) {
        let url = "/api/map/time?day=" + theday + "&time=" + time_t + "&important=" + onlyvip + "&leven=1"
        if (checked.length > 0) {
            for (let i = 0; i < checked.length; i++) {
                url += "&check[" + i + "]=" + checked[i]
            }
        }
        timedata = await d3.json(url);
        if (time_should_be != theday) {
            updateTimeLine(forceSetTime)
            return;
        }
        time_t++;
        let map = new Array(10000);
        if (timedata == null)
            updateTimeLine(time_t)
        let current = timedata.array;
        previous.forEach(user => {
            user.lastUpdate++;
        })
        current.forEach(user => {
            user.lastUpdate = 0;
            previous.set(user.id, user);
        });
    }

    let drawdata = Array.from(previous.values());
    drawSpot(drawdata)
    drawUsers(drawdata)
    let date = timedata.Timestamp
    let dateobj = new Date(Date.parse(date.Timestamp))
    timetext.innerHTML = dateobj.getMonth() + "月 " + (dateobj.getDay() + 6) + "日: " + dateobj.getHours() + "时 " + dateobj.getMinutes() + "分 " + dateobj.getSeconds() + "秒"

    updateTimeLine(time_t)
}
let k = 1 + 2;

var pause = false;

var neihigh_map = new Map();
var neiborUser = new Map();


let neibor = new Map()
async function drawUserPath(d) {
    pathbuff = []
    user_show_path.clear()
    user_show_path.set(d.id, d)
    neiborUser = new Map();
    neibor = new Map()

    user_show_path.set(d.id, d);
    const id = d.id;

    let pathdata = await d3.json("/api/users/path?id=" + d.id);
    pathbuff.push(pathdata);
    d.show = true;
    drawPath();
    let nei = await d3.json("/api/users/neibor?id=" + d.id + "&day=" + theday)
    let userp = user_show_path.get(d.id)
    nei.forEach(k => {
        if (k.id == undefined)
            k.id = k._id
        neibor.set(k.id, k)
    })
}

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
let pathi = 0
var p1 = d3.color(255, 0, 0)
var p2 = d3.color(0, 0, 0)
var pathColor = d3.interpolate(p1, p2);
var pathLinear = d3.scaleLinear()
    .domain([0, 20])
    .range([0, 1]);
function drawDPathTo(d) {
    groupId.innerHTML = gid
    groupStrength.innerHTML = strength
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
        if (pathi - 20 >= 0)
            begin = pathi - 20
        for (let j = 0; j < daypath.path.length; j++) {
            const point = daypath.path[j];
            if (j == 0) {
                context.moveTo(point.X * 10, (100 - point.Y) * 10)
            } else {
                context.lineTo(point.X * 10, (100 - point.Y) * 10)
                //let dis = distance(point, daypath.path[j - 1])
                //if (dis > 5) {
                //    context.strokeStyle = d3.rgb(200, 200, 200);
                //    context.lineWidth = 1
                //    context.stroke()
                //    context.beginPath()
                //} else if (dis <= 5) {
//
                //    context.strokeStyle = color
                //    context.lineWidth = 3
                //    context.stroke()
                //    context.beginPath()
                //}
                //context.moveTo(point.X * 10, (100 - point.Y) * 10)
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
            if (pathi - 20 >= 0)
                begin = pathi - 20
            let iiii = 0
            for (let j = begin; j < daypath.path.length && j < pathi; j++) {
                timenow = daypath.path[j].Timestamp
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
                    iiii++
                }
            }
            context.stroke();
        }
    }
    if (timenow) {
        let dateobj = new Date(Date.parse(timenow))
        timetext.innerHTML = dateobj.getMonth() + "月 " + (dateobj.getDay() + 6) + "日: " + dateobj.getHours() + "时 " + dateobj.getMinutes() + "分 " + dateobj.getSeconds() + "秒"

    }
}
function beginDrawFunc(id, starttime) {
    if (gid != id || startTime != starttime)
        return
    context.clearRect(0, 0, 1000, 1000);
    context.drawImage(mapimg, 0, 0, 1000, 1000);
    pathbuff.forEach(d => {
        drawDPathTo(d)
    })
    pathi++;
    setTimeout(() => {
        beginDrawFunc(id, starttime)
    }, 50);
}

function drawPath() {
    pathi = 0
    startTime++
    beginDrawFunc(gid, startTime)
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
    //strength = speed_slider.value
    //getLeven()
}
var theday = 7;

let checked = []


function switchTo(to_day) {
    theday = to_day;
    showLeven()
}

Start()
