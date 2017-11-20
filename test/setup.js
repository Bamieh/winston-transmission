process.env.NODE_ENV = 'test';

const chai = require('chai');
const spies = require('chai-spies');

chai.use(spies);

global.chai = chai;
global.expect = chai.expect;