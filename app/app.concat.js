(function() {
  'use strict';

  angular
    .module('osicApp', ['ui.bootstrap', 'ngTable', 'angularMoment', 'ngRoute'])
    .constant('config', {
      appName: 'OSICAlytics',
      appVersion: '0.9.1',
      apiTunnelUrl: '/api_tunnel.php?q=',
      apiStackalyticsUrl: 'http://stackalytics.com/api/1.0'
    })
    .config(function($sceDelegateProvider) {
      $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'http://stackalytics.com/**'
      ]);
    });


})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .controller('DetailsCtrl', detailsController);

  function detailsController($scope, $rootScope, NgTableParams, config, myFactory) {
    // TODO: Put logic of details of metrics here...
  }
})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .controller('FiltersCtrl', filtersCtrl);

  function filtersCtrl($scope, $rootScope, NgTableParams, config, myFactory, magicDates, $location) {
    console.log('filters');
    // Triggered when user clicks on a pre-defined timeframe
    $scope.setTimeFrame = function(timeFrame) {
      var startEndDates = magicDates.getTimeframe(timeFrame);
      $rootScope.startDate = startEndDates[0];
      $rootScope.endDate = startEndDates[1];
      // Dispatch the event upwards!
      $scope.$emit('changedTimeframe', true);
    }

    // Trigerred when user selects a dropdown filter
    $scope.onFilterChange = function() {
      console.log('filerChanged');
      $rootScope.filteredMembers = $rootScope.members;
      console.log($rootScope.members);

      // Group filters
      if ($scope.selectedGroup != null && $scope.selectedGroup != undefined) {
        $location.search('group', $scope.selectedGroup.name);
        console.log('asdada');
        $rootScope.filteredMembers = $rootScope.filteredMembers.filter(function(member) {
          if (member.group.includes($scope.selectedGroup.name)) {
            return member;
          }
        });
      } else {
        $location.search('group', '');
      }
      // Team filters
      if ($scope.selectedModule != null && $scope.selectedModule != undefined) {
        $location.search('team', $scope.selectedModule.name);
        $rootScope.filteredMembers = $rootScope.filteredMembers.filter(function(member) {
          if (member.project.includes($scope.selectedModule.name)){
            return member;
          }
        });
      } else {
        $location.search('team', '');
      }

      // Company filter
      if ($scope.selectedHat != null && $scope.selectedHat != undefined) {
        $location.search('company', $scope.selectedHat.id);
        $rootScope.filteredMembers = $rootScope.filteredMembers.filter(function(member){
          if (member.hat.includes($scope.selectedHat.id)) {
            return member;
          }
        });
      } else {
        $location.search('company', '');
      }

      // Allocations filter
      if ($scope.selectedAllocation != null && $scope.selectedAllocation != undefined) {
        $location.search('allocation', $scope.selectedAllocation.name);
        $rootScope.filteredMembers = $rootScope.filteredMembers.filter(function(member){
          if (member.dedicated == $scope.selectedAllocation.dedicated) {
            return member;
          }
        });
      } else {
        $location.search('allocation', '');
      }

      if ($scope.filteredMembers.length > 0) {
        myFactory.setMembers($rootScope.filteredMembers);
      }
      // Dispatch the event upwards!
      $scope.$emit('changedFilters', true);
    }

    $scope.$watchCollection('[startDate, endDate]', function (newValues, oldValues) {
      if ((newValues[0] !== undefined || newValues[1] !== undefined) && !(isNaN(newValues[0]) || isNaN(newValues[1]))) {
          $location.search('start_date', $scope.startDate.getTime() / 1000);
          $location.search('end_date', $scope.endDate.getTime() / 1000);
          $scope.filters = true;
      } else {
        $scope.filters = false;
      }
    });
  }
})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .controller('LiveCtrl', liveCtrl);

  function liveCtrl($scope, $rootScope, NgTableParams, config, myFactory, liveFeed, $q) {
    // TODO: Put logic of details of metrics here...
    console.log('live');
    console.log(liveFeed);
    /*
    $q.all(liveFeed).then(function (metrics) {
      var liveFeedObjs = [];
      $scope.loading = false;
      angular.forEach(metrics, function (metric, key) {
        liveFeedObjs.push(metric.activity);
      });
      $scope.liveFeed = liveFeedObjs.reduce(function(a, b) {
        return a.concat(b);
      });
    });
    */
    console.log('Live :' +$scope.liveFeed);
  }
})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .controller('RootCtrl', rootCtrl);

  function rootCtrl($scope, $rootScope, NgTableParams, config, myFactory, init) {
    // TODO: Put logic of details of metrics here...
    $q.all(init).then(function(data) {
      $rootScope.osicGroups = data[0].data.groups;
      $rootScope.osicModules = data[1].data.projects;
      $rootScope.members = data[2].data.members;
      $rootScope.filteredMembers = $rootScope.members;
      $rootScope.releases = data[3].data.data.splice(1, data[3].data.data.length);
    });
    console.log('adsfasfdfasd: ' + $rootScope);
  }
})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .controller('RosterCtrl', rosterController);

  function rosterController($scope, $rootScope, NgTableParams, config, myFactory) {
    // TODO: Put logic of details of metrics here...
  }
})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .controller('scoreCtrl', scoreCtrl);

  function scoreCtrl($scope, $http, myFactory, $q, $location, NgTableParams, moment, $interval, config) {
      var users = {},
          metrics = [
            {code: 'commits', name: 'Commits'},
            {code: 'bpc', name: 'Completed Blueprints'},
            {code: 'bpd', name: 'Drafted Blueprints'},
            {code: 'patches', name:'Patches'},
            {code: 'resolved-bugs', name: 'Resolved Bugs'},
            {code: 'filed-bugs', name: 'Filed Bugs'},
            {code: 'marks', name: 'Reviews'},
            {code: 'loc', name: 'LOCs'},
            {code: 'emails', name: 'Emails'}
          ],
          hats = [
            {text: "Intel", id: "Intel"},
            {text: "Rax", id: "Rackspace"}
          ],
          allocations = [
            {name: 'Full-time', dedicated: true},
            {name: 'Part-time', dedicated: false}
          ];

      if (location.hostname == 'localhost' || location.hostname == '127.0.0.1') {
        myFactory.setAPIUrl(config.apiStackalyticsUrl);
        myFactory.setIsTunnelingEnabled(false);
      } else {
        myFactory.setAPIUrl(config.apiTunnelUrl);
        myFactory.setIsTunnelingEnabled(true);
      }

      $scope.tabs = [
        {title: 'LIVE', templateUrl: '/static/partials/live.html', select: 'getLiveFeed()' }
      ];

      $scope.init = function (){
        $scope.allocations = allocations;
        $scope.hats = hats;
        $scope.popupStartDate = {opened: false};
        $scope.popupEndDate = {opened: false};
        $scope.dateOptions = {maxDate: new Date(), showWeeks: true};
        $scope.dateFormat = 'MM/dd/yyyy';
        // All members in members.json
        $scope.members = [];
        // This variable holds filtered members by the user
        $scope.filteredMembers = [];

        // Sets a valid API Url if app used in dev mode (localhost) or prod.

        console.log(myFactory.getAPIUrl());
      }

      var groupsD = $http.get('/groups.json').then(function(response) {
        $scope.osicGroups = response.data.groups;
      });

      var projectsD = $http.get('/projects.json').then(function(response) {
        $scope.osicModules = response.data.projects;
      });

      var membersD = $http.get('/members.json').then(function(response) {
        $scope.members = response.data.members;
      });

      var releasesD = myFactory.getReleases().then(function(response) {
        $scope.releases = response.data.data.splice(1, response.data.data.length);
      });

      $q.all([groupsD, projectsD, membersD, releasesD]).then(function() {
        var processFilters = false,
            startDate = new Date($location.search().start_date * 1000),
            endDate = new Date($location.search().end_date * 1000);

        if (isNaN(startDate) && isNaN(endDate)) {
          $scope.setTimeFrame('currentWeek');
        } else {
          $scope.startDate = startDate;
          $scope.endDate = endDate;
        }
        $scope.selectedGroup = $scope.osicGroups.find(function(group) {
          if (group.name == $location.search().group) {
            processFilters = true;
            return group;
          }
        });
        $scope.selectedModule = $scope.osicModules.find(function(module) {
          if (module.name == $location.search().team) {
            processFilters = true;
            return module;
          }
        });
        $scope.selectedHat = $scope.hats.find(function(hat) {
          if (hat.id == $location.search().company) {
            processFilters = true;
            return hat;
          }
        });
        $scope.selectedAllocation = $scope.allocations.find(function(alloc) {
          if (alloc.name == $location.search().allocation) {
            processFilters = true;
            return alloc;
          }
        });

        // If we need to process filter options then...
        if (processFilters) {
          $scope.onFilterChange();
        }
      })

      $scope.openStartDate = function() {
        $scope.popupStartDate.opened = true;
      };

      $scope.openEndDate = function() {
        $scope.popupEndDate.opened = true;
      };

      // This function sets start/end time frames
      $scope.setTimeFrame = function(timeFrame) {
        var today = new Date(),
            year = today.getFullYear(),
            month = today.getMonth(),
            day = today.getDate(),
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
        if ((newValues[0] !== undefined || newValues[1] !== undefined) && !(isNaN(newValues[0]) || isNaN(newValues[1]))) {
            $location.search('start_date', $scope.startDate.getTime() / 1000);
            $location.search('end_date', $scope.endDate.getTime() / 1000);
            $scope.active = 0;
            $scope.getNumbers();
            $scope.filters = true;
        } else {
          $scope.filters = false;
        }
      });

      // TODO(ediardo): REFACTOR THIS ZONE BELOW!!!!
      $scope.onReleaseChange = function(){
        $scope.getNumbers();
      };

      $scope.onFilterChange = function() {
        $scope.filteredMembers = $scope.members;
        // Group filters
        if ($scope.selectedGroup != null && $scope.selectedGroup != undefined) {
          $location.search('group', $scope.selectedGroup.name)
          $scope.filteredMembers = $scope.filteredMembers.filter(function(member) {
            if (member.group.includes($scope.selectedGroup.name)) {
              return member;
            }
          });
        } else {
          $location.search('group', '');
        }
        // Team filters
        if ($scope.selectedModule != null && $scope.selectedModule != undefined) {
          $location.search('team', $scope.selectedModule.name);
          $scope.filteredMembers = $scope.filteredMembers.filter(function(member) {
            if (member.project.includes($scope.selectedModule.name)){
              return member;
            }
          });
        } else {
          $location.search('team', '');
        }

        // Company filter
        if ($scope.selectedHat != null && $scope.selectedHat != undefined) {
          $location.search('company', $scope.selectedHat.id);
          $scope.filteredMembers = $scope.filteredMembers.filter(function(member){
            if (member.hat.includes($scope.selectedHat.id)) {
              return member;
            }
          });
        } else {
          $location.search('company', '');
        }

        // Allocations filter
        if ($scope.selectedAllocation != null && $scope.selectedAllocation != undefined) {
          $location.search('allocation', $scope.selectedAllocation.name);
          $scope.filteredMembers = $scope.filteredMembers.filter(function(member){
            if (member.dedicated == $scope.selectedAllocation.dedicated) {
              return member;
            }
          });
        } else {
          $location.search('allocation', '');
        }
        $scope.active = 0;
        $scope.getNumbers();
      }

      $scope.onSelectedMember = function (caller) {
        $scope.selectedMember = caller.selectedMember;
      }

      $scope.clearSelectedMember = function(){
        $scope.selectedMember = null;
        $('input[name="memberRadio"]').attr('checked', false);
      }

      $scope.getNumbers = function() {
        $q.all([membersD]).then(function() {
          var promises = [];
          $scope.loading = true;
          if ($scope.filteredMembers.length == 0) {
            console.log('All members');
            myFactory.setMembers($scope.members);
          } else {
            console.log('Some members');
            myFactory.setMembers($scope.filteredMembers);
          }

          angular.forEach(metrics, function(metric) {
            // get metrics for Rackspace
            if($scope.selectedHat == undefined || $scope.selectedHat.id == 'Rackspace' ){
              promises.push(
                myFactory.getMetric({
                  start_date: $scope.startDate.getTime() / 1000,
                  end_date: $scope.endDate.getTime() / 1000,
                  metric: metric.code,
                  company: 'rackspace',
                  release: $scope.selectedRelease ?  $scope.selectedRelease.id : 'all'
                })
              );
            }
            // get metrics for Intel
            if($scope.selectedHat == undefined || $scope.selectedHat.id == 'Intel' ){
              promises.push(
                myFactory.getMetric({
                  start_date: $scope.startDate.getTime() / 1000,
                  end_date: $scope.endDate.getTime() / 1000,
                  metric: metric.code,
                  company: 'intel',
                  release: $scope.selectedRelease ?  $scope.selectedRelease.id : 'all'
                })
              );
            }
          });
          // All promises have been resolved
          $q.all(promises).then(function (metrics) {

            $scope.metrics = myFactory.calculateMetrics([].concat.apply([], metrics));
            console.log($scope.metrics);
            //angular.element(document.querySelectorAll('#overlay')).removeClass('-show-overlay');
            $scope.loading = false;
            charts.sunburst("#chartContainer", $scope.metrics)
          });
        });
      };

      $scope.getDetails = function(metric) {
        var promises = [],
            ngTableInitials = {
              count: 0
            };
        $scope.loading = true;
        myFactory.getDetails({
          start_date: $scope.startDate.getTime() / 1000,
          end_date: $scope.endDate.getTime() / 1000,
          metric: metric,
          release: $scope.selectedRelease ?  $scope.selectedRelease.id : 'all',
          page_size: 0
        }).then(function (details) {
          if (metric == 'commits') {
            $scope.commits = new NgTableParams({}, { dataset: details.activity });
          } else if (metric == 'bpc') {
            $scope.bpc = new NgTableParams({}, { dataset: details.activity });
          } else if (metric == 'bpd') {
            $scope.bpd = new NgTableParams({}, { dataset: details.activity });
          } else if (metric == 'resolved-bugs') {
            $scope.resolvedBugs = new NgTableParams({}, { dataset: details.activity });
          } else if (metric == 'filed-bugs') {
            $scope.filedBugs = new NgTableParams({}, { dataset: details.activity });
          } else if (metric == 'marks') {
            $scope.marks = new NgTableParams({}, { dataset: details.activity });
          }
          $scope.loading = false;
        });

      };

      $scope.getLiveFeed = function() {
        var promises = [],
            details = [],
            liveMetrics = ['commits', 'bpc', 'bpd', 'resolved-bugs', 'filed-bugs', 'marks', 'patches'];

          $scope.loading = true;
          angular.forEach(liveMetrics, function(metric) {
            promises.push(
              myFactory.getDetails({
                start_date: $scope.startDate.getTime() / 1000,
                end_date: $scope.endDate.getTime() / 1000,
                metric: metric,
                release: $scope.selectedRelease ?  $scope.selectedRelease.id : 'all',
                page_size: 10
              })
            );
          });

          $q.all(promises).then(function (metrics) {
            var liveFeedObjs = [];
            $scope.loading = false;
            angular.forEach(metrics, function (metric, key) {
              liveFeedObjs.push(metric.activity);
            });

            liveFeedObjs = liveFeedObjs.reduce(function(a, b) {
              return a.concat(b);
            })
            $scope.liveFeed = liveFeedObjs;
          });
      };

    };
})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .controller('SummaryCtrl', summaryController);

  function summaryController($scope, $rootScope, NgTableParams, config, myFactory) {
    // TODO: Put logic of details of metrics here...

  }
})();


