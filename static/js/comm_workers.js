// * * * * * * * * * * * * * * * * * * * * * * * * * * *
// * Ding jiahe Created 2019-5-24 
// * analyse_comment.js的webwoker模块
// * * * * * * * * * * * * * * * * * * * * * * * * * * *

importScripts("d3/d3.js")

onmessage = function(event) {
    var nodes = event.data.nodes,
        links = event.data.links;
    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-300))
        .force("link", d3.forceLink(links).distance(20).strength(1))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .stop();
  
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
      postMessage({type: "tick", progress: i / n});
      simulation.tick();
    }
    console.log("cal end")
    postMessage({type: "end", nodes: nodes, links: links});
  };