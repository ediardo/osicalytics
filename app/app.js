var app = angular.module("osicApp", []);
/*
TODO:
 - Get json for the Hats (companies) we really care about
 - Use D3 to render a pie chart
 - A message showing a "Loading" or something for UX purposes
 */
app.factory('myFactory', function($http, $q) {
  var service = {},
      baseUrl = 'http://stackalytics.openstack.org/api/1.0/stats/engineers?callback=JSON_CALLBACK&',
      _finalUrls = {},
      _release,
      _metricsType,
      _startDate,
      _endDate,
      _metrics = [],
      _members,
      _memberStats,
      _utcOffset = -18000;
      _modules = []
  
  var makeUrl = function(release, module, company) {
    angular.forEach(_metricsType, function(metric, idx) {
      _metricsType[idx].url = baseUrl +
                              'start_date=' +
                              _startDate + '&' +
                              'end_date=' + 
                              _endDate + '&' +
                              'metric=' + metric.code + '&'

      if(release != null){
        _metricsType[idx].url += 'release=' + release.id + "&"; 
      }
      if(module != null){
        _metricsType[idx].url += 'module=' + module.id + "&";                     
      }
      if(company != null){
         _metricsType[idx].url += 'company=' + company.id + "&";
      }
    });
  }
  
  service.setMetricsType = function(metrics) {
    _metricsType = metrics;
  }
  
  service.setHats = function(hats) {
    _hats = hats;
  }
  
  service.setStartDate = function(startDate) {
    _startDate = startDate.getTime() / 1000 - _utcOffset; 
  }
  
  service.setEndDate = function(endDate) {
    _endDate = endDate.getTime() / 1000 - _utcOffset; 
  }
  
  service.setMembers = function(members) {
    _members = members;
  }

  service.setModules = function(modules){
    _modules = modules;
  }
  
  service.getModules = function(modules){
    return _modules;
  }

  service.getNumbers = function(release, module, company) {
    var promises = [];
    makeUrl(release, module, company);
    angular.forEach(_metricsType, function(metric, idx) {
      var deferred = $q.defer();
      $http.jsonp(metric.url)
        .success(function(data) {
          deferred.resolve(data);
        }).error(function(data, status) {
          deferred.reject(status)
      });
      deferred.promise.code = metric.code;
      promises.push(deferred.promise);
    });
    
    $.when(promises).then(calculateMetrics);
    /*
    .success(function(data) {
        mem = findMembers(_members, data.stats)
 
      }).error(function() {
        // TODO: on error
      });
      */
  }

  var calculateMetrics = function(promises) {
    angular.forEach(promises, function(promise, idx) {
      var metricType = promise.code;
      promise.then(function(data){
        members = findMembers(data.stats);
        setMetric(metricType, calculateMetric(members, 'metric'));
      })
    })
  }
  var setMetric = function(metricType,  metric) {
    _metrics[metricType] = metric; 
  }
  
  service.getMetric = function(metricType) {
    return _metrics[metricType];
  }
  
  var calculateMetric = function(stats, prop) {
    return stats.reduce(function(a, b) {
      return a + b[prop];
    }, 0);
  }
  
  var findMembers = function(allMembers) {
    
    return allMembers.filter(function(member, idx) {
      if (member.id in _members) 
        return member.metric;
    });
  }
  
  return service;
});

