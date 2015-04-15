Package.describe({
	name: "hellstad:colourise",
	summary: "Design quicker. Click to change any element's colours!",
	version: "0.1.3",
	git: "https://github.com/hellstad/meteor-colourise",
	debugOnly: true
});

Package.onUse(function(api) {
	api.versionsFrom("1.0.1");
	api.use(["meteor", "ddp", "jquery", "mongo", "templating", "session", "tracker"]);

	ironRouterExists = function () {
		var fs = Npm.require('fs');
		var path = Npm.require('path');
		var meteorPackages = fs.readFileSync(path.resolve('.meteor/packages'), 'utf8');
		return !!meteorPackages.match(/iron-router\n/);
	}
	if (ironRouterExists()) {
		api.use(['iron-router'], ['client', 'server']);
	}
	
	serverFiles = [
		"server/colourise.js"
	];

	clientFiles = [
		"client/colourise.css",
		"client/colourise.html",
		"client/colourise.js",
	];

	api.addFiles(serverFiles, "server");
	api.addFiles(clientFiles, "client");

	//api.export("Colourise");
});