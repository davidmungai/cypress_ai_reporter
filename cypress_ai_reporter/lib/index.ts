const flowId= 1
export default function teamcity(runner:any) {


	runner.on('suite', function (suite:any) {
		if (suite.root) return;
		suite.startDate = new Date();
		console.log('##teamcity[testSuiteStarted name=\'' + escape(suite.title) + '\' flowId=\'' + flowId + '\']');
	});

	runner.on('test', function (test:any) {
		console.log('##teamcity[testStarted name=\'' + escape(test.title) + '\' flowId=\'' + flowId + '\'  captureStandardOutput=\'true\']');
	});

	runner.on('fail', function (test:any, err:any) {
		console.log('##teamcity[testFailed name=\'' + escape(test.title) + '\' flowId=\'' + flowId + '\' message=\'' + escape(err.message) + '\' captureStandardOutput=\'true\' details=\'' + escape(err.stack) + '\']');
	});

	runner.on('pending', function (test:any) {
		console.log('##teamcity[testIgnored name=\'' + escape(test.title) + '\' flowId=\'' + flowId + '\' message=\'pending\']');
	});

	runner.on('test end', function (test:any) {
		console.log('##teamcity[testFinished name=\'' + escape(test.title) + '\' flowId=\'' + flowId + '\' duration=\'' + test.duration + '\']');
	});

	runner.on('suite end', function (suite:any) {
		if (suite.root) return;
		console.log('##teamcity[testSuiteFinished name=\'' + escape(suite.title) + '\' duration=\'' + flowId + '\' flowId=\'' + flowId + '\']');
	});

	runner.on('end', function () {
		var duration;
		console.log('##teamcity[testSuiteFinished name=\'mocha.suite\' duration=\'' + duration + '\' flowId=\'' + flowId + '\']');
	});
}

