// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect, supertest} from '@loopback/testlab';
import {
  DefaultSequence,
  RequestContext,
  RestApplication,
  RestBindings,
  RestComponent,
  RestServer,
} from '../../..';

describe('Bootstrapping with RestComponent', () => {
  context('with a user-defined sequence', () => {
    let app: Application;
    let server: RestServer;
    before(givenAppWithUserDefinedSequence);

    it('binds the `sequence` key to the user-defined sequence', () => {
      // At this moment, the Sequence is not ready to be resolved
      // as RestBindings.Http.CONTEXT is not bound
      const binding = server.getBinding(RestBindings.SEQUENCE);
      expect(binding.valueConstructor).to.equal(UserDefinedSequence);
    });

    class UserDefinedSequence extends DefaultSequence {}

    async function givenAppWithUserDefinedSequence() {
      app = new Application({
        rest: {
          sequence: UserDefinedSequence,
          port: 0,
        },
      });
      app.component(RestComponent);
      server = await app.getServer(RestServer);
    }
  });
});

describe('Starting the application', () => {
  it('starts an HTTP server (using RestServer)', async () => {
    const app = new Application({
      rest: {
        port: 0,
      },
    });
    app.component(RestComponent);
    const server = await app.getServer(RestServer);
    server.handler(sequenceHandler);
    await startServerCheck(app);
  });

  it('starts an HTTP server (using RestApplication)', async () => {
    const app = new RestApplication();
    app.restServer.bind(RestBindings.PORT).to(0);
    app.handler(sequenceHandler);
    await startServerCheck(app);
  });
});

// Helper function to spin up the application instance and assert that it
// works.
async function startServerCheck(app: Application) {
  const server = await app.getServer(RestServer);
  await app.start();
  const port = await server.get(RestBindings.PORT);

  await supertest(`http://localhost:${port}`)
    .get('/')
    .expect(200, 'hello world');
  await app.stop();
}

function sequenceHandler(
  {response}: RequestContext,
  sequence: DefaultSequence,
) {
  sequence.send(response, 'hello world');
}
