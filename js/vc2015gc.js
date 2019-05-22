
async function StartAnalyse() {
    console.log("start");
    var data = await d3.csv("data/try.csv");
    console.log(data[0].txt);
}