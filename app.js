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
appClient.log.setLevel('trace');
appClient.connect();

//Handles when the application connects to the platform
appClient.on("connect", function() {
	console.log("Client connected!");

	appClient.subscribeToDeviceEvents("table","foosbuzz","message");

	appClient.on("message", function() {

		console.log("Data recevied!");
		//console.log(payload);

	})


	//Subscribe to all events from the table
	//appClient.subscribeToDeviceEvents();
})

// appClient.on("message", function() {

// 	console.log("Data recevied!");
// 	//console.log(payload);

// })

//Outputs error events
appClient.on("error", function(error) {
	console.log("Error: " + error);
})


//***************** Test Data. Please ignore ***************************
var gf1 = new GameFile;
var gf2 = new GameFile;
game.startGame(gf1);
game.goalTime(gf1);

gf1.userTeam1 = "john";
gf2.userTeam1 = "jane";

// var gf1 = new GameFile(1, 1, 1, false, 1, 1, 1, 1, "john", "doe", "twitter1", "Twitter2");
// var gf2 = new GameFile(2, 2, 2, true, 2, 2, 2, 2, "jane", "moe", "twitter3", "Twitter4");

//***************** Test Data. Please ignore ***************************

//------------------------------------------------------------------------------
//3. Endpoints                                                      ---------------
//------------------------------------------------------------------------------

app.get("/test", function(req, res) {

	console.log(game.isOld(gf1));
	res.send("testing");

})

app.get("/end", function(req, res) {

	game.endGame(gf1);
	res.send(gf1);

})

//app.get("/login", login);

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
