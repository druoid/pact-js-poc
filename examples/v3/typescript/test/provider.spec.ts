
import * as path from 'path';
import * as sinonChai from 'sinon-chai';
import { PactV3, MatchersV3, LogLevel, Verifier} from '@pact-foundation/pact';
import { UserService } from '../index';
const { Publisher } = require('@pact-foundation/pact-node');

describe('Publish pact', () => {
    it('should publish pact to pactflow', function() { // lexical binding required here
        this.timeout(10000)
    
        let opts = {
            pactBroker: 'https://fluxpoc.pactflow.io',
            pactFilesOrDirs: ['/Users/andrewchambers/Dev/pact-js-poc/examples/v3/typescript/pacts'],
            tags: ['test'],
            consumerVersion: '1.0.4',
            pactUrls: ['https://fluxpoc.pactflow.io/overview/provider/User%20API/consumer/User%20Web'],
            pactBrokerUrl: 'https://fluxpoc.pactflow.io',
            pactBrokerToken: 'G5CX7CTsHZ8heT3_FcGmcg',
        }

        const publisher = new Publisher(opts);

        publisher.publish()
            .then(() => {
            console.log('Contract published successfully!');
        })
        .catch((err: any) => {
            console.error(`Error publishing contract: ${err}`);
        });       
    })

    const opts = {
        providerBaseUrl:'https://localhost:8081',
        provider: "User Profile Service",
        publishVerificationResult: true,
        providerVersion: "1.0.4",
      };
    
    
    new Verifier(opts).verifyProvider().then((output) => {
        console.log('Pact verification complete!');
        console.log(output);
    }).catch((error) => {
        console.error('Pact verification failed: ', error);
        process.exit(1);
    });  
});