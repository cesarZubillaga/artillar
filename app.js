var express = require('express'),
    scanFolder = require('scan-folder'),
    yaml = require('js-yaml'),
    artillery = require('artillery'),
    jsonfile = require('jsonfile'),
    bodyParser = require('body-parser'),
    fs = require('fs');

var app = express();
//configuration

//set pug (jade) as template engine
app.set('view engine', 'pug');
//folders for assets
app.use(express.static('public'));
app.use(express.static('vendors'));
//middleware to access to req.body
app.use(bodyParser.json());
//end of configuration

app.get('/', function (req, res) {
    res.render('index.pug');
});
app.get('/runnabletests', function (req, res) {
    res.render('runnabletests.pug');
});
//api
var folder = __dirname + '/tests/';
app.get('/api/runnabletests', function (req, res) {
    var sTests = scanFolder(folder, 'yml');
    var identifiers = [];
    sTests.forEach(function (el) {
        var doc = yaml.safeLoad(fs.readFileSync(el, 'utf8'));
        doc.name = el.slice(el.lastIndexOf('\\') + 1);
        identifiers.push(doc)
    });
    res.send(identifiers);
});

app.post('/api/runnabletests', function (req, res) {
    var runnabletest = req.body;
    console.log(runnabletest.name + '.yml')
    var yamlrunnabletest = {
        config: {
            target: runnabletest.target,
            phases: []
        },
        scenarios: []
    }
    yamlrunnabletest.config.phases.push(
        {
            duration: runnabletest.duration,
            arrivalRate: runnabletest.arrivalRate
        }
    );
    yamlrunnabletest.scenarios.push({flow: []});
    if(runnabletest.scenarios.length){
    runnabletest.scenarios.forEach(function (el) {
        yamlrunnabletest.scenarios[0].flow.push({
            get: {
                url: el
            }
        });
    })
    }else{
        yamlrunnabletest.scenarios[0].flow.push({
            get: {
                url: "/"
            }
        });
    }
    var yamlConfigFile = yaml.dump(yamlrunnabletest);
    fs.writeFileSync(folder + runnabletest.name + '.yml', yamlConfigFile);
    res.send('Ok');
});

app.put('/api/runnabletests/:identifier', function (req, res) {
    var file = req.params.identifier;
    var fileLocation = folder + file;
    var date = new Date();
    var fileName = (req.body.testResultName) ? req.body.testResultName : file.replace('.yml', '');
    var options = {
        output: './tests/' + fileName + '_' + date.getTime() + '.json'
    };
    artillery.run(fileLocation, options);
    res.send('ok')
});

app.get('/api/tests', function (req, res) {
    var sTests = scanFolder(folder, 'json', false);
    var identifiers = [];
    sTests.forEach(function (el) {
        el = el.slice(el.lastIndexOf('\\') + 1);
        identifiers.push(el)
    });
    res.send(identifiers);
});


app.get('/api/tests/:identifier', function (req, res) {
    var identifier = req.params.identifier;
    var file = folder + identifier;
    var obj = jsonfile.readFileSync(file);
    res.send(obj)
});

app.delete('/api/tests/:identifier', function (req, res) {
    var identifier = req.params.identifier;
    fs.unlink(folder + identifier);
    res.send(identifier)
});

var configurationFile = folder + 'config/config.json';
app.get('/api/configuration/tests', function (req, res) {
    res.send(jsonfile.readFileSync(configurationFile));
});

app.put('/api/configuration/tests', function (req, res) {
    jsonfile.writeFileSync(configurationFile, req.body);
    res.send('ok');
});
//end api

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});