app.controller('scoreCtrl', function($scope, $http, myFactory) {
  var users = {}, 
      metrics = [];
  metrics = [
    {code: 'commits', name: 'Commits'},
    {code: 'bpc', name: 'Completed Blueprints'},
    {code: 'bpd', name: 'Drafted Blueprints'},
    {code: 'patches', name:'Patches'},
    {code: 'resolved-bugs', name: 'Resolved Bugs'},
    {code: 'marks', name: 'Reviews'}
  ];

  //$scope.selectedModule = null;
  
  $http({
    method: 'GET',
    url:'http://stackalytics.openstack.org/api/1.0/modules'
  }).then(function (response){
    $scope.modules = response.data.data
  })
  
  $http({
    method: 'GET',
    url:'http://stackalytics.openstack.org/api/1.0/releases'
  }).then(function (response){
    $scope.releases = response.data.data.splice(1, response.data.data.length)
  })
  
  $scope.hats = [
    {text: "Intel" , id:"intel"}, 
    {text: "Rax", id:"rackspace"}
  ]

  users = {
    'ediardo': {
      hat: 'Intel',
      dedicated: true,
      project: 'horizon'
    }, 
    'jlopezgu': {
      hat: 'Intel',
      dedicated: true,
      project: 'horizon'
    }, 
    'luis-daniel-castellanos': {
      hat: 'Intel',
      dedicated: true,
      project: 'horizon'
    },
    'electrocucaracha': {
      hat: 'Intel',
      dedicated: true,
      project: 'neutron'
    },
    'ankur-gupta-f': {
      hat: 'Intel',
      dedicated: true,
      project: 'neutron'
    },
    'saisrikiran-mudigonda': {
      hat: 'Intel',
      dedicated: true,
      project: 'neutron'
    },
    'smigiel-dariusz': {
      hat: 'Intel',
      dedicated: true,
      project: 'neutron'
    },
    'yalei-wang': {
      hat: 'Intel',
      project: 'neutron'
    },
    'yamahata': {
      hat: 'Intel',
      project: 'neutron' 
    }, 
    'lubosz-kosnik': {
      hat: 'Intel',
      dedicated: true,
      project: 'neutron'
    },
    'npustchi': {
      hat: 'Intel',
      dedicated: true,
      project: 'keystone'
    },
    'ronald-de-rose': {
      hat: 'Intel',
      dedicated: true,
      project: 'keystone'
    },
    'npustchi': {
      hat: 'Intel',
      dedicated: true,
      project: 'keystone'
    },
    'ronald-de-rose': {
      hat: 'Intel',
      dedicated: true,
      project: 'keystone'
    },
    'wei-d-chen': {
      hat: 'Intel',
      project: 'keystone'
    },
    'dolph': {
      hat: 'Rax',
      project: 'keystone'
    },
    'xek': {
      hat: 'Intel',
      project: 'keystone'
    },
    'theizaakk': {
      hat: 'Intel',
      dedicated: true,
      project: 'osa'
    },
    'raddaoui-ala': {
      hat: 'Intel',
      dedicated: true,
      project: 'osa'
    },
    'kprabhuv': {
      hat: 'Intel',
      dedicated: true,
      project: 'cinder'
    },
    'bluex': {
      hat: 'Intel',
      dedicated: true,
      project: 'cinder'
    },
    'pushkar-umaranikar': {
      hat: 'Intel',
      dedicated: true,
      project: 'nova'
    }, 
    'xuhj': {
      hat: 'Intel',
      dedicated: true,
      project: 'nova'
    },
    'sfinucane': {
      hat: 'Intel',
      project: 'nova'
    }
  };

  
  $scope.getNumbers = function() {
    
    myFactory.setMetricsType(metrics);
    myFactory.setMembers(users);
    myFactory.setHats($scope.hats)
    myFactory.setStartDate($scope.startDate);
    myFactory.setEndDate($scope.endDate);
    myFactory.getNumbers($scope.selectedRelease, $scope.selectedModule, $scope.seletedHat);
    
    setTimeout(function() {
      $scope.$apply(function() {
        $scope.commits = myFactory.getMetric('commits');  
        $scope.bpd = myFactory.getMetric('bpd');  
        $scope.bpc = myFactory.getMetric('bpc');
        $scope.marks = myFactory.getMetric('marks');
        $scope.resolved_bugs = myFactory.getMetric('resolved-bugs');
        $scope.filed_bugs = myFactory.getMetric('filed-bugs');
        $scope.patches= myFactory.getMetric('patches');
      })
      
    }, 2700);
   
  }
  
});
