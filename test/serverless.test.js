import serverless from '../lib/serverless'

describe('Serverless', function() {
  it('lib exports serverless', function() {
    expect(serverless).to.be.a('function');
  })
})