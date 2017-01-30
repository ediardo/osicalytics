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
