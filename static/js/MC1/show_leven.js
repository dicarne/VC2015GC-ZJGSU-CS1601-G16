
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
    group = await d3.json("/api/pair/group?strength=" + strength);
    id_slider.max = group.length - 1
    console.log("获取数据完成")
    startTime++
    showLeven()
}
let startTime = 0;
async function showLeven() {
    let wantdraw = group[gid].group
    pathbuff = []
    for (let i = 0; i < wantdraw.length; i++) {
        const d = wantdraw[i];
        let pathdata = await d3.json("/api/users/path?id=" + d);
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

function drawSpot(drawdata) {
    let check_in_map = new Map();
    drawdata.forEach(u => {
        if (u.type == "check-in") {
            let a = check_in_map.get(pos2id(u.X, u.Y))
            if (!a) {
                check_in_map.set(pos2id(u.X, u.Y), [])
                a = check_in_map.get(pos2id(u.X, u.Y))
                a.X = u.X;
                a.Y = u.Y;
            }
            a.push(u)
        }
    })
    let check_in_array = Array.from(check_in_map.values())
    svg.selectAll(".spot")
        .data(check_in_array)
        .join("circle")
        .attr("class", "spot")
        .attr("cx", d => { d.cx = d.X * 10; return d.cx; })
        .attr("cy", d => { d.cy = (100 - d.Y) * 10; return d.cy; })
        //.attr("r", 10)
        .attr("r", d => Math.sqrt(d.length) * 2)
        .attr("fill", d => checkRectColor(d.length))
        .attr("stroke", "#4B4B4B")
        .attr("stroke-width", "2")
        .on("mouseover", d => {
            let fx = 0;
            if (d.cx >= 800)
                fx = d.cx - 140;
            else
                fx = d.cx
            svg.append("rect")
                .attr("x", fx + 20)
                .attr("y", d.cy - 40)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("width", 140)
                .attr("height", 25)
                .attr("fill", "#fff")
                .attr("class", "user-tips rectstyle")
            svg.append("text")
                .attr("x", fx + 24)
                .attr("y", d.cy - 23.5)
                .text("x:" + d.X + ";y:" + d.Y)
                .attr("class", "user-tips")

            pause = true;
        })
        .on("mouseout", d => {
            d3.selectAll(".user-tips").remove()
            pause = false;
        })
}
var pause = false;
function drawUsers(drawdata) {
    svg.selectAll(".user")
        .data(drawdata)
        .join("circle")
        .attr("class", d => {
            if (vipMap.has(d.id))
                vipMap.set(d.id, d)
            if (user_show_path.has(d.id)) {
                user_show_path.set(d.id, d);
                return "user highlightuser";
            }
            else
                return "user normaluser";
        })
        .attr("r", 5)
        .on("mouseover", d => {
            let fx = 0;
            if (d.cx >= 800)
                fx = d.cx - 140;
            else
                fx = d.cx
            svg.append("rect")
                .attr("x", fx + 20)
                .attr("y", d.cy - 40)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("width", 140)
                .attr("height", 25)
                .attr("fill", "#fff")
                .attr("class", "user-tips rectstyle")
            svg.append("text")
                .attr("x", fx + 24)
                .attr("y", d.cy - 23.5)
                .text("id:" + d.id + " x:" + d.X + ";y:" + d.Y)
                .attr("class", "user-tips")
            pause = true;
        })
        .on("mouseout", d => {
            d3.selectAll(".user-tips").remove()

            pause = false;
        })
        .on("click", d => {
            if (!user_show_path.has(d.id)) {
                drawUserPath(d);
            }
            else {
                removeUserPath(d);
                d.show = false;
            }
        })
        .transition()
        .duration(50)
        .attr("cx", d => { d.cx = d.X * 10; return d.cx; })
        .attr("cy", d => { d.cy = (100 - d.Y) * 10; return d.cy; })
        .attr("fill", d => {
            if (user_show_path.has(d.id)) {
                return d3.rgb(255, 0, 0);
            }
            if (user_show_path.size > 0) {
                let final_color = "grey"
                user_show_path.forEach(v => {
                    if (neibor.has(d.id)) {
                        console.log("woo " + d.id)
                        neiborUser.set(d.id, d)
                        return
                    }
                })
                return final_color
            }
            return computeColor(linear(d.lastUpdate));
        })

    svgtop.selectAll(".highuser")
        .data(Array.from(user_show_path.values()))
        .join("circle")
        .attr("cx", d => { d.cx = d.X * 10; return d.cx; })
        .attr("cy", d => { d.cy = (100 - d.Y) * 10; return d.cy; })
        .attr("fill", d => {
            return d3.rgb(255, 0, 0);
        })
        .attr("r", 5)
        .attr("class", "highuser")
        .on("mouseover", d => {
            let fx = 0;
            if (d.cx >= 800)
                fx = d.cx - 140;
            else
                fx = d.cx
            svg.append("rect")
                .attr("x", fx + 20)
                .attr("y", d.cy - 40)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("width", 140)
                .attr("height", 25)
                .attr("fill", "#fff")
                .attr("class", "user-tips rectstyle")
            svg.append("text")
                .attr("x", fx + 24)
                .attr("y", d.cy - 23.5)
                .text("id:" + d.id + " x:" + d.X + ";y:" + d.Y)
                .attr("class", "user-tips")
            pause = true;
        })
        .on("mouseout", d => {
            d3.selectAll(".user-tips").remove()

            pause = false;
        })
        .on("click", d => {
            if (!user_show_path.has(d.id)) {
                drawUserPath(d);
            }
            else {
                removeUserPath(d);
                d.show = false;
            }
        })
    refearchNeiborUser()
    svgmid.selectAll(".neiboruser")
        .data(Array.from(neiborUser.values()))
        .join("circle")
        .attr("cx", d => { d.cx = d.X * 10; return d.cx; })
        .attr("cy", d => { d.cy = (100 - d.Y) * 10; return d.cy; })
        .attr("fill", d => {
            return d3.rgb(0, 0, 220);
        })
        .attr("r", 5)
        .attr("class", "neiboruser")
        .on("mouseover", d => {
            let fx = 0;
            if (d.cx >= 800)
                fx = d.cx - 140;
            else
                fx = d.cx
            svg.append("rect")
                .attr("x", fx + 20)
                .attr("y", d.cy - 40)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("width", 140)
                .attr("height", 25)
                .attr("fill", "#fff")
                .attr("class", "user-tips rectstyle")
            svg.append("text")
                .attr("x", fx + 24)
                .attr("y", d.cy - 23.5)
                .text("id:" + d.id + " x:" + d.X + ";y:" + d.Y)
                .attr("class", "user-tips")
            pause = true;
        })
        .on("mouseout", d => {
            d3.selectAll(".user-tips").remove()

            pause = false;
        })




    svgvip.selectAll(".vipuser")
        .data(Array.from(vipMap.values()))
        .join("circle")
        .attr("cx", d => { d.cx = d.X * 10; return d.cx; })
        .attr("cy", d => { d.cy = (100 - d.Y) * 10; return d.cy; })
        .attr("fill", d => {
            return d3.rgb(255, 0, 255);
        })
        .attr("r", 5)
        .attr("class", "vipuser")
        .on("mouseover", d => {
            let fx = 0;
            if (d.cx >= 800)
                fx = d.cx - 140;
            else
                fx = d.cx
            svg.append("rect")
                .attr("x", fx + 20)
                .attr("y", d.cy - 40)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("width", 140)
                .attr("height", 25)
                .attr("fill", "#fff")
                .attr("class", "user-tips rectstyle")
            svg.append("text")
                .attr("x", fx + 24)
                .attr("y", d.cy - 23.5)
                .text("id:" + d.id + " x:" + d.X + ";y:" + d.Y)
                .attr("class", "user-tips")
            pause = true;
        })
        .on("mouseout", d => {
            d3.selectAll(".user-tips").remove()

            pause = false;
        })
        .on("click", d => {
            if (!user_show_path.has(d.id)) {
                drawUserPath(d);
            }
            else {
                removeUserPath(d);
                d.show = false;
            }
        })
}
var neihigh_map = new Map();
var neiborUser = new Map();
function refearchNeiborUser() {
    let tmparr = Array.from(neiborUser.values())
    neiborUser = new Map()
    for (let i = 0; i < tmparr.length; i++) {
        const d = tmparr[i];
        //if (previous.has(d.id)) {
        user_show_path.forEach(v => {
            if (neibor.has(d.id)) {
                neiborUser.set(d.id, d)
                return
            }
        })
        //}
    }
}

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

    for (let i = 0; i < d.pathlist.length; i++) {
        const daypath = d.pathlist[i];
        if (daypath.day == theday) {
            context.beginPath();
            let begin = 0
            if (pathi - 20 >= 0)
                begin = pathi - 20
            let iiii = 0
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
                    iiii++
                }
            }
            context.stroke();
        }
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
    groupId.innerHTML = gid
    groupStrength.innerHTML = strength
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
    showLeven()
}
function speed_select_changed() {
    strength = speed_slider.value
    getLeven()
}
var theday = 7;

let checked = []

Start()
