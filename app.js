/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var iot = require("iotf");

var GameFile = require("./objects/gameFile");
var game = require("./util/game");
var login = require("./routes/login");

var gf1 = new GameFile;
var gf2 = new GameFile;
game.startGame(gf1);
game.goalTime(gf1);

gf1.userTeam1 = "john";
gf2.userTeam1 = "jane";

// var gf1 = new GameFile(1, 1, 1, false, 1, 1, 1, 1, "john", "doe", "twitter1", "Twitter2");
// var gf2 = new GameFile(2, 2, 2, true, 2, 2, 2, 2, "jane", "moe", "twitter3", "Twitter4");

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

app.get("/test", function(req, res) {

	console.log(game.isOld(gf1));
	res.send("testing");

})

app.get("/end", function(req, res) {

	game.endGame(gf1);
	res.send(gf1);

})

app.get("/login", login);

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
