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

//DBqueue()
//
//async function DBqueue() {
//    let dbo = await getDb();
//    let res1 = await dbo.collection("movement").distinct("id");
//    let data = []
//    res1.forEach(d=>{
//        data.push({id: d})
//    })
//    await dbo.collection("users").insertMany(data);
//    dbo.db_connect.close();
//}


let index_map_fri = 0;
let map_fri_array = [];
let map_fri_head = [];
let map_fri_complete = false;
//
//function getMapFriData(time) {
//    if (time < map_fri_array.length) {
//        return map_fri_array[time];
//    }
//    else {
//        return null;
//    }
//}

//route.get("/map/:day/:time", (req, res) => {
//    let day = req.param("day");
//    let time = req.param("time");
//    if (day == "fri") {
//        res.json(getMapFriData(time))
//    }
//})