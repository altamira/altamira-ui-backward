'use strict';

angular.module('altamiraUiApp')
  .factory('Supplier', function (Restangular) {
    var supplier = Restangular.one('supplier');

    // Public API...
    return {
      getAll: function () {
        return supplier.get();
      }
    };
  });
