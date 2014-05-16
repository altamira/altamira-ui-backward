'use strict';

describe('Service: PurchaseOrder', function () {

  // load the service's module
  beforeEach(module('altamiraUiApp'));

  // instantiate service
  var PurchaseOrder;
  beforeEach(inject(function (_PurchaseOrder_) {
    PurchaseOrder = _PurchaseOrder_;
  }));

  it('should do something', function () {
    expect(!!PurchaseOrder).toBe(true);
  });

});
