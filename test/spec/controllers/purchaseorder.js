'use strict';

describe('Controller: PurchaseorderCtrl', function () {

  // load the controller's module
  beforeEach(module('altamiraUiApp'));

  var PurchaseorderCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PurchaseorderCtrl = $controller('PurchaseorderCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
