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
let dbo;
let timeline_arr = []
async function DBqueue() {

    dbo = await getDb();
    let res1 = await dbo.collection("movement_timeline").find({ "day": 5 }).toArray();
    timeline_arr.push(res1);
    let res2 = await dbo.collection("movement_timeline").find({ "day": 6 }).toArray();
    timeline_arr.push(res2);
    let res3 = await dbo.collection("movement_timeline").find({ "day": 7 }).toArray();
    timeline_arr.push(res3);

    console.log("时间索引读取完成")
    //dbo.db_connect.close();
}
let usersTagmap = new Map()
require("../lib/asynclib.js")
async function getMapFriData(time, current_day, ignore, onlyimportant, openLeven, callback) {
    onlyimportant = parseInt(onlyimportant)
    openLeven = parseInt(openLeven)
    if (openLeven == 1) {
        let res1 = []
        await leven.AsyncForeach(async u => {
            let res = await dbo.collection("movement")
                .findOne({ "Timestamp": timeline_arr[current_day - 5][time].Timestamp, id: u.id })
            if (res)
                res1.push(res)
        })
        callback(res1, timeline_arr[current_day - 5][time])
        return
    }
    if (ignore == undefined)
        ignore = []
    time = parseInt(time)
    if (time >= timeline_arr[current_day - 5].length)
        return new Promise((res) => {
            return null
        })
    //let dbo = await getDb();
    let res1 = []
    if (onlyimportant == 1)
        await vip.AsyncForeach(async u => {
            let res = await dbo.collection("movement")
                .findOne({ "Timestamp": timeline_arr[current_day - 5][time].Timestamp, id: u })
            if (res)
                res1.push(res)
        })
    else
        res1 = await dbo.collection("movement")
            .find({ "Timestamp": timeline_arr[current_day - 5][time].Timestamp })
            .toArray();
    let rep = []
    await res1.AsyncForeach(async el => {
        if (!usersTagmap.has(el.id)) {
            dbo.collection("users").findOne({ id: el.id }, (err, u) => {
                if (!u)
                    console.log("???  " + el.id)
                else {
                    let tm = new Map()
                    u.tag.forEach(t => [
                        tm.set(t.t, t.c)
                    ])
                    usersTagmap.set(el.id, tm)
                }
            })

        }
        let g = usersTagmap.get(el.id)
        if (g)
            for (let i = 0; i < ignore.length; i++) {
                if (g.has(ignore[i])) {
                    rep.push(el)
                    return
                }
            }
    });
    //dbo.db_connect.close();
    callback(rep, timeline_arr[current_day - 5][time])
}
const queryString = require('query-string')
route.get("/map/time", async (req, res) => {
    let data = queryString.parse(req.url.split("?")[1], { arrayFormat: 'index' })
    let day = data.day
    let time = data.time
    let onlyimportant = data.important
    if (!onlyimportant) onlyimportant = 0
    let openLeven = data.leven
    if (!openLeven) openLeven = 0
    let dayin = 0;
    if (day == "5") {
        dayin = 5
    }
    if (day == "6") {
        dayin = 6
    }
    if (day == "7") {
        dayin = 7
    }
    if (!dayin)
        res.json({ error: "out of day range" })
    else
        getMapFriData(time, dayin, data.check, onlyimportant, openLeven, (data, time) => {
            res.json({
                array: data,
                Timestamp: time
            })
        })
})

route.get("/users/path", async (req, res) => {
    // users/path?id=12345
    let uid = req.query.id;
    let theuser = await dbo.collection("path").findOne({ "id": uid });
    res.json(theuser);
})

route.get("/map/max", (req, res) => {
    if (req.query.day == "5") {
        res.json({ length: timeline_arr[0].length })
        return;
    }
    if (req.query.day == "6") {
        res.json({ length: timeline_arr[1].length })
        return;
    }
    if (req.query.day == "7") {
        res.json({ length: timeline_arr[2].length })
        return;
    }
    res.json({ length: -1 })
})

//require("../monque.js")

route.get("/users/neibor", (req, res) => {
    // /api/users/neibor?uid=xxxxxxx&day=5
    let uid = req.query.id
    let day = parseInt(req.query.day)
    if (day == 7)
        day = 8
    dbo.collection("users").aggregate(
        [
            { $match: { id: uid, "neibor.day": day } },
            { $unwind: "$neibor" },
            { $replaceRoot: { newRoot: "$neibor" } },
            { $match: { "day": day } },
            { $unwind: "$data" },
            { $replaceRoot: { newRoot: "$data" } },
            { $match: { count: { $gt: 100 } } },
            { $sort: { count: -1 } },
            { $limit: 40 }
        ], async (err, item) => {
            let arr = await item.toArray()
            res.json(arr)
        })
})
let vip = []
route.get("/users/important", async (req, res) => {
    let result = await dbo.collection("few_checkin_users").find({ "data.X": 32, "data.Y": 33 }).toArray()
    //let result = [{ id: "134576" }]
    result.forEach(u => {
        vip.push(u.id)
    })
    res.json(result)
})
let leven = []
let levenMap = new Map()
route.get("/users/leven", async (req, res) => {
    if (leven.length == 0) {
        let result = await dbo.collection("sun_morning_check_path").find({}).toArray()
        leven = result
    }


    res.json(leven)
})

route.get("/users/leven/fliter", async (req, res) => {
    let strength = parseInt(res.query.strength)
    let result = await dbo.collection("sun_morning_pair")
        .find({ len: { $lte: strength } })
        .distinct("pairA")
})

route.get("/pair/zero", async (req, res) => {
    let result = await dbo.collection("sun_morning_group").find({}).toArray()
    res.json(result)
})

route.get("/pair/zeropair", async (req, res) => {
    let result = await dbo.collection("sun_morning_pair").find({len:0}).toArray()
    res.json(result)
})

route.get("/pair/group", async (req, res) => {
    let strength = parseInt(req.query.strength)
    getGroupOf(strength, res)
    //let result = await dbo.collection("sun_morning_group").find({}).toArray()
    //res.json(result)
})
function getGroupOf(srength, res) {
    let zeroMap = new Map()
    dbo.collection("sun_morning_pair")
        .find({ len: { $lte: srength } }).forEach(u => {
            let g = zeroMap.get(u.pairA)
            if (!g) {
                zeroMap.set(u.pairA, [u.pairB])
            } else {
                g.push(u.pairB)
            }
        }, () => {
            // end
            let keys = Array.from(zeroMap.keys())
            let groupInd = 0
            let result = []
            while (zeroMap.size > 0) {
                let el;
                while (!zeroMap.has(el)) {
                    el = keys.pop()
                    if (!el) {
                        break;
                    }
                }
                if (!el)
                    break;
                let g = zeroMap.get(el)
                let group = []
                group.push(el)
                zeroMap.delete(el)
                while (g.length > 0) {
                    let ge = g.pop()
                    if (zeroMap.has(ge)) {
                        group.push(ge)
                        g = g.concat(zeroMap.get(ge))
                        zeroMap.delete(ge)
                    }
                }
                result.push({ gid: groupInd, group: group })
                groupInd++
            }
            console.log("getGroupEnd")
            res.json(result)
        })
}

route.get("/users/suspect", (req, res) => {
    dbo.collection("sun_morning_stay_over_1").find({}).toArray((err, arr) => {
        res.json(arr)
    })
})

route.get("/users/actor", (req, res) => {
    dbo.collection("only_checkin_entrance").find({}).toArray((err,arr)=>{
        res.json(arr)
    })
})