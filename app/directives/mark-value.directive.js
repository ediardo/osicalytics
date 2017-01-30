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
