'use strict';

angular.module('altamiraUiApp')
  .factory('Standard', function (Restangular) {
    var request = Restangular.one('standard');

    // Public API...
    return {
      getAll: function () {
        return request.get();
      }
    };
  });
