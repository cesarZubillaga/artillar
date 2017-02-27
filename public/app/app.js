angular.module('app', ['chart.js'])
    .controller('RunnableTestsController', ['$scope', '$http', function ($scope, $http) {
        $scope.runnabletests = [];
        $scope.test = [];
        $scope.create = {
            active: null,
            name: null,
            duration: null,
            arrivalRate: null,
            target: null,
            scenarios: []
        }
        $scope.form = {};
        $scope.init = function () {
            console.log('init');
            $scope.create.active = false;
            $http.get('/api/runnabletests').then(function (res) {
                $scope.runnabletests = res.data;
            console.log($scope.runnabletests[0].scenarios)
                $scope.readTest(0)
            });
        }

        $scope.readTest = function (id) {
            console.log('editTest ' + id)
            $scope.test = $scope.runnabletests[id];
            console.log($scope.test)
        }

        $scope.runTest = function (id) {
            $http.put('/api/runnabletests/' + id, $scope.test).then(function (res) {
                console.log(res);
            });
        }

        $scope.addScenario = function () {
            if ($scope.create.scenario) {
                $scope.create.scenarios.push($scope.create.scenario);
                $scope.create.scenario = '';
            }
        }

        $scope.removeScenario = function (key) {
            $scope.create.scenarios.splice(key, 1);
        }


        $scope.submit = function () {
            if($scope.form.$valid){
                $http.post('/api/runnabletests', $scope.create).then(function(res){
                    $scope.init();
                });
            }
        }
    }])
    .controller('TestsController', ['$scope', '$http', function ($scope, $http) {
        $scope.tests = {};
        $scope.stats = {};
        $scope.shownTests = [];
        $scope.shownConcurrencies = [];
        $scope.concurrency = {
            labels: [],
            data: [],
            series: []
        };

        $scope.css = {
            wide: true,
            latency: {
                bar: true,
                radar: true
            },
            concurrency: true,
            table: true
        }

        $scope.latency = {
            labels: [],
            data: [],
            series: [],
            firstload: true
        };

        $scope.init = function () {
            console.log('init');
            $scope.getTests();
            $scope.getCssConfiguration();
        };

        $scope.getTests = function () {
            console.log('getTests');
            $http.get('/api/tests').then(function (res) {
                $scope.tests = res.data;
                $scope.css.wide = true;
            }).then(function () {
                //for wkhtmltopdf: this parameter is used to trigger the pdf generation.
                window.status = 'ended'
            });
        };

        $scope.getCssConfiguration = function () {
            $http.get('/api/cssconfiguration/tests').then(function (res) {
                $scope.css = res.data;
            });
        }

        $scope.putCssConfiguration = function () {
            $http.put('/api/cssconfiguration/tests', $scope.css);
        }

        $scope.getStats = function (identifier) {
            console.log('getStats');
            $scope.shownTests.push(identifier);
            $scope.shownConcurrencies.push(identifier);
            $http.get('/api/tests/' + identifier).then(function (res) {
                var agg = res.data.aggregate;
                var intermediate = res.data.intermediate;
                $scope.buildAggregations(agg, identifier);
                $scope.buildConcurrency(intermediate, identifier);
            });

            $scope.buildConcurrency = function (intermediate, identifier) {
                console.log(intermediate, identifier);
                var labels = intermediate.map(function (el) {
                    return el.timestamp;
                });
                var data = intermediate.map(function (el) {
                    return el.concurrency;
                });
                if ($scope.concurrency.labels.length < labels.length) {
                    var N = labels.length;
                    console.log(labels, labels.length);
                    labels = Array.apply(null, {length: N}).map(Number.call, Number);
                    $scope.concurrency.labels = labels;
                }
                $scope.concurrency.series.push(identifier);
                $scope.concurrency.data.push(data);
            };
            $scope.removeConcurrency = function (identifier) {
                var index = $scope.shownConcurrencies.indexOf(identifier);
                console.log('removeConcurrency ' + index);
                if (index >= 0) {
                    $scope.shownConcurrencies.splice($scope.shownConcurrencies.indexOf(identifier), 1);
                    $scope.concurrency.data.splice(index, 1);
                    console.log($scope.concurrency[identifier]);
                    delete($scope.concurrency[identifier])
                }
            };

            $scope.buildAggregations = function (agg, identifier) {
                var latency = agg.latency;
                //table purpouses
                var arrivalRate = agg.phases[0].arrivalRate;
                var duration = agg.phases[0].duration;
                var totalUsers = arrivalRate * duration;
                console.log(arrivalRate, duration, totalUsers);
                $scope.stats[identifier] = {
                    arrivalRate: arrivalRate,
                    duration: duration,
                    totalUsers: totalUsers,
                    max: latency.max,
                    min: latency.min,
                    median: latency.median,
                    p95: latency.p95,
                    p99: latency.p99,
                    codes: agg.codes,
                    createdAt: agg.timestamp
                };
                $scope.latency.series.push(identifier);
                var data = [];
                for (var index in latency) {
                    if (latency.hasOwnProperty(index)) {
                        if ($scope.latency.firstload) {
                            $scope.latency.labels.push(index)
                        }
                        data.push(latency[index])
                    }
                }
                $scope.latency.data.push(data);

                $scope.latency.firstload = false;
            };

            $scope.removeAggregation = function (identifier) {
                var index = $scope.shownTests.indexOf(identifier);
                console.log('remove ' + index);
                if (index >= 0) {
                    $scope.shownTests.splice($scope.shownTests.indexOf(identifier), 1);
                    $scope.latency.data.splice(index, 1);
                    console.log($scope.stats[identifier]);
                    delete($scope.stats[identifier])
                }
            };

            $scope.removeFile = function (identifier) {
                $http.delete('/api/tests/' + identifier).then(function (res) {
                    console.log('removeFile ' + $scope.tests.indexOf(identifier));
                    $scope.remove(identifier);
                    $scope.tests.splice($scope.tests.indexOf(identifier), 1)
                });
            };

            $scope.remove = function (identifier) {
                $scope.removeAggregation(identifier);
                $scope.removeConcurrency(identifier);
            }

        }
    }]);

