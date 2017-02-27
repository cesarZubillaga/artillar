var express = require('express'), 
scanFolder = require('scan-folder'),
	yaml = require('js-yaml'),
    artillery = require('artillery'),
fs = require('fs');

var app = express()
app.get('/', function (req, res) {
    res.render('index.pug')
})
app.get('/runnabletests', function (req, res) {
	res.render('runnabletests.pug')
})
//api
var folder = __dirname+'/tests/'

app.get('/api/runnabletests', function (req, res) {
    var sTests = scanFolder(folder, 'yml')
    var identifiers = new Array()
    sTests.forEach(function(el){
        var doc = yaml.safeLoad(fs.readFileSync(el, 'utf8'));
        doc.name =  el.slice(el.lastIndexOf('\\')+1)
        identifiers.push(doc)
    });
    res.send(identifiers);
})
app.get('/api/runnabletests/:identifier', function (req, res) {
    var file = req.params.identifier;
    var fileLocation = folder + file;
    var date = new Date();
    var options = {
        output: './tests/' + date.getTime() + '_' + file.replace('.yml', '') + '.json'
    }
    artillery.run(fileLocation , options);
        res.send('ok')
})

app.get('/api/tests', function (req, res) {
    var sTests = scanFolder(folder, 'json')
    var identifiers = new Array()
    sTests.forEach(function(el){
        el = el.slice(el.lastIndexOf('\\')+1)
        identifiers.push(el)
    });
    res.send(identifiers);
})

app.get('/api/tests/:identifier', function (req, res) {
	var identifier = req.params.identifier
	var obj = JSON.parse(fs.readFileSync(folder + identifier, 'utf8'))
	res.send(obj)
})

app.delete('/api/tests/:identifier', function(req, res){
	var identifier = req.params.identifier;
	res.send(identifier)
})
//end api

//set pug (jade) as template engine
app.set('view engine', 'pug')

//public folder for assets
app.use(express.static('public'))
app.use(express.static('vendors'))

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})