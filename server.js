var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var lastUserID = 1;

var users = {};
var userQueue = [];

function getUserID() {
  return ++lastUserID;
}
function enqueue(user) {
  var wasPaired = pairUserWith(user);

  if(!wasPaired) {
    users[user.id] = user;
    userQueue.push(user.id);
  }
  console.log('users in queue: ' + userQueue.length);
}
function removeUser(user) {
  delete users[user.id];
}
function pairUserWith(userA) {
    var userB = null;
    while(userQueue.length > 0) {
      var userID = userQueue.shift();
      if(users[userID] && userID !== userA.id) {
        userB = users[userID];
        break;
      }
    }
    if(userB) {
      console.log('found a match!');
      var notifyThatHoldHasEnded = function(userToNotify) {
        console.log('notify event');
        delete users[userA];
        delete users[userB];
        userToNotify.socket.emit('hold-has-ended');
      };

      userA.socket.emit('hold-has-started', {
        name: userB.name
      });
      userA.socket.on('end-hold', notifyThatHoldHasEnded.bind(null, userB));

      userB.socket.emit('hold-has-started', {
        name: userA.name
      });
      userB.socket.on('end-hold', notifyThatHoldHasEnded.bind(null, userA));
    }
    return userB;
}

app.get(/^(.+)$/, function(req, res){
  res.sendfile( __dirname + '/build/' + req.params[0]);
});

io.on('connection', function(userSocket) {
  var newUser = null;
  userSocket.on('start-hold', function(data) {
    newUser = newUser || {
      id: getUserID(),
      name: data.name,
      socket: userSocket
    };
    console.log(data.name + ' is starting the hold');
    enqueue(newUser);
  });
  userSocket.on('end-hold', function(data) {
    console.log(data.name + ' is ending the hold');
    if(newUser) {
      removeUser(newUser);
    }
  });
});

http.listen(process.env.OPENSHIFT_NODEJS_PORT || 80, process.env.OPENSHIFT_NODEJS_IP || '10.0.0.11', function() {
  console.log("Go ahead, internet. I'm listening...");
});
