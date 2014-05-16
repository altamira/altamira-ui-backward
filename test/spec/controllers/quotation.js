'use strict';

describe('Controller: QuotationCtrl', function () {

  // load the controller's module
  beforeEach(module('altamiraUiApp'));

  var QuotationCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    QuotationCtrl = $controller('QuotationCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
