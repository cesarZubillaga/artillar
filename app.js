var express = require('express'), 
scanFolder = require('scan-folder'),
fs = require('fs');


var app = express()
app.get('/', function (req, res) {
	res.render('index.pug')
})
//api
app.get('/tests', function (req, res) {
	var folder = __dirname+'/tests/'
	var sTests = scanFolder(folder, 'json')
	var identifiers = new Array()
	sTests.forEach(function(el){
		el = el.slice(el.lastIndexOf('\\')+1)
		identifiers.push(el)
	});
	res.send(identifiers);
})

app.get('/tests/:identifier', function (req, res) {
	var identifier = req.params.identifier
	console.log(req.params.identifier)
	var obj = JSON.parse(fs.readFileSync(__dirname + '/tests/' + identifier, 'utf8'))
	res.send(obj)
})

app.delete('/tests/:identifier', function(req, res){
	var identifier = req.params.identifier;
	res.send('ok')
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