var canvas = document.querySelector("#comm_wheel"),
    context = canvas.getContext("2d"),
    width = canvas.clientHeight,
    height = canvas.clientWidth;
var mapimg = new Image();
var svg = d3.select("#svg_map").append("svg:svg").attr("width", 1000).attr("height", 1000);

var timeline = [];
export function Start() {
    mapimg.src = "/analyse/ParkMap.jpg";
    mapimg.onload = () => {
        context.drawImage(mapimg, 0, 0, 1000, 1000);
    }

    updateTimeLine(0)
}
let betweenTime = 10;
function updateTimeLine(t) {
    setTimeout(() => {
        showPosAtTime(t);
    }, betweenTime);
}
var a = d3.rgb(20, 20, 20);
var b = d3.rgb(100, 100, 100);

var computeColor = d3.interpolate(a, b);
var linear = d3.scaleLinear()
    .domain([0, 150])
    .range([0, 1]);

var checkRectColor =
    x => d3.interpolate(d3.rgb("#00CC00"), d3.rgb("#FF3300"))(d3.scaleLinear()
        .domain([0, 200])
        .range([0, 1])(x))

let timetext = document.getElementById("Timestamp");
let previous = new Map();
let skiptime = 1;
async function showPosAtTime(time_t) {
    let timedata;
    for (let i = 0; i < skiptime; i++) {
        timedata = await d3.json("/api/map/fri/" + time_t);
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
    timetext.innerHTML = timedata.Timestamp;

    updateTimeLine(time_t)
}

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
        .attr("cx", d => d.X * 10)
        .attr("cy", d => (100 - d.Y) * 10)
        //.attr("r", 10)
        .attr("r", d => Math.sqrt(d.length) * 2)
        .attr("fill", d => checkRectColor(d.length))
        .attr("stroke", "#4B4B4B")
        .attr("stroke-width", "2")
}

function drawUsers(drawdata) {
    svg.selectAll(".user")
        .data(drawdata)
        .join("circle")
        .attr("class", "user")
        .attr("r", 5)
        .transition()
        .duration(betweenTime)
        .attr("cx", d => d.X * 10)
        .attr("cy", d => (100 - d.Y) * 10)
        .attr("fill", d => {
            return computeColor(linear(d.lastUpdate));
        })
}


/**
 * 将坐标转换为字典可用的id
 * @param {int} x 
 * @param {int} y 
 */
function pos2id(x, y) {
    return x + "," + y;
}
