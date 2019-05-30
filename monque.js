var path = require("path");
var current_url = path.resolve('./');
console.log(current_url);

const fs = require("fs");
const readline = require("readline");

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

require("./lib/asynclib.js");

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
let map_pos_fri = []
let dbo;
async function DBqueue() {

    dbo = await getDb();

    // 计算每个人在游乐园呆了几天
    let users = await dbo.collection("users").find({}).toArray()
    var i = 0;
    await users.AsyncForeach(async d => {
        let sumday = 0;
        let fri = await dbo.collection("movement").findOne({ "id": d.id, "day": 5 })
        let sat = await dbo.collection("movement").findOne({ "id": d.id, "day": 6 })
        let sun = await dbo.collection("movement").findOne({ "id": d.id, "day": 7 })
        if (fri != null)
            sumday++
        if (sat != null)
            sumday++
        if (sun != null)
            sumday++
        await dbo.collection("users").updateOne({ "id": d.id }, {
            $set: {
                "stay_in_park": sumday
            }
        })
    })

    console.log("complete")
    dbo.db_connect.close()

}

async function assigncheckin() {
    let buildings = await dbo.collection("buildings").find({}).toArray()
    await buildings.AsyncForeach(async d => {
        let res = await dbo.collection("movement").find({ "X": d.x, "Y": d.y, "type": "check-in" }).limit(1).toArray()
        if (res.length == 0) {
            console.log("not find: " + d.building)
            return
        }
        await dbo.collection("buildings").updateOne({ "building": d.building }, {
            $set: {
                "checkin": true
            }
        })

    })
}

async function buildingscheckin() {
    let users = await dbo.collection("users").find({}).toArray()

    let buildings = await dbo.collection("buildings").find({ "checkin": true }).toArray()
    await users.AsyncForeach(async v => {
        v.tag = [];
        let tagmap = new Map()
        await buildings.AsyncForeach(async b => {
            let gocount = await dbo.collection("movement")
                .find({
                    "id": v.id,
                    "X": b.x,
                    "Y": b.y,
                    "type": "check-in"
                })
                .limit(1)
                .count()
            if (gocount > 0) {
                if (!tagmap.has(b.type))
                    tagmap.set(b.type, 1)
                else {
                    let c = tagmap.get(b.type)
                    tagmap.set(b.type, c + 1)
                }
            }
        })
        tagmap.forEach((value, k) => {
            v.tag.push({
                "t": k,
                "c": value
            })
        })

        await dbo.collection("users").updateOne({ "id": v.id }, {
            $set: {
                "tag": v.tag
            }
        })
    })
}