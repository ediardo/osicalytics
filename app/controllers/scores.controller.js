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
