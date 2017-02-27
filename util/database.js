//database.js
//Author: Oliver Rodriguez
//
//These functions are used to interact with the database


function database () {

  this.storeGame= storeGame;
  this.updatePlayerStats= updatePlayerStats;
  this.getLastGameID= getLastGameID;
  this.getLeague= getLeague;

}

//Handles sending the gameFile to the database
function storeGame (gameFile) {

}

//Sends player stats to the database
function updatePlayerStats (user) {

}

//Gets the index of the last game played
function getLastGameID() {

}

//Gets all the players in the league
function getLeague() {

}

module.exports = new database();
