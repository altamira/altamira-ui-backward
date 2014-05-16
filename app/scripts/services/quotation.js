'use strict';

angular.module('altamiraUiApp')
  .factory('Quotation', function ($log, Restangular) {
    var quotation = Restangular.one('quotation');

    // Public API...
    return {
      getCurrentQuotation: function () {
        return quotation.get();
      },
      save : function(quotationToSave) {
        return quotation.customPUT(quotationToSave);
      },
      closeCurrentQuotation : function() {
        return quotation.customPOST();
      }
    };
  });
