// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {RestComponent, RestServer} from '../../..';

describe('Application.controller()', () => {
  it('binds the controller to "controllers.*" namespace', async () => {
    const app = new Application();
    app.component(RestComponent);
    const server = await app.getServer(RestServer);

    class TestController {}

    app.controller(TestController);

    let boundControllers = app.find('controllers.*').map(b => b.key);
    expect(boundControllers).to.containEql('controllers.TestController');

    // Bindings should also be available on the server context directly.
    boundControllers = server.find('controllers.*').map(b => b.key);
    expect(boundControllers).to.containEql('controllers.TestController');
  });
});
