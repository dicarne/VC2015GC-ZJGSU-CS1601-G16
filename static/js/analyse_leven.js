// * * * * * * * * * * * * * * * * * * * * * * * * * * *
// * Ding jiahe Created 2019-5-24 
// * 尝试用力导向图分析通讯关系
// * State:     ~. 暂时废弃
// * Reason:    1. 由于极大占比（约70%以上）用户都向同一个用户
// *               发送信息，导致单个节点连接的线过于密集，无法
// *               有效辨识。
// * * * * * * * * * * * * * * * * * * * * * * * * * * *


let nodes = []
let links = []
let node, link, simulation
var svg = d3.select("#force-svg").append("svg:svg").attr("width", 1920).attr("height", 1080).append("g");
let config = {}
config.width = 1920
config.height = 1080
//var worker = new Worker("js/comm_workers.js");

async function StartAnalyseComment() {
    let mnodes = new Map()
    let mlinks = new Map()
    console.log("begin import")
    let import_data = await d3.json("/api/pair/zeropair")
    import_data.forEach(d => {
        let nf = mnodes.get(d.pairA)
        if (!nf)
            mnodes.set(d.pairA, { id: d.pairA, count: 0 })
        else
            nf.count++
        let nt = mnodes.get(d.pairB)
        if (!nt)
            mnodes.set(d.pairB, { id: d.pairB, count: 0 })
        else
            nt.count++
        let ia = parseInt(d.pairA)
        let ib = parseInt(d.pairB)
        if (ia > ib) {
            let t = ia
            ia = ib
            ib = t
        }
        let nl = mlinks.get(ia + "_" + ib)
        if (!nl)
            mlinks.set(ia + "_" + ib, { source: ia.toString(), target: ib.toString(), count: 0 })
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

    //worker.postMessage({
    //    nodes: nodes,
    //    links: links
    //});




    simulation = d3.forceSimulation(nodes)
        //链接力
        .force("link", d3.forceLink(links))
        // 万有引力
        .force("charge", d3.forceManyBody().strength(-10))
        // 用指定的x坐标和y坐标创建一个居中力。
        .force("center", d3.forceCenter(config.width / 2, config.height / 2))
        //碰撞作用力，为节点指定一个radius区域来防止节点重叠，设置碰撞力的强度，范围[0,1], 默认为0.7。设置迭代次数，默认为1，迭代次数越多最终的布局效果越好，但是计算复杂度更高
        .force("collide", d3.forceCollide(30).strength(0.2).iterations(5))
        .on("tick", () => {
            link
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });
            node
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });
        })
        
    link = svg
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .call(zoom())

    node = svg
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", "#66ccff")
        .call(drag(simulation))
        //.on("click", click.bind(this))
        //.on("mouseover", this.mouseover.bind(this))
        //.on("mouseout", this.mouseout.bind(this))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .call(zoom())

}

function zoom(){
    return d3.zoom()
    //比例尺
    .scaleExtent([0.5, 1.5])
    //transform
    .on("zoom", function () {

        svg.attr('transform', d3.event.transform) // 添加缩放功能
        //this.axises.xContainer.call(this.axises.x.scale(d3.event.transform.rescaleX(this.axises.xScale))) // 设置坐标轴随zoom缩放
        //this.axises.yContainer.call(this.axises.y.scale(d3.event.transform.rescaleY(this.axises.yScale)))
    })
}

function drag(simulation) {

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}
//var canvas = document.querySelector("#force-canvas"),
//    context = canvas.getContext("2d"),
//    width = canvas.clientHeight,
//    height = canvas.clientWidth;
//
//worker.onmessage = function (event) {
//    switch (event.data.type) {
//        case "tick": return ticked(event.data);
//        case "end": return ended(event.data);
//    }
//};
//
//function ticked(data) {
//
//}
//var dx = 0;
//var dy = 0;
//
///**
// * 使用webwoker计算得到的数据绘制力导向图
// * @param {*} data 
// */
//function ended(data) {
//    var nodes = data.nodes,
//        links = data.links;
//
//    //context.clearRect(0, 0, width, height);
//    context.save();
//    //context.translate(width / 2, height / 2);
//
//    nodes.forEach(d => {
//        dx += d.x;
//        dy += d.y;
//    });
//    dx /= nodes.length;
//    dy /= nodes.length;
//
//    dx = dx - (width / 2);
//    dy = dy - (height / 2);
//
//    context.beginPath();
//    context.strokeStyle = "#aaa";
//    links.forEach(drawLink);
//    context.stroke();
//
//    context.beginPath();
//    context.strokeStyle = "#aaa";
//    context.fillStyle = "#666";
//    nodes.forEach(drawNode);
//    context.stroke();
//    context.fill();
//
//    context.restore();
//
//    console.log("draw end");
//}
//
//function drawLink(d) {
//
//    context.moveTo(d.source.x - dx, d.source.y - dy);
//    context.lineTo(d.target.x - dx, d.target.y - dy);
//
//}
//
//function drawNode(d) {
//
//    context.moveTo(d.x - dx + 3, d.y - dy);
//    context.arc(d.x - dx, d.y - dy, 3, 0, 2 * Math.PI);
//
//}



StartAnalyseComment()