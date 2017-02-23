angular.module('app', ['chart.js'])
.controller('TestsController', ['$scope', '$http', function($scope, $http) {
  $scope.tests = {}
  $scope.stats = {};
  $scope.shownTests = []
  $scope.latency = {
    labels : [],
    data: [],
    series: [],
    firstload: true,
  }

  $scope.init = function(){
    console.log('init')
    $scope.getTests();
  }
  $scope.getTests = function(){
    console.log('getTests')
    $http.get('/tests').then(function(res){
      $scope.tests = res.data
    });
  }



  $scope.getStats = function(identifier){
    console.log('getStats')
    $scope.shownTests.push(identifier)
    $http.get('/tests/'+identifier).then(function(res){
      var agg = res.data.aggregate;
      var latency = agg.latency;
      var statstabledata = {
        //test: identifier,
        arrivalDate: agg.phases[0].arrivalRate,
        duration: agg.phases[0].duration,
        max: latency.max,
        min: latency.min,
        median: latency.median,
        p95: latency.p95,
        p99: latency.p99,
        createdAt: agg.timestamp 
      }
      $scope.stats[identifier] = statstabledata
      var object = res.data.aggregate.latency;
      $scope.latency.series.push(identifier);
      var data = []
      for(var index in object) {
        if(object.hasOwnProperty(index)){
          if($scope.latency.firstload){
           $scope.latency.labels.push(index)
         }
         data.push(object[index])
       }
     }
     console.log($scope.stats)
     $scope.latency.data.push(data)

     $scope.latency.firstload = false;
   });

    $scope.removeFile = function(identifier){
      $http.delete('/tests/'+identifier).then(function(res){
        console.log('removeFile ' + $scope.tests.indexOf(identifier))
        $scope.remove(identifier)
        $scope.tests.splice($scope.tests.indexOf(identifier),1)
      });
    }

    $scope.remove = function(identifier){
      var index = $scope.shownTests.indexOf(identifier);
      console.log('remove ' + index)
      if(index>=0){
        $scope.shownTests.splice($scope.shownTests.indexOf(identifier), 1)
        $scope.latency.data.splice(index, 1)
        console.log($scope.stats[identifier])
        delete($scope.stats[identifier])
      }
    }

  }
}]);

