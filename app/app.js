var app = angular.module("osicApp", ['ui.bootstrap']);
app.factory('timeFrames', function() {
  var service = {},
      weeks,
      months,
      quarters;


  return service;
});
/*
TODO:
 - Remove unused variables/methods (ediardo)
 - Use D3 to render a pie chart
 - A message showing a "Loading" or something for UX purposes
 */
app.factory('myFactory', function($http, $q) {
  var service = {},
      baseUrl = 'http://stackalytics.com/api/1.0',
      _finalUrls = {},
      _release,
      _metricsType,
      _startDate,
      _endDate,
      _metrics = [],
      _members,
      _memberStats,
      _utcOffset = -18000,
      _modules = [],
      _osicModules = [];

  service.setMembers = function(members) {
    _members = members;
  }

  /*
    Returns a query string suitable for a GET request
    { foo: 'value1', foo2: 'value2'} -> foo=value1&foo2=value2
  */
  var paramsToQuery = function (params) {
    var query = [];
    angular.forEach(params, function(value, name) {
      if(value !== null && value !== undefined && value !== ''){
        this.push(name + '=' + value);
      }
    }, query);
    return query.join('&');
  };

  /*
    Returns a string with URL pointing to Stackalytics API
  */
  var buildUrl = function(url, params) {
    return baseUrl + url + '?' + paramsToQuery(params) + '&project_type=all&callback=JSON_CALLBACK';
  };

  /*
    Filter only those users we care about
  */
  var filterData = function(data, byKey) {
    // Get all IDs from our list of users for fitltering
    memberIds = _members.map(function(member){ return member.launchpad_id;})
    return data.filter(function(obj, idx) {
      if (memberIds.includes(obj[byKey])) {
        return obj;
      }
    });
  };

  /*
    Prepare Data
  */
  var prepareData = function(data, fields) {
    return data.filter(function(obj, idx) {
      angular.forEach(fields, function(value, field) {
        this[field] = value;
      }, obj);
      return obj;
    });
  };

  service.calculateMetrics = function(metrics) {
    var calculatedMetrics = {};
    angular.forEach(metrics, function(metric, idx) {
      safeMetricCode = metric.metric_code.replace('-', '_');
      if (!(safeMetricCode in calculatedMetrics)) {
        calculatedMetrics[safeMetricCode] = {};
        calculatedMetrics[safeMetricCode]['total'] = 0;
        calculatedMetrics[safeMetricCode]['intel'] = 0;
        calculatedMetrics[safeMetricCode]['rackspace'] = 0;
        calculatedMetrics[safeMetricCode]['members'] = [];
      }
      calculatedMetrics[safeMetricCode]['members'].push(metric);
      calculatedMetrics[safeMetricCode]['total'] += metric.metric;
      if (metric.company == 'intel') {
        calculatedMetrics[safeMetricCode]['intel'] += metric.metric;
      } else if (metric.company == 'rackspace') {
        calculatedMetrics[safeMetricCode]['rackspace'] += metric.metric;
      }

    });

    return calculatedMetrics;
  }


  var setMetric = function(metricType,  metric) {
    _metrics[metricType] = metric;
  }

  /*
    Get Metric
  */
  service.getMetric = function(params) {
    var url = buildUrl('/stats/engineers', params);
    console.log(url);
    return $http.jsonp(url).then(function(response) {
      data = filterData(response.data.stats, 'id', params.metric);
      return prepareData(data, {metric_code: params.metric, company: params.company });
    });
  };

  service.osicModules = function(osicModules){
    _osicModules = osicModules;
  }


  return service;
});

