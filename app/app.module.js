(function() {
  'use strict';

  angular
    .module('osicApp', ['ui.bootstrap', 'ngTable'])
    .config(['$locationProvider', '$logProvider', function ($locationProvider,$logProvider) {
       $locationProvider.html5Mode(true);
       $logProvider.debugEnabled(true)
    }]);

})();
