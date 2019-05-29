const express = require('express');
const route = express.Router();
module.exports = route;
let app = express();

// 给app配置bodyParser中间件
// 通过如下配置再路由种处理request时，可以直接获得post请求的body部分
bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

route.get('/test', (req, res) => {
    res.send({ name: "me", id: 102 });
})

var path = require("path");
var current_url = path.resolve('./');
console.log(current_url);

const fs = require("fs");
const readline = require("readline");

let fread_map_fri_stream = fs.createReadStream(current_url + "/data/MC1 Data 2015/park-movement-Fri-FIXED-2.0.csv");
let fread_map_fri = readline.createInterface({ input: fread_map_fri_stream });
let index_map_fri = 0;
let map_fri_array = [];
let map_fri_head = [];
let map_fri_complete = false;
fread_map_fri.on("line", (line) => {
    let l = line.split(",");
    if (index_map_fri == 0) {
        l.forEach((d)=>{
            map_fri_head.push(d);
        })
    } else {
        let d = {};
        let hi = 0;
        map_fri_head.forEach((p)=>{
            d[p] = l[hi];
            hi++;
        })
        d.X = parseInt(d.X);
        d.Y = parseInt(d.Y);
        if (map_fri_array.length > 0 && map_fri_array[map_fri_array.length - 1].Timestamp == d.Timestamp) {
            map_fri_array[map_fri_array.length - 1].array.push(d);
        }
        else {
            map_fri_array.push({ Timestamp: d.Timestamp, array: [d] });
        }
    }
    index_map_fri++;
});

fread_map_fri.on("close", ()=>{
    map_fri_complete = true;
    console.log("read complete")
})

function getMapFriData(time){
    if(time < map_fri_array.length)
    {
        return map_fri_array[time];
    }
    else{
        return null;
    }
}

route.get("/map/:day/:time", (req, res)=>{
    let day = req.param("day");
    let time = req.param("time");
    if(day == "fri"){
        res.json(getMapFriData(time))
    }
})