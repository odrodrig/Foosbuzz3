//These functions are used to interact with the GameFile

//constructor
function Game () {
	this.startGame= startGame;
	this.endGame= endGame;
	this.resetGame= resetGame;
	this.goalTime= goalTime;
	this.isOld= isOld;
}

//Function that starts the game. Sets start time and gameActive to true
function startGame (gameFile) {

	gameFile.start = getTime();
	gameFile.gameActive = true;
}

//Function that ends the game. Sets the end time and gameActive to false.
function endGame (gameFile) {

	gameFile.end = getTime();
	gameFile.gameActive = false;
}

//Function that resets the game if one is currently active
function resetGame(gameFile) {

	if (gameFile.gameActive) {

		endGame(gameFile);
		startGame(gameFile);

	} else {

		console.log("No game is active right now.");

	}
}

//Handle goal events for Team 1
function goalTeam1(gameFile) {

	gameFile.goalsTeam1++;
	goalTime(gameFile);

}

//Handle goal events for Team 2
function goalTeam2(gameFile) {

	gameFile.goalsTeam2++;
	goalTime(gameFile);

}

//Sets the time at which the last goal was scored
function goalTime (gameFile) {

	gameFile.lastBall = getTime();
}

//This function determins if a game is old or not. Old is considered longer that 20 minutes without a goal scored.
function isOld (gameFile) {

	var lMins = Math.round(gameFile.lastBall / 60000);
	var cMins = Math.round(getTime() / 60000);

	console.log(cMins - lMins);

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
