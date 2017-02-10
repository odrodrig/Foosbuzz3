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
var client = require("ibmiotf");
var cfenv = require('cfenv');

// create a new express server
var app = express();

var GameFile = require("./objects/gameFile");
var game = require("./util/game");
var login = require("./routes/login");

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

//------------------------------------------------------------------------------
//2. Watson IoT Connections                                         ---------------
//------------------------------------------------------------------------------

//Credentials from Watson IoT Platform
var appClientConfig = {
	"org" : "5knvov",
	"id" : "foosbuzz3",
	"domain": "internetofthings.ibmcloud.com",
	"auth-key" : "a-5knvov-lsruwlqlx0",
	"auth-token" : "G?_Zg14oNDD5DnUVyk"
}

var appClient = new client.IotfApplication(appClientConfig);
// appClient.log.setLevel('trace');
appClient.connect();

//Handles when the application connects to the platform
appClient.on("connect", function() {
	console.log("Client connected!");

	//Subscribe to all events from the table
	appClient.subscribeToDeviceEvents();
})

appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {

	console.log("payload = "+payload);

	//Determine how to handle game event based on what the incomming sensor payload is
	switch(payload) {

		//Game Reset
	  	case 0: {

			if (!gf) {
				var gf  = new GameFile;
			}

			game.resetGame(gf);

			break;

		}

		//Goal Team 1
		case 1: {

			if (!gf) {
				var gf  = new GameFile;
			}
			
			game.goalTeam1(gf);

		}

		//Goal Team 2
		case 2: {

			if (!gf) {
				var gf  = new GameFile;
			}

			game.goalTeam2(gf);

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

	console.log(game.isOld(gf1));
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

app.get("/playerOne", function(req, res) {

	if(!gf) {
		var gf  = new GameFile;
	}

	//gf.userTeam1 = req.query.name;

})

app.get("/playerTwo", function(req, res) {

	if (!gf) {
		var gf = new GameFile;
	}

	//gf.userTeam2 = req.query.name;

})

//------------------------------------------------------------------------------
//4. Function Declarations                                          ---------------
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
//5. Starting Express Server                                        ---------------
//------------------------------------------------------------------------------

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
