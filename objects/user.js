function User () {
  this.name = "";
  this.handle = "";
  this.photo = "";
  this.wins = 0;
  this.losses = 0;
  this.goalsFor = 0;
  this.goalsAgainst = 0;
  this.totalGames = this.wins + this.losses;
  this.location = "";
}

module.exports = User;
