# Artillar

This website tester it is prepared for checking the behaviour of your website returning multiple values such as.

  - Latency (min,max,median,p95,p99)
  - HTTP ERRORS
  
Those values are displayed with two types of graphics (bars and radar) and a table, and you can add/delete those graphics with simple interface.

### TODOs!
  - New interface for preparing and running tests.
  - Display the rest of the data available thanks to [Artillery] reports.

### Tech

Artillar uses a number of open source projects to work properly:

* [AngularJS] - HTML enhanced for web apps!
* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework [@tjholowaychuk]
* [Gulp] - the streaming build system
* [GulpLivereload] - for developing enviroment.
* [Artillery] - Node testing ToolKit
* [AngularChartJS] - Beautifull charts

### Installation

Install the dependencies.

```sh
$ npm install
$ bower install
```
### Runing tests
To run the tests you have to first install [Artillery].
```sh
$ npm install artillery -g
```
Then run a sample tests with a YAML file configuration.
```sh
$ cd tests
$ artillery test.yml
```
Check the results.
```sh
$ cd ..
$ node app.js
```
All the JSON test files MUST be located on the test folder in the root folder.

License
----
MIT

**Free Software, Hell Yeah!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [john gruber]: <http://daringfireball.net>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>
   [GulpLivereload]: <https://github.com/vohof/gulp-livereload>
   [Artillery]: <https://artillery.io/>
   [AngularChartJS]: <http://jtblin.github.io/angular-chart.js/>
