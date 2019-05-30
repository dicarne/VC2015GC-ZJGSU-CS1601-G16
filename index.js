var express = require('express');
var app = express();



app.get('/',(req,res)=>{
    res.send('hello world');
})

app.use('/static', express.static("./static"));
app.use('/analyse', express.static("./analyse"));

// api
const api = require('./router/api.js');
app.use('/api', api);


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});


app.listen(8080);

require("./monque.js")