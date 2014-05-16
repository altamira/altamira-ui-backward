'use strict';

describe('Service: DateUtil', function () {

  // load the service's module
  beforeEach(module('altamiraUiApp'));

  // instantiate service
  var DateUtil;
  beforeEach(inject(function (_DateUtil_) {
    DateUtil = _DateUtil_;
  }));

  it('should do something', function () {
    expect(!!DateUtil).toBe(true);
  });

});
