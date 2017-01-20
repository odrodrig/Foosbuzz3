function test() {
	this.testing = "testing";
	this.tester = function() {
		console.log("testing");
	}
}

module.exports = test;