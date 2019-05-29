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

function updateTimeLine(t) {
    setTimeout(() => {
        showPosAtTime(t);
    }, 1000 / 60);
}
var a = d3.rgb(20, 20, 20);
var b = d3.rgb(0, 255, 0);

var computeColor = d3.interpolate(a, b);
var linear = d3.scaleLinear()
    .domain([0, 150])
    .range([0, 1]);
let timetext = document.getElementById("Timestamp");
let previous = new Map();
async function showPosAtTime(time_t) {
    let data = await d3.json("/api/map/fri/" + time_t);
    let map = new Array(10000);

    let timedata = data;
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
    let drawdata = Array.from(previous.values());
    svg.selectAll("circle")
        .data(drawdata)
        .join("circle")
        .attr("r", 5)
        .transition()
        .duration(100)
        .attr("cx", d => d.X * 10)
        .attr("cy", d => (100 - d.Y) * 10)
        .attr("fill", d => {
            return computeColor(linear(d.lastUpdate));
        })

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
    svg.selectAll("rect")
        .data(check_in_array)
        .join("rect")
        .attr("x", d => d.X * 10)
        .attr("y", d=> (100 - d.Y) * 10)
        .attr("width", 15)
        .attr("height", d => d.length)
        .attr("fill", "#66ccff")
    timetext.innerHTML = timedata.Timestamp;
    updateTimeLine(time_t + 1)
}



/**
 * 将坐标转换为字典可用的id
 * @param {int} x 
 * @param {int} y 
 */
function pos2id(x, y) {
    return x + "," + y;
}
