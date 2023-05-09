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
    logLevel: 'info',
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 3,
  });

  const userExample = { id: 1, name: 'Homer Simpson', age: 39};

  /* The before, afterEach, and after hooks are set up to respectively start, 
  verify, and finalize the Pact instance after each test run. */
  before(() => {
    return provider.setup();
  });

  afterEach(() => {
    return provider.verify();
  });

  after(() => {
    return provider.finalize();
  });

  describe('Publishing Pacts', () => {
    it('should publish the pacts to the pact broker', () => {
      const opts = {
        pactFilesOrDirs: [path.resolve(process.cwd(), 'pacts')],
        pactBroker: pactBrokerUrl,
        pactBrokerToken: pactBrokerToken,
        tags: ['test'],
        consumerVersion: '1.0.0',
      };
  
      return new Publisher(opts).publish();
    });
  });

  describe('get /users/:id', () => {
    const EXPECTED_BODY = {
      id: 1,
      name: 'Homer Simpson',
      age: 39
    };

    /* Inside the beforeEach hook, the Provider service is set up to respond with a JSON object 
    representing a user with ID 1, by calling the provider.addInteraction() method. This sets up the 
    expected behavior of the Provider service in response to a request with a specific HTTP method, path, 
    headers, and body, given a specific state. */
    
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

    /* The it block sends a request to the Provider service using the UserService instance with the specified URL and ID, 
    and checks that the returned data matches the expected data using the expect assertion. 
    If the test passes, the Pact framework will generate a contract for the get /users/:id endpoint that can be used to 
    verify the Consumer service's expectations. */

    it('returns the requested user (provider)', async () => {
      const userService = new UserService(provider.mockService.baseUrl);
      const response = await userService.getUser(1);

      expect(response.data).to.deep.eq(userExample);
    });
  });
});
