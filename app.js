/*eslint-env node*/

//------------------------------------------------------------------------------
// Foosbuzz v.3
//
// Authors: Oliver Rodriguez, Stefania Kaczmarczyk, Vance Morris
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
//1. Requiring Modules and Necessary Setup                          ---------------
//------------------------------------------------------------------------------

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var client = require("ibmiotf");
var cfenv = require('cfenv');

var GameFile = require("./objects/gameFile");
var User = require("./objects/user");
var game = require("./util/game");
var login = require("./routes/login");

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

//Instantiating Game File
var gf = new GameFile;

//Instantiating both players
var player1 = new User;
var player2 = new User;

var loggedIn = {
	player1: false,
	player2: false
}

//------------------------------------------------------------------------------
//2. Watson IoT Connections                                         ---------------
//------------------------------------------------------------------------------

server.listen(appEnv.port, function () {
	console.log('Server starting on port ' + appEnv.port);
});

//Credentials from Watson IoT Platform
var appClientConfig = {
	"org" : "5knvov",
	"id" : "foosbuzz3",
	"domain": "internetofthings.ibmcloud.com",
	"auth-key" : "a-5knvov-lsruwlqlx0",
	"auth-token" : "G?_Zg14oNDD5DnUVyk",
	"enforce-ws" : true
}

var appClient = new client.IotfApplication(appClientConfig);
// appClient.log.setLevel('trace');

appClient.connect();


//Handles when the application connects to the platform
appClient.on("connect", function() {
	console.log("IoT client connected!");

	//Subscribe to all events from the table
	appClient.subscribeToDeviceEvents();
})

//Handle events from the table
appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {

	//Handle reset button
	if(payload == 0) {

		console.log("reset");
		io.emit('reset', {});
		game.resetGame(gf);

		//Handle goal for team 1
	} else if(payload == 1) {

		if(isValid(gf)) {

			console.log("goal team 1");
			io.emit('goal', {team: 1});
			game.goal(gf, player1, player2, 1);

			if (gf.goalsTeam1 >= 5) {
				game.endGame(gf);
				updatePlayerStats();
				storeGame();
				game.clearGameFile(gf);
				console.log(gf);
			}

		} else {
			console.log("Error recording score");
		}

		//Handle goal for team 2
	} else if(payload == 2) {

		if(isValid(gf)) {

			console.log("goal team 2");
			io.emit('goal', {team: 2});
			game.goal(gf, player2, player1, 2);

			if (gf.goalsTeam2 >= 5) {
				game.endGame(gf);
				updatePlayerStats();
				storeGame();
				game.clearGameFile(gf);
				console.log(gf);
			}

		} else {
			console.log("Error recording score");
		}

	}

});

//Outputs error events
appClient.on("error", function(error) {
	console.log("Error: " + error);
})


//------------------------------------------------------------------------------
//3. Endpoints                                                      ---------------
//------------------------------------------------------------------------------

app.get("/test", function(req, res) {

	res.send("testing");
})

app.get("/end", function(req, res) {

	game.endGame(gf);
	res.send(gf);

})

app.get("/start", function(req, res) {

	if (!gf) {
		var gf = new GameFile;
	}

	game.startGame(gf);

})

/*
* @QueryParam {string} name - The name of the player. Taken from Twitter
* @QueryParam {int} team - The team number of whoever is logging in. Only the numbers 1 and 2 are supported
*/
app.get("/login", function(req, res) {

	if(loggedIn.player1) {
		res.send({error: "player1 logged in"});
	}

	if(loggedIn.player2) {
		res.send({error: "player2 logged in"});
	}

	if(isValid(gf)) {

		var reqTeam = req.query.team;
		var reqName = req.query.name;

		if (reqTeam == 1) {

			player1.name = reqName;
			game.setUser(gf, reqName, 1)
			res.send(player1);

		} else if (reqTeam == 2) {

			player2.name = reqName;
			game.setUser(gf, reqName, 2);
			res.send(player2);

		} else {
			res.send({error: "Invalid team selection"});
		}

	}

});

app.get("/getGameFile", function(req, res) {
//Sends gameFile to the front endGame

		res.send(gf);
});

//------------------------------------------------------------------------------
//4. Function Declarations                                          ---------------
//------------------------------------------------------------------------------

//Check whether the gamefile is valid
function isValid(gf) {

	if (gf.gameActive == true && game.isOld(gf) == false) {

		return true;

	} else if (game.isOld(gf)) {

		game.resetGame(gf);
		return true;

	} else if (gf.gameActive == false) {

		game.startGame(gf);
		return true;

	}

	return false;


}

//Stores game file in Cloudant
function storeGame(gameFile) {
	console.log("Storing game file");
}

//Updates player stats for the leaderboard
function updatePlayerStats() {

	console.log("Updating player stats");

}

//Gets the last game ID in Cloudant
function getLastGameID() {

}


//------------------------------------------------------------------------------
//5. Starting Express Server                                        ---------------
//------------------------------------------------------------------------------



// // start server on the specified port and binding host
// app.listen(appEnv.port, '0.0.0.0', function() {
//   // print a message when the server starts listening
//   console.log("server starting on " + appEnv.url);
// });
