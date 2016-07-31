var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('hello there');
});

app.listen(process.env.OPENSHIFT_NODEJS_PORT || 80, process.env.OPENSHIFT_NODEJS_IP || '10.0.0.11', function() {
  console.log("Go ahead, Atlanta. I'm listening...");
});
