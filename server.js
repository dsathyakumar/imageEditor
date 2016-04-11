var express = require('express');
var app = express();
app.use("/dist", express.static(__dirname + '/dist'));
app.use("/assets", express.static(__dirname + '/assets'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
var path = require('path');

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/imageEditor.html'));
});

app.listen(8080, function(){
  console.log('All bundles up!');
});
