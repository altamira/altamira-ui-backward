'use strict';

describe('Controller: PurchaseplanningCtrl', function () {

  // load the controller's module
  beforeEach(module('altamiraUiApp'));

  var PurchaseplanningCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PurchaseplanningCtrl = $controller('PurchaseplanningCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
