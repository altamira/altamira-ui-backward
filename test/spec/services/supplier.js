'use strict';

describe('Service: Supplier', function () {

  // load the service's module
  beforeEach(module('altamiraUiApp'));

  // instantiate service
  var Supplier;
  beforeEach(inject(function (_Supplier_) {
    Supplier = _Supplier_;
  }));

  it('should do something', function () {
    expect(!!Supplier).toBe(true);
  });

});
