import serverless from '../lib/_serverless'

describe('Serverless', function() {
  it('lib exports serverless', function() {
    expect(serverless).to.be.a('function');
  })
})