(function() {
  'use strict';

  /*
  TODO:
   - Remove unused variables/methods (ediardo)
   - Use D3 to render a pie chart
   - A message showing a "Loading" or something for UX purposes
   */

  angular
    .module('osicApp')
    .factory('myFactory', function($http, $q) {
      var service = {},
          _baseUrl,
          _isTunnelingEnabled,
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
          _osicModules = [],
          _osicGroups = [];

      service.setAPIUrl = function(url) {
        _baseUrl = url;
      }

      service.getAPIUrl = function() {
        return _baseUrl;
      }

      service.setIsTunnelingEnabled = function(status) {
        _isTunnelingEnabled = status;
      }

      service.getIsTunnelingEnabled = function() {
        return _isTunnelingEnabled;
      }

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
        if (_isTunnelingEnabled) {
          return _baseUrl + url + encodeURIComponent('?' + paramsToQuery(params) + '&project_type=all');
        } else {
          return _baseUrl + url + '?' + paramsToQuery(params) + '&project_type=all';
        }
      };

      /*
        Filter only those users we care about
      */
      var filterData = function(data, byKey) {
        // Get all IDs from our list of users for fitltering
        var memberIds = _members.map(function(member){ return member.launchpad_id;})
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
          var safeMetricCode = metric.metric_code.replace('-', '_');
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
        return $http({
          method: _isTunnelingEnabled ? 'GET' : 'JSONP',
          url: url
        }).then(function(response) {
          var data = filterData(response.data.stats, 'id', params.metric);
          return prepareData(data, {metric_code: params.metric, company: params.company });
        });
      };

      /*
        Get Details
      */
      service.getDetails = function(params) {
        var url;
        console.log(url);
        params.user_id = _members.filter(function(member) {
          // Discard managers and other people not contributing Upstream
          if (member.valid_id && !(member.project.includes('Mgmt') || member.group.includes('OSIC'))) {
            return true;
          }
          return false;
        }).map(function(member) { return member.launchpad_id; }).join(',');
        url = buildUrl('/activity', params);
        console.log(url);
        return $http({
          method: _isTunnelingEnabled ? 'GET' : 'JSONP',
          url: url
        }).then(function(response) {
          return response.data;
        });
      }
      service.getOsicProjects = function(params) {
        var url = '/projects.json';
        return $http({
          method: 'GET',
          url: url
        }).then(function(response) {
          return response.data.projects;
        })
      };

      service.getOsicGroups = function (params) {
        var url = '/groups.json';
        return $http({
          method: 'GET',
          url: url
        }).then(function (response) {
          return response.data.groups;
        })
      };

      service.osicModules = function(osicModules){
        _osicModules = osicModules;
      }

      /*
       *  Gets a list of OpenStack modules
       */
      service.getModules = function() {
        var url = buildUrl('/modules', {});
        return $http({
          url: url,
          method: _isTunnelingEnabled ? 'GET' : 'JSONP'
        }).then(function(response) {
          return response.data.data;
        });
      }

      /*
       *  Gets a list of OpenStack releases
       */
      service.getReleases = function() {
        var url = buildUrl('/releases', {});
        return $http({
          url: url,
          method: _isTunnelingEnabled ? 'GET' : 'JSONP'
        });
      }

      // Come down to earth!
      return service;
    });

})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .factory('magicDates', function() {

      var service = {},
          _startDate,
          _endDate,
          _today = new Date(),
          _year = _today.getFullYear(),
          _month = _today.getMonth(),
          _day = _today.getDate(),
          _quarter = Math.floor((_month + 3) / 3);

      service.getTimeframe = function(timeFrame) {
        /*
         * TODO: Add other timeframes like currentRelease and currentYear
         */
        switch(timeFrame) {
          case 'currentWeek':
            _startDate = new Date(_year, _month, _day - _today.getDay());
            _endDate = new Date(_year, _month, _day);
            break;
          case 'previousWeek':
            _startDate = new Date(_year, _month, _day - _today.getDay() - 7);
            _endDate= new Date(_year, _month, _day - _today.getDay() -1);
            break;
          case 'currentMonth':
            _startDate = new Date(_year, _month, 1);
            _endDate = new Date(_year, _month + 1, 0);
            break;
          case 'previousMonth':
            _startDate = new Date(_year, _month - 1, 1);
            _endDate = new Date(_year, _month, 0);
            break;
          case 'currentQuarter':
            _startDate = new Date(_year, _quarter * 3 - 3, 1);
            _endDate = new Date(_year, (_quarter + 1) * 3 - 3, 0);
            break;
          case 'previousQuarter':
            _startDate = new Date(_year, (_quarter - 1) * 3 - 3 , 1);
            _endDate = new Date(_year, _quarter  * 3 - 3, 0);
            break;
        }
        return [_startDate, _endDate];
      }

      return service;
    });
})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .directive('filters', function () {
      return {
        link: function(scope, element, attrs) {
          scope.$watch('filters', function (val) {
            if (val) {
              element.removeAttr('disabled');
            } else {
              element.attr('disabled', 'true');
            }
          });
        }
      }
    });

})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .directive('importance', function() {
      return {
        retrict: 'A',
        scope: {
            importance: '='
        },
        replace: 'true',
        template: '<span class="label label-{{ color }} importance">{{ importance | uppercase }}</span>',
        link: function(scope, element, attrs) {
          if (['high', 'critical', 'essential'].indexOf(scope.importance.toLowerCase()) > -1 ) {
            scope.color = 'danger';
          } else if (scope.importance.toLowerCase() == 'medium') {
            scope.color = 'warning';
          } else if (scope.importance.toLowerCase() == 'low'){
            scope.color = 'info';
          } else {
            scope.color = 'default';
          }

        }
      }
    });

})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .directive('loading', function() {
      return {
        link: function(scope, element, attrs) {
          scope.$watch('loading', function (val) {
            if (val) {
              element.addClass('-show-overlay');
            } else {
              element.removeClass('-show-overlay');
            }
          });
        }
      }
    });

})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .directive('markValue', function() {
      return {
        retrict: 'A',
        scope: {
            markValue: '='
        },
        replace: 'true',
        template: '<span class="label label-{{ color }} review-value">{{ markValue }}</span>',
        link: function(scope, element, attrs) {
          if (scope.markValue > 0) {
            scope.color = 'success';
            scope.markValue = '+' + scope.markValue.toString();
          } else {
            scope.color = 'danger';
          }
        }
      }
    });

})();


(function() {
  'use strict';

  angular
    .module('osicApp')
    .directive('objTitle', function() {
      return {
        retrict: 'A',
        scope: {
            objTitle: '=',
            objUrl: '=',
            objType: '='
        },
        replace: 'true',
        template: '<span class="label label-info object-title "><a href="{{ objUrl }}" target="_blank" title="Open link in a new tab">{{ objTitle }}</a></span>',
        link: function(scope, element, attrs) {
          if (scope.objTitle.length > 70) {
            scope.objTitle = scope.objTitle.substring(0, 69) + '...';
          }
          if (scope.objType == 'commit') {
            scope.objUrl = "https://review.openstack.org/#q," + scope.objUrl;
          }
        }
      }
    });

})();
