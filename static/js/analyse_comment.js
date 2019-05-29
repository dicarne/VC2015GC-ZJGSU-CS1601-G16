// * * * * * * * * * * * * * * * * * * * * * * * * * * *
// * Ding jiahe Created 2019-5-24 
// * 尝试用力导向图分析通讯关系
// * State:     ~. 暂时废弃
// * Reason:    1. 由于极大占比（约70%以上）用户都向同一个用户
// *               发送信息，导致单个节点连接的线过于密集，无法
// *               有效辨识。
// * * * * * * * * * * * * * * * * * * * * * * * * * * *

const comment_file = ["comm-data-Fri.csv", "comm-data-Fri.csv", "comm-data-Fri.csv"]

let nodes = []
let links = []

var worker = new Worker("js/comm_workers.js");

export async function StartAnalyseComment() {
    let mnodes = new Map()
    let mlinks = new Map()
    console.log("begin import")
    let import_data = await d3.csv("../data/MC2 Data 2015/" + comment_file[0], d => {
        let nf = mnodes.get(d.from)
        if (!nf)
            mnodes.set(d.from, { id: d.from, timestamp: d.timestamp, location: d.location, count: 0 })
        else
            nf.count++
        let nt = mnodes.get(d.to)
        if (!nt)
            mnodes.set(d.to, { id: d.to, timestamp: d.timestamp, location: d.location, count: 0 })
        else
            nt.count++
        let nl = mlinks.get(d.from + "_" + d.to)
        if (!nl)
            mlinks.set(d.from + "_" + d.to, { source: d.from, target: d.to, count: 0 })
        else
            nl.count++
    })
    console.log("end import")
    nodes = Array.from(mnodes.values())
    for (let i = 0; i < nodes.length; i++) {
        const ele = nodes[i];
        ele.index = i;
    }
    links = Array.from(mlinks.values())
    for (let i = 0; i < links.length; i++) {
        const ele = links[i];
        let c = mnodes.get(ele.source);
        ele.source = c.index;
        ele.target = mnodes.get(ele.target).index;
    }

    worker.postMessage({
        nodes: nodes,
        links: links
    });
}

var canvas = document.querySelector("#comm_wheel"),
    context = canvas.getContext("2d"),
    width = canvas.clientHeight,
    height = canvas.clientWidth;

worker.onmessage = function (event) {
    switch (event.data.type) {
        case "tick": return ticked(event.data);
        case "end": return ended(event.data);
    }
};

function ticked(data) {

}
var dx = 0;
var dy = 0;

/**
 * 使用webwoker计算得到的数据绘制力导向图
 * @param {*} data 
 */
function ended(data) {
    var nodes = data.nodes,
        links = data.links;

    //context.clearRect(0, 0, width, height);
    context.save();
    //context.translate(width / 2, height / 2);

    nodes.forEach(d =>{
        dx += d.x;
        dy += d.y;
    });
    dx /= nodes.length;
    dy /= nodes.length;

    dx = dx - (width / 2);
    dy = dy - (height / 2);

    context.beginPath();
    context.strokeStyle = "#aaa";
    links.forEach(drawLink);
    context.stroke();

    context.beginPath();
    context.strokeStyle = "#aaa";
    context.fillStyle = "#666";
    nodes.forEach(drawNode);
    context.stroke();
    context.fill();

    context.restore();

    console.log("draw end");
}

function drawLink(d) {

    context.moveTo(d.source.x - dx, d.source.y - dy);
    context.lineTo(d.target.x - dx, d.target.y - dy);

}

function drawNode(d) {

    context.moveTo(d.x - dx + 3, d.y - dy);
    context.arc(d.x - dx, d.y - dy, 3, 0, 2 * Math.PI);

}
