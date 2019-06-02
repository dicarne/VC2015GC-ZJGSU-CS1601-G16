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
DBqueue()
let map_pos_fri = []
let dbo;
async function DBqueue() {

    dbo = await getDb();
    let i = 0;


    let users = await dbo.collection("users").find({ stay_in_park: 3 })
    users.forEach(async d => {
        let r = await dbo.collection("movement").find({ id: d.id, X: 76, Y: 22, type: "check-in" }).toArray()
        if (r.length >= 3) {
            dbo.collection("check_in_parkshow").insertOne({ id: d.id, count: r.length, detail: r })
            console.log(d.id + " " + r.length)
        }

    })


    //console.log("complete")
    //dbo.db_connect.close()

}

async function calNeighbor() {
    let users_array = await dbo.collection("users").find({}).toArray();
    let users = new Map();
    users_array.forEach(d => {
        users.set(d.id, { id: d.id, neibor: [] })
    })
    // 找到所有相关的人
    for (let i = 6; i <= 6; i++) {
        await calOne(i, users)
    }
}

async function calOne(i, users) {
    // 之前出现过的
    let previous = new Map();
    let tl = await dbo.collection("movement_timeline").find({ "day": i }).toArray()
    let _index = 0;
    await tl.AsyncForeach(async ts => {
        let movedata = await dbo.collection("movement")
            .find({ "Timestamp": ts.Timestamp })
            .toArray();
        let current = new Map();
        previous.forEach(v => {
            v.wait++;
        })
        movedata.forEach(u => {
            let record = users.get(u.id);
            current.set(u.id, u)
        })
        current.forEach((v, k) => {
            let getp = previous.get(k)
            if (getp) {
                getp.X = v.X;
                getp.Y = v.Y;
                getp.type = v.type;
                getp.wait = 0;
            }
            else {
                previous.set(k, { id: v.id, X: v.X, Y: v.Y, type: v.type, wait: 0 })
            }
        });
        let mapdata = new Array(10000);
        previous.forEach(v => {
            const ind = v.X + v.Y * 100;
            if (!mapdata[ind])
                mapdata[ind] = [];
            mapdata[ind].push(v)
        })
        previous.forEach(v => {
            for (let iq = -1; iq <= 1; iq++) {
                for (let j = -1; j <= 1; j++) {
                    if (v.X + iq >= 0 && v.X + iq < 100 && v.Y + j >= 0
                        && v.Y + j < 100) {
                        const ind = (v.X + iq) + (v.Y + j) * 100
                        let around = mapdata[ind]
                        if (around) {
                            around.forEach(ne => {
                                if (ne.wait < 180) {
                                    if (!v.neibor) {
                                        v.neibor = new Map()
                                    }
                                    let g = v.neibor.get(ne.id)
                                    if (!g)
                                        v.neibor.set(ne.id, 1)
                                    else
                                        v.neibor.set(ne.id, g + 1)
                                }
                            })
                        }
                    }
                }
            }
        })
        _index++;
        if (_index % 100 == 0) console.log(ts.Timestamp)
    })
    let pppp = Array.from(previous.values())
    await pppp.AsyncForeach(async u => {
        let ne = []

        u.neibor.forEach((nc, nid) => {
            ne.push({
                id: nid,
                count: nc
            })
        })
        let nn = {
            day: i,
            data: ne
        }
        await dbo.collection("users").updateOne({ "id": u.id }, {
            $push: {
                "neibor": nn
            }
        })
    })
    console.log("-----------------cmp---------------")
    console.log("day:-----" + i)
}

async function assigncheckin() {
    let buildings = await dbo.collection("buildings").find({}).toArray()
    await buildings.AsyncForeach(async d => {
        let res = await dbo.collection("movement").findOne({ "X": d.x, "Y": d.y })
        if (!res) {
            console.log("not find: " + d.building)
            return
        }
        //await dbo.collection("buildings").updateOne({ "building": d.building }, {
        //    $set: {
        //        "checkin": true
        //    }
        //})
        //
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