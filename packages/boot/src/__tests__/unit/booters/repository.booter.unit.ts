// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {
  ApplicationWithRepositories,
  RepositoryMixin,
} from '@loopback/repository';
import {expect, sinon, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {RepositoryBooter, RepositoryDefaults} from '../../..';

describe('repository booter unit tests', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../../.sandbox'));

  const REPOSITORIES_PREFIX = 'repositories';
  const REPOSITORIES_TAG = 'repository';

  class RepoApp extends RepositoryMixin(Application) {}

  let app: RepoApp;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stub: sinon.SinonStub<[any?, ...any[]], void>;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);
  beforeEach(createStub);
  afterEach(restoreStub);

  it('gives a warning if called on an app without RepositoryMixin', async () => {
    const normalApp = new Application();
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/multiple.artifact.js'),
    );

    const booterInst = new RepositoryBooter(
      normalApp as ApplicationWithRepositories,
      sandbox.path,
    );

    // Load uses discovered property
    booterInst.discovered = [resolve(sandbox.path, 'multiple.artifact.js')];
    await booterInst.load();

    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(
      stub,
      'app.repository() function is needed for RepositoryBooter. You can add it ' +
        'to your Application using RepositoryMixin from @loopback/repository.',
    );
  });

  it(`uses RepositoryDefaults for 'options' if none are give`, () => {
    const booterInst = new RepositoryBooter(app, sandbox.path);
    expect(booterInst.options).to.deepEqual(RepositoryDefaults);
  });

  it('overrides defaults with provided options and uses defaults for the rest', () => {
    const options = {
      dirs: ['test'],
      extensions: ['.ext1'],
    };
    const expected = Object.assign({}, options, {
      nested: RepositoryDefaults.nested,
    });

    const booterInst = new RepositoryBooter(app, sandbox.path, options);
    expect(booterInst.options).to.deepEqual(expected);
  });

  it('binds repositories during the load phase', async () => {
    const expected = [
      `${REPOSITORIES_PREFIX}.ArtifactOne`,
      `${REPOSITORIES_PREFIX}.ArtifactTwo`,
    ];
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/multiple.artifact.js'),
    );
    const booterInst = new RepositoryBooter(app, sandbox.path);
    const NUM_CLASSES = 2; // 2 classes in above file.

    // Load uses discovered property
    booterInst.discovered = [resolve(sandbox.path, 'multiple.artifact.js')];
    await booterInst.load();

    const repos = app.findByTag(REPOSITORIES_TAG);
    const keys = repos.map(binding => binding.key);
    expect(keys).to.have.lengthOf(NUM_CLASSES);
    expect(keys.sort()).to.eql(expected.sort());
  });

  function restoreStub() {
    stub.restore();
  }

  function createStub() {
    stub = sinon.stub(console, 'warn');
  }

  function getApp() {
    app = new RepoApp();
  }
});
