'use strict';

describe('Service: PurchasePlanning', function () {

  // load the service's module
  beforeEach(module('altamiraUiApp'));

  // instantiate service
  var PurchasePlanning;
  beforeEach(inject(function (_PurchasePlanning_) {
    PurchasePlanning = _PurchasePlanning_;
  }));

  it('should do something', function () {
    expect(!!PurchasePlanning).toBe(true);
  });

});
