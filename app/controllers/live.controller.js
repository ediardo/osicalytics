(function() {
  'use strict';

  angular
    .module('osicApp')
    .controller('liveCtrl', liveCtrl);

  function liveCtrl($scope, $http, myFactory, $q, $location, NgTableParams) {
    /*
    $scope.liveCommits = [
      { title: 'adfsasdfasdffdsasd', author_name: 'ediardo', company: 'intel'},
      { title: 'adfsasdfasdffdsasd', author_name: 'ediardo', company: 'intel'},
      { title: 'adfsasdfasdffdsasd', author_name: 'ediardo', company: 'rax'},
      { title: 'adfsasdfasdffdsasd', author_name: 'ediardo', company: 'intel'},
      { title: 'adfsasdfasdffdsasd', author_name: 'ediardo', company: 'rax'}
    ];

    $scope.liveReviews = [
      { title: 'Interesting Patch1', author_name: 'ediardo', value: '+1', company: 'rax'},
      { title: 'Interesting Patch2', author_name: 'ediardo', value: '+2', company: 'intel'},
      { title: 'Interesting Patch3', author_name: 'ediardo', value: '+1', company: 'rax'},
      { title: 'Interesting Patch4', author_name: 'ediardo', value: '-1', company: 'rax'},
      { title: 'Boring Patch 5', author_name: 'ediardo', value: '-2', company: 'intel'}
    ];

    $scope.liveBlueprints = [
      { title: 'Awesome BP', author_name: 'ediardo', company: 'rax', action: 'drafted', priority: 'high'},
      { title: 'Incredible BP', author_name: 'ediardo', company: 'intel', action: 'completed', priority: 'essential'},
      { title: 'Fantastic BP', author_name: 'ediardo', company: 'rax', action: 'drafted', priority: 'high'},
      { title: 'Terrible BP', author_name: 'ediardo', company: 'intel', action: 'completed', priority: 'medium'},
      { title: 'Good BP', author_name: 'ediardo', company: 'rax', action: 'completed', priority: 'low'}
    ];

    $scope.liveBugs = [
      { title: 'Huge Bug', author_name: 'ediardo', company: 'rax', action: 'fixed', priority: 'high'},
      { title: 'I hate this Bug', author_name: 'ediardo', company: 'intel', action: 'filed', priority: 'critical'},
      { title: 'Poisonous Bug', author_name: 'ediardo', company: 'rax', action: 'fixed', priority: 'high'},
      { title: 'Funny bug', author_name: 'ediardo', company: 'intel', action: 'filed', priority: 'medium'},
      { title: 'A hard-to-fix bug', author_name: 'ediardo', company: 'rax', action: 'filed', priority: 'low'}
    ];
    */
    /*
    $scope.live = [
      { type: 'commit', title: 'adfsasdfasdffdsasd', author_name: 'ediardo', company: 'intel', module: 'horizon'},
      { type: 'commit', title: 'adfsasdfasdffdsasd', author_name: 'ediardo', company: 'intel', module: 'horizon'},
      { type: 'commit', title: 'adfsasdfasdffdsasd', author_name: 'ediardo', company: 'rax', module: 'horizon'},
      { type: 'commit', title: 'adfsasdfasdffdsasd', author_name: 'ediardo', company: 'intel', module: 'horizon'},
      { type: 'mark', title: 'Interesting Patch1', author_name: 'ediardo', value: '+1', company: 'rax', module: 'horizon'},
      { type: 'mark', title: 'Interesting Patch2', author_name: 'ediardo', value: '+2', company: 'intel', module: 'horizon'},
      { type: 'mark', title: 'Interesting Patch3', author_name: 'ediardo', value: '+1', company: 'rax', module: 'horizon'},
      { type: 'mark', title: 'Boring Patch 5', author_name: 'ediardo', value: '-2', company: 'intel', module: 'horizon'},
      { type: 'bp', title: 'Awesome BP', author_name: 'ediardo', company: 'rax', action: 'drafted', priority: 'high', module: 'horizon'},
      { type: 'bp', title: 'Incredible BP', author_name: 'ediardo', company: 'intel', action: 'completed', priority: 'essential', module: 'horizon'},
      { type: 'bp', title: 'Terrible BP', author_name: 'ediardo', company: 'intel', action: 'completed', priority: 'medium', module: 'horizon'},
      { type: 'bp', title: 'Good BP', author_name: 'ediardo', company: 'rax', action: 'completed', priority: 'low', module: 'horizon'},
      { type: 'bug', title: 'Huge Bug', author_name: 'ediardo', company: 'rax', action: 'fixed', priority: 'high', module: 'horizon'},
      { type: 'bug', title: 'I hate this Bug', author_name: 'ediardo', company: 'intel', action: 'filed', priority: 'critical', module: 'horizon'},
      { type: 'bug', title: 'Poisonous Bug', author_name: 'ediardo', company: 'rax', action: 'fixed', priority: 'high', module: 'horizon'},
      { type: 'bug', title: 'A hard-to-fix bug', author_name: 'ediardo', company: 'rax', action: 'filed', priority: 'low', module: 'horizon'}
    ];

    $scope.getLiveFeed = function() {
      console.log('asdasdaasdsaas');
      var promises = [];

      $scope.loading = true;
      myFactory.getDetails({
        start_date: $scope.startDate.getTime() / 1000,
        end_date: $scope.endDate.getTime() / 1000,
        metric: metric,
        release: $scope.selectedRelease ?  $scope.selectedRelease.id : 'all',
        page_size: 0
      }).then(function (details) {
        console.log(details);
        if (metric == 'commits') {
        } else if (metric == 'bpc') {
        } else if (metric == 'bpd') {
        } else if (metric == 'resolved-bugs') {
        } else if (metric == 'filed-bugs') {
        } else if (metric == 'marks') {
        }
        $scope.loading = false;
      });
    }

    */
  }

})();
