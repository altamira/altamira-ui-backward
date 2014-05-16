'use strict';

describe('Service: Material', function () {

  // load the service's module
  beforeEach(module('altamiraUiApp'));

  // instantiate service
  var Material;
  beforeEach(inject(function (_Material_) {
    Material = _Material_;
  }));

  it('should do something', function () {
    expect(!!Material).toBe(true);
  });

});
