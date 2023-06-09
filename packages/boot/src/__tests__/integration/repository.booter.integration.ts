// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {BooterApp} from '../fixtures/application';

describe('repository booter integration tests', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  // Remnants from Refactor -- need to add these to core
  const REPOSITORIES_PREFIX = 'repositories';
  const REPOSITORIES_TAG = 'repository';

  let app: BooterApp;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it('boots repositories when app.boot() is called', async () => {
    const expectedBindings = [
      `${REPOSITORIES_PREFIX}.ArtifactOne`,
      `${REPOSITORIES_PREFIX}.ArtifactTwo`,
    ];

    await app.boot();

    const bindings = app.findByTag(REPOSITORIES_TAG).map(b => b.key);
    expect(bindings.sort()).to.eql(expectedBindings.sort());
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/multiple.artifact.js'),
      'repositories/multiple.repository.js',
    );

    const MyApp = require(resolve(sandbox.path, 'application.js')).BooterApp;
    app = new MyApp();
  }
});
