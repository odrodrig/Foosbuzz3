//These functions are used to interact with the GameFile

//constructor
function Game () {
	this.startGame= startGame;
	this.endGame= endGame;
	this.resetGame= resetGame;
	this.goal= goal;
	this.setUser= setUser;
	this.goalTime= goalTime;
	this.clearGameFile= clearGameFile;
	this.isOld= isOld;
}

//Function that starts the game. Sets start time and gameActive to true
function startGame (gameFile) {

	if (!gameFile.gameActive) {

		gameFile.start = getTime();
		gameFile.gameActive = true;
		console.log("Starting Game");

	} else {

		console.log("Game is already active. Reseting game instead.");
		resetGame(gameFile);

	}
}

//Function that ends the game. Sets the end time and gameActive to false.
function endGame (gameFile) {

	if (gameFile.gameActive) {

		gameFile.end = getTime();
		gameFile.gameActive = false;
		console.log("Game Ended");
		console.log(gameFile);

	} else {

		console.log("No game is active right now");
		return false;

	}
}

//Function that resets the game if one is currently active
function resetGame(gameFile) {

	if (gameFile.gameActive) {

		endGame(gameFile);
		clearGameFile(gameFile);
		startGame(gameFile);

	} else {

		console.log("No game is active right now. Starting game instead.");
		startGame(gameFile);

	}
}

//Handle goal events
function goal(gameFile, userGoalFor, userGoalAgainst, team) {

	if (team == 1) {

		gameFile.goalsTeam1++;

	} else if (team == 2) {

		gameFile.goalsTeam2++;

	}

	userGoalFor.goalsFor++;
	userGoalAgainst.goalsAgainst++;
	goalTime(gameFile);

}

//Set the users in the GameFile
function setUser(gameFile, user, team) {

	if (team == 1) {
		gameFile.userTeam1 = user;
	} else if (team == 2) {
		gameFile.userTeam2 = user;
	} else {
		console.log("Invalid team selection");
	}
}

//Sets the time at which the last goal was scored
function goalTime (gameFile) {

	gameFile.lastBall = getTime();
}

//Sets the gameFile back to default values
function clearGameFile(gameFile) {

	gameFile.gameID = "";
	gameFile.start = "";
	gameFile.end = "";
	gameFile.gameActive = false;
	gameFile.lastBall = "";
	gameFile.goalsTeam1 = 0;
	gameFile.goalsTeam2 = 0;
	gameFile.userTeam1 = "Player 1";
	gameFile.userTeam2 = "Player 2";
	gameFile.IDTeam1 = "";
	gameFile.IDTeam2 = "";

}

//This function determins if a game is old or not. Old is considered longer that 20 minutes without a goal scored.
function isOld (gameFile) {

	var lMins = Math.round(gameFile.lastBall / 60000);
	var cMins = Math.round(getTime() / 60000);

	if(cMins - lMins >= 20) {
		return true;
	}
	else {
		return false;
	}
}

//Quick function that returns timestamp in miliseconds
function getTime () {

	var d = new Date();
	var ts = d.getTime();
	return ts;

}

module.exports = new Game();
