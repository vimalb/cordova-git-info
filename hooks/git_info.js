module.exports = function(ctx) {

    var fs = require('fs');
    var path = require('path');
    var _ = require('lodash');
    var child_process = require('child_process');

    var projectRoot = ctx.opts.projectRoot;
    var pluginName = ctx.opts.plugin.id;

    var gitInfoTemplate = `
		cordova.define("{pluginName}.gitInfo", function(require, exports, module) { var gitInfo = {
		    COMMIT_HASH: "{commitHash}",
		    BUILD_DATE: "{buildDate}"
		}
		module.exports = gitInfo;
		});
	`;

  return new Promise((res) => {
    child_process.execFile("git", ["rev-parse", "HEAD"], {cwd: projectRoot}, function(error, stdout, stderr) {
      var commitHash = stdout.trim();
      var buildDate = (new Date()).toISOString();
      var gitInfoContent = gitInfoTemplate
      						.replace("{commitHash}", commitHash)
      						.replace("{buildDate}", buildDate)
      						.replace("{pluginName}", pluginName);

      _.each(ctx.opts.cordova.platforms, function(platform) {
      	var infoFile = path.join(projectRoot, 'platforms', platform, 'platform_www', 'plugins', pluginName, 'www', 'gitInfo.js');
      	fs.writeFileSync(infoFile, gitInfoContent);
      	console.log("git_info updated", infoFile);
      });

      res();
    });
  });
};


