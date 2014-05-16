'use strict';

describe('Service: Standard', function () {

  // load the service's module
  beforeEach(module('altamiraUiApp'));

  // instantiate service
  var Standard;
  beforeEach(inject(function (_Standard_) {
    Standard = _Standard_;
  }));

  it('should do something', function () {
    expect(!!Standard).toBe(true);
  });

});
