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
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;

var GameFile = require("./objects/gameFile");
var User = require("./objects/user");
var game = require("./util/game");
var login = require("./routes/login");

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

//Instantiating Game File
var gf = new GameFile;

//Instantiating both players
var player1 = new User;
var player2 = new User;

var team = "";

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
	if(payload == 3) {

		console.log("reset");
		io.emit('reset', {reset: true});
		game.resetGame(gf);
		logOutUsers();

		//Handle goal for team 1
	} else if(payload == 1) {



		if(isValid(gf)) {

			console.log("goal team 1");
			game.goal(gf, player1, player2, 1);
			io.emit('goal', {team: 1, game: gf});

			if (gf.goalsTeam1 >= 5) {
				io.emit("gameWon", {team: 1, game:gf});
				endGame(gf);
			}

		} else {
			console.log("Error recording score");
		}

		//Handle goal for team 2
	} else if(payload == 2) {

		if(isValid(gf)) {

			console.log("goal team 2");
			game.goal(gf, player2, player1, 2);
			io.emit('goal', {team: 2, game: gf});

			if (gf.goalsTeam2 >= 5) {
				io.emit("gameWon", {team: 2, game:gf});
				endGame(gf);

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


// Update the credentials with the information from your Twitter app
passport.use(new Strategy({
    consumerKey: "RdB7v2jBMMeoPzUPoCjLzU3Es",
    consumerSecret: "S3j34kIYNQZhRoFBWU4bnUr4HGaDO6880zHvJCK0sn4U8sjUzg",
    callbackURL: "http://foosbuzz3.mybluemix.net/login/twitter/return"
  },
  function(token, tokenSecret, player, cb) {

	// Grab the Twitter photo and strip out the minimizer
    var photo = player.photos[0].value;
    photo = photo.replace("_normal", "");

  	// Let Node-RED know there has been a successful login and send the profile data for further processing
  	var twitterData = {
			id:player.id,
			handle:player.username,
			name:player.displayName,
			photo:photo,
			chosenTeam:team
		};

		console.log("twitterData is ");
		console.log(twitterData);

		twitterLogin(twitterData);


		// client.post("http://yourwebsite.com/player", args, function (data, response) {
		// 	//console.log(data);
		// 	//console.log(response);
		// });

    return cb(null, player);
}));

// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

//------------------------------------------------------------------------------
//3. Endpoints                                                      ---------------
//------------------------------------------------------------------------------

app.get("/end", function(req, res) {

	if(isValid(gf)) {

		endGame(gf);
		logOutUsers();

		res.send(true);

	} else {

		console.log("Error ending game.");
		res.send({error: "Error ending game"});

	}

})

//Starts the game
app.get("/start", function(req, res) {

	if (isValid(gf)) {

		game.startGame(gf);
		res.send(true);

	} else {
		console.log("Error starting game.");
		res.send({error: "Error starting game."});
	}

})

//Retrieves leaderboard
app.get("/getLeague", function(req, res) {

	//get users from db


})

app.get("/rematch", function(req, res) {

	var oldTeam1 = gf.userTeam1;
	var oldTeam2 = gf.userTeam2;

	var oldPlayer1 = player1;
	var oldPlayer2 = player2;

	game.resetGame(gf);

	gf.userTeam1 = oldTeam1;
	gf.userTeam2 = oldTeam2;

	game.loggedIn.player1 = true;
	game.loggedIn.player2 = true;

	io.emit("reset");

	res.send(gf);

});



//Sends gameFile to the front-end
app.get("/currentGame", function(req, res) {

		res.send({
			game: gf,
			players: {
				 player1: player1,
			 	 player2: player2
			}
		});
});

// Manually handling login for each side with a login1 and login2
app.get('/login1', function(req, res) {
	team = 1;
	res.redirect('/login/twitter');
});

app.get('/login2',function(req, res) {
	team = 2;
	res.redirect('/login/twitter');
});

app.get('/login/twitter',passport.authenticate('twitter', { forceLogin: true }));

app.get('/login/twitter/return',
  passport.authenticate('twitter', { failureRedirect: '/', successRedirect: '/' }),
  function(req, res) {
		console.log("in the Twitter callback");
  req.logout();
  //res.redirect('/');
});

//------------------------------------------------------------------------------
//4. Function Declarations                                          ---------------
//------------------------------------------------------------------------------

//Handles log in data from Twitter
function twitterLogin(data) {

	// if(game.loggedIn.player1) {
	// 	res.send({error: "player1 logged in"});
	// }
	//
	// if(game.loggedIn.player2) {
	// 	res.send({error: "player2 logged in"});
	// }

	if(isValid(gf)) {

		var loginId = data.id;
		var loginName = data.name;
		var loginTeam = data.chosenTeam;
		var loginHandle = data.handle;
		var loginPhoto = data.photo;

		console.log("this is loginTeam "+loginTeam);

		if (loginTeam == 1) {

			player1.id = loginId;
			player1.name = loginName;
			player1.handle = loginHandle;
			player1.photo = loginPhoto;

			gf.userTeam1 = loginName;
			gf.IDTeam1 = loginHandle;

			console.log("begin player 1");
			console.log(player1);
			console.log("end player 1");

			//game.setUser(gf, loginName, 1)
			game.loggedIn.player1 = true;
			//console.log(player1);
			io.emit("login", {player: player1, team: 1});

		}

		if (loginTeam == 2) {

			player2.id = loginId;
			player2.name = loginName;
			player2.handle = loginHandle;
			player2.photo = loginPhoto;

			gf.userTeam2 = loginName;
			gf.IDTeam2 = loginHandle;

			//game.setUser(gf, loginName, 2);
			game.loggedIn.player2 = true;
			console.log("player 2");
			console.log(player2);
			io.emit("login", {player: player2, team: 2});

		}

	}

};

//Check whether the gamefile is valid
function isValid(gf) {

	if (gf.gameActive == true && game.isOld(gf) == false) {

		return true;

	} else if (gf.gameActive == false) {

		game.startGame(gf);
		io.emit("gameStart");
		return true;

	} else if (game.isOld(gf)) {

		logOutUsers();
		game.resetGame(gf);
		io.emit("gameStart");
		return true;

	}

	return false;


}

function endGame(gf) {
	game.endGame(gf);
	updatePlayerStats();
	storeGame();
	game.clearGameFile(gf);
	console.log(gf);
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

function logOutUsers() {
	player1 = new User();
	player2 = new User();

	console.log(player1);
	console.log(player2);
}


//------------------------------------------------------------------------------
//5. Starting Express Server                                        ---------------
//------------------------------------------------------------------------------



// // start server on the specified port and binding host
// app.listen(appEnv.port, '0.0.0.0', function() {
//   // print a message when the server starts listening
//   console.log("server starting on " + appEnv.url);
// });
