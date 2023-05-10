import { Pact } from '@pact-foundation/pact';
import { Publisher } from '@pact-foundation/pact-node';
import { expect } from 'chai';
import * as path from 'path';
import { UserService } from '../index';

const pactBrokerUrl = 'https://fluxpoc.pactflow.io';
const pactBrokerToken = 'VBNJwYHPcX_pXGiMcxT5eQ';


describe('The Users API (provider)', () => {
  const provider = new Pact({
    consumer: 'User Web',
    provider: 'User API',
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    logLevel: 'debug',
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 3,
  });

  const userExample = { id: 1, name: 'Homer Simpson', age: 39};

  before(() => {
    return provider.setup();
  });

  afterEach(() => {
    return provider.verify();
  });

  after(() => {
    return provider.finalize();
  });

  describe('get /users/:id', () => {
    const EXPECTED_BODY = {
      id: 1,
      name: 'Homer Simpson',
      age: 39
    };

    beforeEach(() => {
      return provider.addInteraction({
        state: 'a user with ID 1 exists',
        uponReceiving: 'a request to get a user',
        withRequest: {
          method: 'GET',
          path: '/users/1',
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: EXPECTED_BODY,
        },
      });
    });

    it('returns the requested user (provider)', async () => {
      const userService = new UserService(provider.mockService.baseUrl);
      const response = await userService.getUser(1);

      expect(response.data).to.deep.eq(userExample);
    });
  });

  describe('Publishing Pacts', () => {
    it('should publish the pacts to the pact broker', () => {
      const opts = {
        pactFilesOrDirs: [path.resolve(process.cwd(), 'pacts')],
        pactBroker: pactBrokerUrl,
        pactBrokerToken: pactBrokerToken,
        tags: ['test'],
        consumerVersion: '1.0.1',
      };
  
      return new Publisher(opts).publish();
    });
  });

 
});
