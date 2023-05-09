import { expect } from 'chai';
import { Pact, Matchers, InteractionObject } from '@pact-foundation/pact';
import { Publisher, Verifier } from '@pact-foundation/pact-node';
import { UserService } from '../index';
import * as path from 'path';

const { like } = Matchers;

describe('The Users API (consumer)', () => {
  // UserService object (which represents the consumer application) 
  let userService: UserService;

  // Object representing the expected response structure from the provider
  const userExample = { id: 1, name: 'Homer Simpson', age: 39 };
  const EXPECTED_BODY = like(userExample);

  // Pact setup
  const provider = new Pact({
    consumer: 'User Web',
    provider: 'User API',
    logLevel: 'info',
    dir: path.resolve(process.cwd(), 'pacts'),
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    spec: 2,
  });

  before(async () => {
    // Start the mock server
    await provider.setup();
    // Set the mock server URL in the consumer application
    userService = new UserService(provider.mockService.baseUrl);
  });

  after(async () => {
    // Write the pact file
    await provider.finalize();

    // Publish the pact file to the Pact Broker
    const opts = {
      pactFilesOrDirs: [path.resolve(process.cwd(), 'pacts')],
      pactBroker: 'https://fluxpoc.pactflow.io',
      pactBrokerToken: 'VBNJwYHPcX_pXGiMcxT5eQ',
      consumerVersion: '1.0.0',
    };
    await new Publisher(opts).publish();
  });

  describe('get /users/:id', () => {
    it('returns the requested user (consumer)', async () => {
      // Define the expected interaction
      const interaction: InteractionObject = {
        state: 'a user with ID 1 exists',
        uponReceiving: 'a request to get a user',
        withRequest: {
          method: 'GET',
          path: '/users/1',
        },
        willRespondWith: {
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: EXPECTED_BODY,
        },
      };

      // Execute the interaction and validate the response
      await provider.addInteraction(interaction);
      const response = await userService.getUser(1);
      expect(response.data).to.deep.eq(userExample);
    });
  });

  // Pact verification
  describe('Pact Verification', () => {
    it('validates the expectations of UserService', async () => {
      const opts = {
        provider: 'User API',
        providerBaseUrl: provider.mockService.baseUrl,
        pactUrls: [
          'https://fluxpoc.pactflow.io/pacts/provider/User%20API/consumer/User%20Web/version/1.0.0',
        ],
        publishVerificationResult: true,
        providerVersion: '1.0.0',
        pactBroker: 'https://fluxpoc.pactflow.io',
        pactBrokerToken: 'VBNJwYHPcX_pXGiMcxT5eQ',
      };

      await new Verifier(opts).verify();
    });
  });  
});



