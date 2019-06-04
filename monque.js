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
function getLetter(id) {
    if (id >= 26)
        console.log("过多标签")
    return String.fromCharCode(0x60 + 1 + id)
}
async function DBqueue() {

    dbo = await getDb();
    let strength = 2
    let count = 0
    
}

function func1() {
    let count = 0;
    dbo.collection("users").find({}).forEach(u => {
        for (let _i = 0; _i < u.tag.length; _i++) {
            if (u.tag[_i].t == "Kiddle")
                return;
        }
        dbo.collection("not_goto_kiddle").insertOne({ id: u.id })
        count++;
        if (count % 100 == 0)
            console.log(count)
    })
}

function findfitstmove() {
    let count = 0
    dbo.collection("movement").distinct("id",
        {
            day: 7,
            X: 32,
            Y: 33,
            $and: [{ Timestamp: { $gt: new Date(2014, 6, 8, 8, 0, 0, 0) } },
            { Timestamp: { $lt: new Date(2014, 6, 8, 11, 30, 0, 0) } }],
            type: "check-in"
        }, (err, array) => {
            console.log("total: " + array.length)
            array.forEach(u => {
                dbo.collection("movement").find(
                    {
                        id: u,
                        day: 7,
                        $and: [{ Timestamp: { $gt: new Date(2014, 6, 8, 8, 0, 0, 0) } },
                        { Timestamp: { $lt: new Date(2014, 6, 8, 11, 30, 0, 0) } }],
                    }).toArray((err, arr) => {
                        let findCheckin = false
                        let findCheckOut = false
                        let ckt
                        for (let ix = 0; ix < arr.length; ix++) {
                            const el = arr[ix];
                            if (el.type == "check-in" && el.X == 32 && el.Y == 33) {
                                findCheckin = true;
                                ckt = el.Timestamp
                            }
                            if (findCheckin) {
                                if (el.type == "movement") {
                                    dbo.collection("move_after_checkin_32_33")
                                        .insertOne({ id: u, checkinTime: ckt, moveTime: el.Timestamp })
                                    findCheckOut = true
                                    break;
                                }
                            }
                        }
                        if (!findCheckin || !findCheckOut)
                            dbo.collection("move_not_after_checkin_32_33")
                                .insertOne({ id: u, checkinTime: ckt })
                        console.log(count++)
                    })
            })

        })

}

async function func2() {
    let count = 0;
    let buildingslist = await dbo.collection("buildings").find({}).toArray()
    let buildmap = new Map()
    buildingslist.forEach(b => {
        buildmap.set(b.x * 100 + b.y, b.building)
    })
    let udIndex = 0;
    dbo.collection("not_goto_kiddle").find({}).forEach(async u => {
        let arr = await dbo.collection("movement").find({
            id: u.id, day: 7, type: "check-in",
            $and: [
                { Timestamp: { $gt: new Date(2014, 6, 8, 8, 0, 0, 0) } },
                { Timestamp: { $lt: new Date(2014, 6, 8, 13, 30, 0, 0) } }
            ]
        }).toArray()
        if (arr.length > 0) {
            let pathdata = []
            arr.forEach(a => {
                let b = buildmap.get(a.X * 100 + a.Y)
                if (b) {
                    pathdata.push(b)
                } else {
                    buildmap.set(a.X * 100 + a.Y, "undefined_" + udIndex)
                    udIndex++;
                    pathdata.push(buildmap.get(a.X * 100 + a.Y))
                }
            })
            dbo.collection("sun_morning_check_path").insertOne({ id: u.id, path: pathdata })
        }
        count++;
        if (count % 100 == 0)
            console.log(count)
    })
}

async function func3() {
    let count = 0;
    //levenshteinDistance
    let totalUsers = await dbo.collection("sun_morning_check_path").find({}).toArray()
    let lettermap = new Map()
    let letterind = 0
    totalUsers.forEach(u => {
        let fin = ""
        u.path.forEach(p => {
            let letter = lettermap.get(p)
            if (!letter) {
                lettermap.set(p, getLetter(letterind))
                letterind++
                letter = lettermap.get(p)
            }
            fin += letter
        })
        u.str = fin
    })

    totalUsers.forEach(u => {
        u.leven = []
        for (let i = 0; i < totalUsers.length; i++) {
            const el = totalUsers[i];
            if (el != u) {
                u.leven.push({ id: el.id, len: levenshteinDistance(u.str, el.str) })
            }
        }
    })
    totalUsers.forEach(u => {
        dbo.collection("sun_morning_check_path").updateOne({ id: u.id }, { $set: { leven: u.leven } })
        if (count % 100 == 0)
            console.log(count)
        count++
    })
}

