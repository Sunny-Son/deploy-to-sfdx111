const logger = require('heroku-logger');
const got = require('got');
//import got from 'got';

module.exports = async function (template) {
	logger.debug(`deployMsgBuilder.js template is ${template}`);
	const message = {
		template
	};

	const path = template.replace('https://github.com/', '');
	//const path = 'Sunny-Son/TravelApp';
	message.path = path;
	message.username = path.split('/')[0];
	message.repo = path.split('/')[1];

	/*message.stepInfoUrl=template.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/tree','')+'/step.json';
	let stepinfo=await got(message.stepInfoUrl).catch(error => {console.log(error)});

	if(typeof stepinfo != 'undefined')message.stepInfo=JSON.parse(stepinfo.body);
	else message.stepInfo={"title":"","body":"","button":""};*/
	
	let steps=await got('https://raw.githubusercontent.com/'+message.username+'/'+message.repo+'/master/steps.json').catch(error => {console.log(error)});

	if(typeof steps != 'undefined')message.steps=JSON.parse(steps.body).steps;
	else message.steps=[{"title":"TravelApp","body":"Learn how to use Salesforce using TravelApp","button":"Title of the button that launch the deploy"}];
	//console.log("deployMsgBuilder.js message",message);

	if (path.includes('/tree/')) {
		// we're dealing with a branch
		message.branch = path.split('/tree/')[1];
	}

	message.deployId = encodeURIComponent(`${message.username}-${message.repo}-${new Date().valueOf()}`);

	//console.log("deployMsgBuilder.js message",message);
	// checking for whitelisting
	const whitelist1 = process.env.GITHUB_USERNAME_WHITELIST; // comma separated list of username
	const whitelist2 = process.env.GITHUB_REPO_WHITELIST; // comma separated list of username/repo
	logger.debug(`deployMsgBuilder.js whitelist1 is ${whitelist1}`);
	logger.debug(`deployMsgBuilder.js whitelist2 is ${whitelist2}`);

	if (whitelist1) {
		for (let username of whitelist1.split(',')) {
			if (username.trim() === message.username) {
				message.whitelisted = true;
				logger.debug('hit whitelist from username');
			}
		}
	}

	if (whitelist2) {
		for (let repo of whitelist2.split(',')) {
			logger.debug(`checking whitelist 2 element: ${repo}`);
			if (repo.trim().split('/')[0] === message.username && repo.trim().split('/')[1] === message.repo) {
				message.whitelisted = true;
				logger.debug('hit whitelist from username/repo');
			}
		}
	}

	logger.debug('deployMsgBuilder.js deploy message built');
	//logger.debug(message);
	//console.log("deployMsgBuilder.js message",message);

	return message;
};