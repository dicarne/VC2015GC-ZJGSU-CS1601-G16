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

    let stream = fs.createReadStream(current_url + "/data/BuildingsLocation.csv")
    let streamReadInterface = readline.createInterface(stream)
    let ind = 0;
    let buff = [];
    streamReadInterface.on("line", async l => {
        if (ind == 0) {
            ind++;
            return;
        }
        let linedata = l.split(",")
        let building = {
            x: parseInt(linedata[1]),
            y: parseInt(linedata[2]),
            building: linedata[0],
            type: linedata[4]
        }
        let res1 = await dbo.collection("movement")
            .find({ "X": building.x, "Y": building.y })
            .limit(1)
            .toArray()
        if (!res1 && res1.length == 0) {
            console.log("cant find " + building.building)
            return;
        }
        if (res1.type == "check-in") {
            building.checkin = true;
        }
        else {
            building.checkin = false;
        }
        await dbo.collection("buildings").insertOne(building)
        console.log(building.building)
    })

    //streamReadInterface.on("close", c => {
    //    dbo.db_connect.close();
    //})



}