app.controller('scoreCtrl', function($scope, $http, myFactory, $q) {
  var users = {},
      metrics = [];
  metrics = [
    {code: 'commits', name: 'Commits'},
    {code: 'bpc', name: 'Completed Blueprints'},
    {code: 'bpd', name: 'Drafted Blueprints'},
    {code: 'patches', name:'Patches'},
    {code: 'resolved-bugs', name: 'Resolved Bugs'},
    {code: 'filed-bugs', name: 'Filed Bugs'},
    {code: 'marks', name: 'Reviews'}
  ];

  $http.get('projects.json').then(function(response){
    $scope.osicModules = response.data.projects;
  });

  //
  $http({
    method: 'JSONP',
    url:'http://stackalytics.openstack.org/api/1.0/modules'
  }).then(function (response){
    $scope.modules = response.data.data
  })

  $http({
    method: 'JSONP',
    url:'http://stackalytics.com/api/1.0/releases?callback=JSON_CALLBACK'
  }).then(function (response){
    console.log(response)
    $scope.releases = response.data.data.splice(1, response.data.data.length)
  })

  $scope.dateOptions = {
    maxDate: new Date(),
    showWeeks: true
  };

  $scope.dateFormat = 'MM/dd/yyyy';

  $scope.openStartDate = function() {
    $scope.popupStartDate.opened = true;
  };

  $scope.openEndDate= function() {
    $scope.popupEndDate.opened = true;
  };

  $scope.popupStartDate = {
    opened: false
  };

  $scope.popupEndDate = {
    opened: false
  };

  // This function sets start/end time frames
  $scope.setTimeFrame = function(timeFrame) {
    var today = new Date(),
        year = today.getFullYear(),
        month = today.getMonth(),
        day = today.getDate()
        quarter = Math.floor((month + 3) / 3);

    switch(timeFrame) {
      case 'currentWeek':
        $scope.startDate = new Date(year, month, day - today.getDay());
        $scope.endDate = new Date(year, month, day);
        break;
      case 'previousWeek':
        $scope.startDate = new Date(year, month, day - today.getDay() - 7);
        $scope.endDate= new Date(year, month, day - today.getDay() -1);
        break;
      case 'currentMonth':
        $scope.startDate = new Date(year, month, 1);
        $scope.endDate = new Date(year, month + 1, 0);
        break;
      case 'previousMonth':
        $scope.startDate = new Date(year, month - 1, 1);
        $scope.endDate = new Date(year, month, 0);
        break;
      case 'currentQuarter':
        $scope.startDate = new Date(year, quarter * 3 - 3, 1);
        $scope.endDate = new Date(year, (quarter + 1) * 3 - 3, 0);
        break;
      case 'previousQuarter':
        $scope.startDate = new Date(year, (quarter - 1) * 3 - 3 , 1);
        $scope.endDate = new Date(year, quarter  * 3 - 3, 0);
        break;
    }
  };

  $scope.$watchCollection('[startDate, endDate]', function (newValues, oldValues) {
    if (newValues[0] != undefined || newValues[1] !== undefined) {
      console.log(newValues);
      $scope.getNumbers();
    }
  });

  $scope.hats = [
    {text: "Intel" , id:"intel"},
    {text: "Rax", id:"rackspace"}
  ]

  $scope.members = [];
  $scope.projectMembers = [];

  $http.get('members.json').then(function(response){
    $scope.members = response.data.members;
  });

  $scope.onModuleChange = function(){
    if($scope.selectedModule != null && $scope.selectedModule != undefined){
      $scope.projectMembers = $scope.members.filter(function(member){

        if(member.project.includes($scope.selectedModule.name)){
          return member;
        }

      });
    }
    else{
      $scope.projectMembers = [];
    }
    $scope.getNumbers();
  }

  $scope.onReleaseChange = function(){
    $scope.getNumbers();
  }

  $scope.onHatChange = function(){
    $scope.getNumbers();
  }

  $scope.onSelectedMember = function (caller) {
    console.log(caller.selectedMember);
    $scope.selectedMember = caller.selectedMember;
  }

  $scope.clearSelectedMember = function(){
    $scope.selectedMember = null;
    $('input[name="memberRadio"]').attr('checked', false);
  }

  $scope.getNumbers = function() {
    var promises = [];
    angular.element(document.querySelectorAll('.time-frames-group button')).addClass('disabled'); // Adds .disabled
    myFactory.setMembers($scope.members);

    angular.forEach(metrics, function(metric) {
      // get metrics for Rackspace
      if($scope.selectedHat == undefined || $scope.selectedHat.id == 'rackspace' ){
        promises.push(
          myFactory.getMetric({
            start_date: $scope.startDate.getTime() / 1000 - 1800,
            end_date: $scope.endDate.getTime() / 1000 - 1800,
            metric: metric.code,
            company: 'rackspace',
            release: $scope.selectedRelease ?  $scope.selectedRelease.id : 'all',
            module: $scope.selectedModule ? $scope.selectedModule.name : ''
          })
        );
      }
      // get metrics for Intel
      if($scope.selectedHat == undefined || $scope.selectedHat.id == 'intel' ){
        promises.push(
          myFactory.getMetric({
            start_date: $scope.startDate.getTime() / 1000 - 1800,
            end_date: $scope.endDate.getTime() / 1000 - 1800,
            metric: metric.code,
            company: 'intel',
            release: $scope.selectedRelease ?  $scope.selectedRelease.id : 'all',
            module: $scope.selectedModule ? $scope.selectedModule.name : ''
          })
        );
      }
    });
    // All promises have been resolved
    $q.all(promises).then(function (metrics) {
      angular.element(document.querySelectorAll('.time-frames-group button')).removeClass('disabled');
      $scope.metrics = myFactory.calculateMetrics([].concat.apply([], metrics));
      charts.sunburst("#chartContainer", $scope.metrics)
    })

  }
  $scope.model = {
      name: 'Tabs'
    };
});
