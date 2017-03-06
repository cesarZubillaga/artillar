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
        };
        $scope.form = {};
        $scope.init = function () {
            console.log('init');
            $scope.$emit('loading');
            $scope.create.active = false;
            $http.get('/api/runnabletests').then(function (res) {
                $scope.runnabletests = res.data;
                if ($scope.runnabletests.length) {
                    $scope.readTest(0)
                }
                $scope.$emit('endLoading');
            });
        };

        $scope.readTest = function (id) {
            console.log('editTest ' + id);
            $scope.test = $scope.runnabletests[id];
        };

        $scope.runTest = function (id) {
            $scope.$emit('loading');
            $http.put('/api/runnabletests/' + id, $scope.test).then(function (res) {
                $scope.$emit('endLoading');
            });
        };

        $scope.addScenario = function () {
            if ($scope.create.scenario) {
                $scope.create.scenarios.push($scope.create.scenario);
                $scope.create.scenario = '';
            }
        };

        $scope.removeScenario = function (key) {
            $scope.create.scenarios.splice(key, 1);
        };


        $scope.submit = function () {
            if ($scope.form.$valid) {
                $scope.$emit('loading');
                $http.post('/api/runnabletests', $scope.create).then(function (res) {
                    if (res.data.errors != undefined) {
                        //todo: print errors
                    } else {
                        $scope.init();
                    }
                    $scope.$emit('endLoading');
                    ;
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

        $scope.configuration = {
            css: {
                canvasClass: 3,
                wide: true,
                latency: {
                    bar: true,
                    radar: true
                },
                concurrency: true,
                table: true
            },
            tests: []
        };

        $scope.latency = {
            labels: [],
            data: [],
            series: [],
            firstload: true
        };

        $scope.init = function () {
            console.log('init');
            $scope.getTests();
            $scope.getConfiguration();
        };

        $scope.canvasClass = function () {
            var bootstrapClass = 0;
            bootstrapClass += $scope.configuration.css.latency.bar ? 1 : 0;
            bootstrapClass += $scope.configuration.css.latency.radar ? 1 : 0;
            bootstrapClass += $scope.configuration.css.concurrency ? 1 : 0;
            bootstrapClass = bootstrapClass == 0 ? 1 : bootstrapClass;
            return 'col-xs-' + (12 /bootstrapClass);
        }

        $scope.getTests = function () {
            console.log('getTests');
            $http.get('/api/tests').then(function (res) {
                $scope.tests = res.data;
                $scope.configuration.css.wide = true;
            }).then(function () {
                //for wkhtmltopdf: this parameter is used to trigger the pdf generation.
                window.status = 'ended'
            });
        };

        $scope.$watch('configuration', function () {
            $scope.putConfiguration();
        }, true);

        $scope.getConfiguration = function () {
            $http.get('/api/configuration/tests').then(function (res) {
                $scope.configuration = res.data;
                if ($scope.configuration.tests.length) {
                    $scope.configuration.tests.forEach(function (el) {
                        $scope.getStats(el, true);
                    })
                }
            });
        };

        $scope.putConfiguration = function () {
            $scope.$emit('loading');
            $http.put('/api/configuration/tests', $scope.configuration).then(function (res) {
                $scope.$emit('endLoading');
            });
        };

        $scope.removeConfiguration = function (identifier) {
            $scope.configuration.tests.splice(identifier, 1);
            $scope.putConfiguration();
        }

        $scope.getStats = function (identifier, firstLoad) {
            console.log('getStats ' + identifier + ' ' + firstLoad);
            $scope.$emit('loading');
            ;
            if (false == firstLoad || firstLoad == undefined) {
                $scope.configuration.tests.push(identifier);
                $scope.putConfiguration();
            }
            $scope.shownTests.push(identifier);
            $scope.shownConcurrencies.push(identifier);
            $http.get('/api/tests/' + identifier).then(function (res) {
                $scope.$emit('endLoading');
                ;
                var agg = res.data.aggregate;
                var intermediate = res.data.intermediate;
                $scope.buildAggregations(agg, identifier);
                $scope.buildConcurrency(intermediate, identifier);
            });
        }

        $scope.buildConcurrency = function (intermediate, identifier) {
            var labels = intermediate.map(function (el) {
                return el.timestamp;
            });
            var data = intermediate.map(function (el) {
                return el.concurrency;
            });
            if ($scope.concurrency.labels.length < labels.length) {
                var N = labels.length;
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
                delete($scope.concurrency[identifier])
            }
        };

        $scope.buildAggregations = function (agg, identifier) {
            var latency = agg.latency;
            //table purpouses
            var arrivalRate = agg.phases[0].arrivalRate;
            var duration = agg.phases[0].duration;
            var totalUsers = arrivalRate * duration;
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
            console.log('remove ' + index);
            var index = $scope.shownTests.indexOf(identifier);
            if (index >= 0) {
                $scope.shownTests.splice($scope.shownTests.indexOf(identifier), 1);
                $scope.latency.data.splice(index, 1);
                $scope.latency.series.splice(index, 1);
                console.log($scope.stats[identifier]);
                delete($scope.stats[identifier])
            }
        };

        $scope.removeFile = function (identifier) {
            $scope.$emit('loading');
            $http.delete('/api/tests/' + identifier).then(function (res) {
                console.log('removeFile ' + $scope.tests.indexOf(identifier));
                $scope.remove(identifier);
                $scope.tests.splice($scope.tests.indexOf(identifier), 1)
                $scope.$emit('endLoading');
            });
        };

        $scope.remove = function (identifier) {
            $scope.removeAggregation(identifier);
            $scope.removeConcurrency(identifier);
            $scope.removeConfiguration(identifier);
        }
    }])
    .controller('ParentController', ['$scope', function ($scope) {
        $scope.loading = false;
        $scope.$on('loading', function (ev) {
            $scope.loading = true;
        });
        $scope.$on('endLoading', function (ev) {
            $scope.loading = false;
        });
    }])
;