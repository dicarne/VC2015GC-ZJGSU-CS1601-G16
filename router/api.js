const express = require('express');
const route = express.Router();
module.exports = route;
let app = express();

// 给app配置bodyParser中间件
// 通过如下配置再路由种处理request时，可以直接获得post请求的body部分
bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var path = require("path");
var current_url = path.resolve('./');
console.log(current_url);

const fs = require("fs");
const readline = require("readline");



var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

async function getDb() {
    let error
    let dbo
    try {
        let db = await MongoClient.connect(url, { useNewUrlParser: true })
        dbo = db.db("mc2015");
        dbo.db_connect = db;
    } catch (err) {
        error = err
    }

    return new Promise((rec, rej) => {
        rec(dbo)
        if (error)
            rej(error)
    })
}
DBqueue()
let map_pos_fri = []
let dbo;
async function DBqueue() {

    dbo = await getDb();
    let res1 = await dbo.collection("movement_timeline").find({ "day": 5 }).toArray();
    map_pos_fri = res1;
    console.log("时间索引读取完成")
    //dbo.db_connect.close();
}


async function getMapFriData(time, current_day, callback) {
    time = parseInt(time)
    if (time >= map_pos_fri.length)
        return new Promise((res) => {
            return null
        })
    //let dbo = await getDb();
    let res1 = await dbo.collection("movement").find({ "Timestamp": map_pos_fri[time].Timestamp }).toArray();
    //dbo.db_connect.close();
    callback(res1, map_pos_fri[time])
}

route.get("/map/:day/:time", async (req, res) => {
    let day = req.param("day");
    let time = req.param("time");
    if (day == "fri") {
        getMapFriData(time, 5, (data, time) => {
            res.json({
                array: data,
                Timestamp: time
            })
        })
    }
})