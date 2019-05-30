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
    if (pause) {
        setTimeout(() => {
            updateTimeLine(time_t)
        }, 500);
        
        return
    }
    for (let i = 0; i < skiptime; i++) {
        timedata = await d3.json("/api/map/sat/" + time_t);
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
    timetext.innerHTML = date.Timestamp;

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
        .attr("cx", d => { d.cx = d.X * 10; return d.cx; })
        .attr("cy", d => { d.cy = (100 - d.Y) * 10; return d.cy; })
        //.attr("r", 10)
        .attr("r", d => Math.sqrt(d.length) * 2)
        .attr("fill", d => checkRectColor(d.length))
        .attr("stroke", "#4B4B4B")
        .attr("stroke-width", "2")
        .on("mouseover", d => {
            console.log(d)
            let fx = 0;
            if(d.cx >= 800)
                fx = d.cx - 100;
            else
                fx = d.cx
            svg.append("rect")
                .attr("x", fx)
                .attr("y", d.cy - 20)
                .attr("width", 100)
                .attr("height", 25)
                .attr("fill", "#fff")
                .attr("class", "user-tips")
            svg.append("text")
                .attr("x", fx)
                .attr("y", d.cy)
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
        .attr("class", "user")
        .attr("r", 5)
        .on("mouseover", d => {
            console.log(d)
            let fx = 0;
            if(d.cx >= 800)
                fx = d.cx - 100;
            else
                fx = d.cx
            svg.append("rect")
                .attr("x", fx)
                .attr("y", d.cy - 20)
                .attr("width", 100)
                .attr("height", 25)
                .attr("fill", "#fff")
                .attr("class", "user-tips")
            svg.append("text")
                .attr("x", fx)
                .attr("y", d.cy)
                .text("x:" + d.X + ";y:" + d.Y)
                .attr("class", "user-tips")
            
            pause = true;
        })
        .on("mouseout", d => {
            d3.selectAll(".user-tips").remove()
            pause = false;
        })
        .transition()
        .duration(betweenTime)
        .attr("cx", d => { d.cx = d.X * 10; return d.cx; })
        .attr("cy", d => { d.cy = (100 - d.Y) * 10; return d.cy; })
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
