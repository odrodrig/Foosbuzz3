//Game File object

//Constructor for building the game file
//The game file is how we keep track of the players and goals in a game
function GameFile () {
	this.gameID = "";
	this.start = "";
	this.end = "";
	this.gameActive = "";
	this.lastBall = "";
	// this.currentBall = "";
	this.goalsTeam1 = 0;
	this.goalsTeam2 = 0;
	this.userTeam1 = "";
	this.userTeam2 = "";
	this.IDTeam1 = "";
	this.IDTeam2 = "";
}



//********************  Delete This ************************
// function GameFile (gameID, start, end, gameActive, lastBall, currentBall, goalsTeam1, goalsTeam2, userTeam1, userTeam2, IDTeam1, IDTeam2) {
// 	this.gameID = gameID;
// 	this.start = start;
// 	this.end = end;
// 	this.gameActive = gameActive;
// 	this.lastBall = lastBall;
// 	this.currentBall = currentBall;
// 	this.goalsTeam1 = goalsTeam1;
// 	this.goalsTeam2 = goalsTeam2;
// 	this.userTeam1 = userTeam1;
// 	this.userTeam2 = userTeam2;
// 	this.IDTeam1 = IDTeam1;
// 	this.IDTeam2 = IDTeam2;
// }
//***********************************************************

module.exports = GameFile;