async function func4() {
    let result = await dbo.collection("sun_morning_check_path").find({}, { id: 1 }).toArray()
    for (let i = 0; i < result.length; i++) {
        const user = result[i];
        let col = await dbo.collection("sun_morning_check_path").findOne({ id: user.id })
        let buff = []
        for (let j = 0; j < col.leven.length; j++) {
            const le = col.leven[j];
            //let leid = parseInt(le.id)
            //let fid;
            //if (uid < leid)
            //    fid = uid + "-" + leid
            //else
            //    fid = leid + "-" + uid
            buff.push({ pairA: user.id, pairB: le.id, len: le.len })
        }
        dbo.collection("sun_morning_pair").insertMany(buff)
        console.log(i)
    }
}

function func5() {
    dbo.collection("sun_morning_pair_above_0").find({}).forEach(u => {
        dbo.collection("sun_morning_pair").find({ pairA: u.id }).toArray((err, arr) => {
            let sum = 0
            for (let i = 0; i < arr.length; i++) {
                sum += arr[i].len
            }
            sum = sum / arr.length
            dbo.collection("sun_morning_pair_above_0").updateOne(
                { id: u.id }, { $set: { avg: sum } }
            )
        })
    }, () => {
        console.log("complete")
    })
}

async function fewCheckin() {
    let count = 0;

    dbo.collection("users").find({ stay_in_park: 3, id: "1089132" }).forEach(async u => {
        let arr = await dbo.collection("movement").find({ day: 7, id: u.id, type: "check-in" }).toArray()
        let c = arr.length
        console.log(c)
        //if (c <= 10) {
        //    dbo.collection("few_checkin_users").insertOne({ id: u.id, count: c, data: arr, day: 7 })
        //}
        count++;
        if (count % 100 == 0) {
            console.log(count)
        }
    })
}

async function fewCheckin2() {
    let count = 0;
    let arr = await dbo.collection("few_checkin_users").find({}).toArray()
    await arr.AsyncForeach(async u => {
        let fewcheck = await dbo.collection("few_cm_ck_users").find({ id: u.id }).count()
        if (fewcheck == 0) {
            await dbo.collection("few_cm_ck_users").insertOne({ id: u.id })
        }
        count++
        //if(count%100 == 0)
        //{
        console.log(count)
        //}
    })
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


async function funn() {
    let arr = await dbo.collection("sum_morning_goto_3_before").find({}).forEach(async u => {
        let ck = await dbo.collection("movement")
            .find({ id: u.id, X: 38, Y: 90, type: "check-in" })
            .toArray()
        let path = await dbo.collection("path").findOne({ id: u.id })
        let pathlist = path.pathlist
        let buff = []
        for (let i = 0; i < ck.length; i++) {
            const el = ck[i];
            for (let j = 0; j < pathlist.length; j++) {
                const pl = pathlist[j];
                if (pl.day == el.day) {
                    let ckt
                    for (let ti = 0; ti < pl.path.length; ti++) {
                        const p = pl.path[ti];
                        if (p.indexOfDay == el.indexOfDay) {
                            let ta = ck[i].Timestamp
                            let tb = pl.path[ti + 1].Timestamp
                            let delta = (tb.getTime() - ta.getTime()) / 1000 / 60
                            let di = 2
                            while (delta <= 0) {
                                tb = pl.path[ti + di].Timestamp
                                delta = (tb.getTime() - ta.getTime()) / 1000 / 60
                                ti++
                            }

                            buff.push({
                                checkinTime: ta,
                                moveTime: tb,
                                stayTime: (tb.getTime() - ta.getTime()) / 1000 / 60
                            })
                        }
                    }
                }
            }
        }
        let total = 0
        buff.forEach(b => {
            total += b.stayTime
        })
        dbo.collection("sun_goto3_stay_time").insertOne({ id: u.id, data: buff, total: total, avg: total / buff.length, count: buff.length })
        console.log(count++)

    })

}



function levenshteinDistance(s, t) {
    if (s.length > t.length) {
        var temp = s;
        s = t;
        t = temp;
        delete temp;
    }
    var n = s.length;
    var m = t.length;
    if (m == 0) {
        return n;
    }
    else if (n == 0) {
        return m;
    }
    var v0 = [];
    for (var i = 0; i <= m; i++) {
        v0[i] = i;
    }
    var v1 = new Array(n + 1);
    var cost = 0;
    for (var i = 1; i <= n; i++) {
        if (i > 1) {
            v0 = v1.slice(0);
        }
        v1[0] = i;
        for (var j = 1; j <= m; j++) {
            if (s[i - 1].toLowerCase() == t[j - 1].toLowerCase()) {
                cost = 0;
            }
            else {
                cost = 1;
            }
            v1[j] = Math.min.call(null, v1[j - 1] + 1, v0[j] + 1, v0[j - 1] + cost);
        }
    }
    return v1.pop();
}



Date.prototype.Format = function (fmt) { //author: meizz   
    var o = {
        "M+": this.getMonth() + 1,                 //月份   
        "d+": this.getDate(),                    //日   
        "h+": this.getHours(),                   //小时   
        "m+": this.getMinutes(),                 //分   
        "s+": this.getSeconds(),                 //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}  