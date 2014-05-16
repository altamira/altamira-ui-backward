'use strict';

describe('Service: Quotation', function () {

  // load the service's module
  beforeEach(module('altamiraUiApp'));

  // instantiate service
  var Quotation;
  beforeEach(inject(function (_Quotation_) {
    Quotation = _Quotation_;
  }));

  it('should do something', function () {
    expect(!!Quotation).toBe(true);
  });

});
