import createTransmission from '../lib'

describe('Serverless', function() {
  it('lib exports createTransmission', function() {
    expect(createTransmission).to.be.a('function');
  })
  xit('creats a winston logger Instance', function() {
  })
  describe('Instance Settings', function() {
    before(function () {
      this.logLevel = 'info';
      this.logger = createTransmission({
        logLevel: this.logLevel
      })
    })
    it('sets log Level', function() {
      expect(this.logger.level).to.equal(this.logLevel);
    })
  })
  describe('Winston On Browser', function() {
    it('creates an instance on browser', function() {
      const logger = createTransmission({
        logLevel: 'silly',
        isBrowser: true,
      });
      logger.info('hi')
      logger.error('hi')
    })
  })
})