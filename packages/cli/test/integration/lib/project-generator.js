// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const path = require('path');
const {expect, skipIf} = require('@loopback/testlab');
const yeoman = require('yeoman-environment');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const sinon = require('sinon');
const utils = require('../../../lib/utils');
const testUtils = require('../../test-utils');

const deps = utils.getDependencies();

module.exports = function (projGenerator, props, projectType) {
  return /** @this {Mocha.Context} */ function () {
    // Increase the timeout to 60 seconds to accommodate
    // for possibly slow CI build machines
    this.timeout(60 * 1000);

    describe('help', () => {
      it('prints lb4', () => {
        const env = yeoman.createEnv();
        const name = projGenerator.substring(
          projGenerator.lastIndexOf(path.sep) + 1,
        );
        env.register(projGenerator, 'loopback4:' + name);
        const generator = env.create('loopback4:' + name);
        const helpText = generator.help();
        assert(helpText.match(/lb4 /));
        assert(!helpText.match(/loopback4:/));
      });
    });

    describe('_setupGenerator', () => {
      describe('args validation', () => {
        it('errors out if validation fails for an argument value', () => {
          const result = testUtils
            .executeGenerator(projGenerator)
            .withArguments(['fooBar']);
          return expect(result).to.be.rejectedWith(
            /Invalid npm package name\: fooBar/,
          );
        });

        it('errors out if validation fails for an option value', () => {
          const result = testUtils
            .executeGenerator(projGenerator)
            .withOptions({name: 'fooBar'})
            .toPromise();
          return expect(result).to.be.rejectedWith(
            /Invalid npm package name\: fooBar/,
          );
        });

        it('succeeds if no arg is provided', () => {
          assert.doesNotThrow(() => {
            testUtils.testSetUpGen(projGenerator);
          }, Error);
        });

        it('succeeds if arg is valid', () => {
          assert.doesNotThrow(() => {
            testUtils.testSetUpGen(projGenerator, {args: ['foobar']});
          }, Error);
        });
      });
      describe('argument and options setup', () => {
        it('has name argument set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/\[<name>\]/));
          assert(helpText.match(/# Project name for the /));
          assert(helpText.match(/Type: String/));
          assert(helpText.match(/Required: false/));
        });

        it('has description option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--description/));
          assert(helpText.match(/# Description for the /));
        });

        it('has outdir option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--outdir/));
          assert(helpText.match(/# Project root directory /));
        });

        it('has private option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--private/));
          assert(
            helpText.match(
              /# Mark the project private \(excluded from npm publish\)/,
            ),
          );
        });

        it('has eslint option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--eslint/));
          assert(helpText.match(/# Enable eslint/));
        });

        it('has prettier option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--prettier/));
          assert(helpText.match(/# Enable prettier/));
        });

        it('has mocha option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--mocha/));
          assert(helpText.match(/# Enable mocha/));
        });

        it('has loopbackBuild option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--loopbackBuild/));
          assert(helpText.match(/# Use @loopback\/build/));
        });

        it('has vscode option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--vscode/));
          assert(helpText.match(/# Use preconfigured VSCode settings/));
        });

        it('has packageManager option set up', () => {
          const gen = testUtils.testSetUpGen(projGenerator);
          const helpText = gen.help();
          assert(helpText.match(/--packageManager/));
          assert(helpText.match(/# Change the default package manager/));
        });
      });
    });

    describe('setOptions', () => {
      it('has projectInfo set up', async () => {
        const gen = testUtils.testSetUpGen(projGenerator);
        gen.options = {
          name: 'foobar',
          description: null,
          outdir: null,
          eslint: null,
          prettier: true,
          mocha: null,
          loopbackBuild: null,
          vscode: null,
        };
        await gen.setOptions();
        assert(gen.projectInfo.name === 'foobar');
        assert(
          gen.projectInfo.dependencies['@loopback/context'] ===
            deps['@loopback/context'],
        );
        assert(
          gen.projectInfo.dependencies['@loopback/core'] ===
            deps['@loopback/core'],
        );
        assert(gen.projectInfo.description !== null);
        assert(gen.projectInfo.prettier === true);
      });
    });

    describe('promptProjectName', () => {
      it('incorporates user input into projectInfo', () => {
        const gen = testUtils.testSetUpGen(projGenerator);
        return testPrompt(
          gen,
          {
            name: 'foobar',
            description: 'foobar description',
          },
          'promptProjectName',
        ).then(() => {
          gen.prompt.restore();
          assert(gen.projectInfo.name);
          assert(gen.projectInfo.description);
          assert(gen.projectInfo.name === 'foobar');
          assert(gen.projectInfo.description === 'foobar description');
        });
      });
    });

    describe('promptProjectDir', () => {
      it('incorporates user input into projectInfo', () => {
        const gen = testUtils.testSetUpGen(projGenerator);
        return testPrompt(
          gen,
          {
            outdir: 'foobar',
          },
          'promptProjectDir',
        ).then(() => {
          gen.prompt.restore();
          assert(gen.projectInfo.outdir);
          assert(gen.projectInfo.outdir === 'foobar');
        });
      });
    });

    describe('promptOptions', () => {
      it('incorporates user input into projectInfo', () => {
        const gen = testUtils.testSetUpGen(projGenerator);
        return testPrompt(
          gen,
          {
            settings: [
              'Enable eslint',
              'Enable prettier',
              'Enable mocha',
              'Enable loopbackBuild',
              'Enable vscode',
            ],
          },
          'promptOptions',
        ).then(() => {
          gen.prompt.restore();
          assert(gen.projectInfo.eslint === true);
          assert(gen.projectInfo.prettier === true);
          assert(gen.projectInfo.mocha === true);
          assert(gen.projectInfo.loopbackBuild === true);
          assert(gen.projectInfo.vscode === true);
        });
      });
    });

    describe('without settings', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(props);
      });

      it('creates files', () => {
        assert.file([
          path.join(props.name, 'package.json'),
          path.join(props.name, '.yo-rc.json'),
          path.join(props.name, '.prettierrc'),
          path.join(props.name, '.gitignore'),
          path.join(props.name, '.npmrc'),
          path.join(props.name, '.eslintrc.js'),
          path.join(props.name, 'src/index.ts'),
          path.join(props.name, '.vscode/settings.json'),
          path.join(props.name, '.vscode/tasks.json'),
        ]);
        assert.jsonFileContent(path.join(props.name, 'package.json'), props);
        assert.fileContent([
          [path.join(props.name, 'package.json'), '@loopback/build'],
          [path.join(props.name, 'package.json'), '"typescript"'],
          [path.join(props.name, 'package.json'), '"eslint"'],
          [path.join(props.name, 'package.json'), '@loopback/eslint-config'],
          [path.join(props.name, 'package.json'), 'source-map-support'],
          [path.join(props.name, '.eslintrc.js'), '@loopback/eslint-config'],
          [path.join(props.name, 'tsconfig.json'), '@loopback/build'],
        ]);
        assert.noFileContent([
          [path.join(props.name, '.eslintrc.js'), '"rules"'],
          [path.join(props.name, 'package.json'), 'eslint-config-prettier'],
          [
            path.join(props.name, 'package.json'),
            'eslint-plugin-eslint-plugin',
          ],
          [path.join(props.name, 'package.json'), 'eslint-plugin-mocha'],
          [
            path.join(props.name, 'package.json'),
            '@typescript-eslint/eslint-plugin',
          ],
        ]);

        if (projectType === 'application') {
          assert.fileContent(
            path.join(props.name, 'package.json'),
            `"@loopback/core": "${deps['@loopback/core']}"`,
          );
          assert.fileContent(
            path.join(props.name, 'package.json'),
            `"@loopback/rest": "${deps['@loopback/rest']}"`,
          );
          assert.jsonFileContent(path.join(props.name, 'package.json'), {
            scripts: {
              rebuild: 'npm run clean && npm run build',
              prestart: 'npm run rebuild',
              start: 'node -r source-map-support/register .',
            },
          });
        }
        if (projectType === 'extension') {
          assert.fileContent(
            path.join(props.name, 'package.json'),
            `"@loopback/core": "${deps['@loopback/core']}"`,
          );
          assert.noFileContent(
            path.join(props.name, 'package.json'),
            '"@loopback/rest"',
          );
          assert.noFileContent(
            path.join(props.name, 'package.json'),
            '"@loopback/openapi-v3"',
          );
          assert.noJsonFileContent(path.join(props.name, 'package.json'), {
            rebuild: 'npm run clean && npm run build',
            prestart: 'npm run rebuild',
            start: 'node .',
          });
        }
      });
    });

    describe('with mocha disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: ['Disable mocha'],
            },
            props,
          ),
        );
      });

      it('does not create .mocharc.json files', () => {
        assert.noFile('.mocharc.json');
      });
    });

    describe('with loopbackBuild disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                // Force Enable loopbackBuild to be unchecked
                'Disable loopbackBuild',
                'Enable eslint',
                'Enable prettier',
                'Enable mocha',
                'Enable vscode',
              ],
            },
            props,
          ),
        );
      });

      it('creates files', () => {
        assert.jsonFileContent(path.join(props.name, 'package.json'), props);
        assert.fileContent(
          path.join(props.name, 'package.json'),
          `"@loopback/core": "${deps['@loopback/core']}"`,
        );
        assert.fileContent(
          path.join(props.name, 'package.json'),
          `"rimraf": "${deps['rimraf']}"`,
        );
        assert.noFileContent([
          [path.join(props.name, 'package.json'), '@loopback/build'],
          [path.join(props.name, 'package.json'), '@loopback/dist-util'],
          [path.join(props.name, 'tsconfig.json'), '@loopback/build'],
          [path.join(props.name, 'package.json'), 'eslint-config-prettier'],
          [
            path.join(props.name, 'package.json'),
            'eslint-plugin-eslint-plugin',
          ],
          [path.join(props.name, 'package.json'), 'eslint-plugin-mocha'],
          [
            path.join(props.name, 'package.json'),
            '@typescript-eslint/eslint-plugin',
          ],
        ]);
        assert.fileContent([
          [
            path.join(props.name, 'package.json'),
            '"clean": "rimraf dist *.tsbuildinfo .eslintcache"',
          ],
          [path.join(props.name, 'package.json'), /^ {4}"typescript"/m],
          [path.join(props.name, 'package.json'), /^ {4}"tslib"/m],
          [path.join(props.name, 'package.json'), '"eslint"'],
          [path.join(props.name, 'package.json'), '@loopback/eslint-config'],
          [path.join(props.name, 'package.json'), '"prettier"'],
          [
            path.join(props.name, '.eslintrc.js'),
            "extends: '@loopback/eslint-config'",
          ],
          [path.join(props.name, 'tsconfig.json'), '"compilerOptions"'],
          [path.join(props.name, 'tsconfig.json'), '"resolveJsonModule": true'],
        ]);
      });
    });

    describe('with prettier disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                'Enable loopbackBuild',
                'Enable eslint',
                'Disable prettier', // Force Enable prettier to be unchecked
                'Enable mocha',
                'Enable vscode',
              ],
            },
            props,
          ),
        );
      });

      it('creates files', () => {
        assert.noFile([
          path.join(props.name, '.prettierrc'),
          path.join(props.name, '.prettierrcignore'),
        ]);
        assert.jsonFileContent(path.join(props.name, 'package.json'), props);
      });
    });

    describe('with eslint disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                'Enable loopbackBuild',
                'Disable eslint', // Force Enable eslint to be unchecked
                'Enable prettier',
                'Enable mocha',
                'Enable vscode',
              ],
            },
            props,
          ),
        );
      });

      it('creates files', () => {
        assert.noFile(
          [path.join(props.name, '.eslintrc.js'), 'eslint.build.json'],
          [path.join(props.name, 'package.json'), '"eslint"'],
          [path.join(props.name, 'package.json'), 'eslint-config-prettier'],
          [
            path.join(props.name, 'package.json'),
            'eslint-plugin-eslint-plugin',
          ],
          [path.join(props.name, 'package.json'), 'eslint-plugin-mocha'],
          [
            path.join(props.name, 'package.json'),
            '@typescript-eslint/eslint-plugin',
          ],
          [path.join(props.name, 'package.json'), '@loopback/eslint-config'],
        );
        assert.jsonFileContent(path.join(props.name, 'package.json'), props);
      });
    });

    describe('with loopbackBuild & eslint disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                // Force Enable loopbackBuild to be unchecked
                'Disable loopbackBuild',
                // Force Enable eslint to be unchecked
                'Disable eslint',
                'Enable prettier',
                'Enable mocha',
                'Enable vscode',
              ],
            },
            props,
          ),
        );
      });

      it('creates files', () => {
        assert.jsonFileContent(path.join(props.name, 'package.json'), props);
        assert.noFile([
          path.join(props.name, '.eslintrc.js'),
          'eslint.build.json',
        ]);
        assert.noFileContent([
          [path.join(props.name, 'package.json'), '@loopback/build'],
          [path.join(props.name, 'package.json'), '"eslint"'],
          [path.join(props.name, 'package.json'), 'eslint-config-prettier'],
          [
            path.join(props.name, 'package.json'),
            'eslint-plugin-eslint-plugin',
          ],
          [path.join(props.name, 'package.json'), 'eslint-plugin-mocha'],
          [
            path.join(props.name, 'package.json'),
            '@typescript-eslint/eslint-plugin',
          ],
          [path.join(props.name, 'package.json'), '@loopback/eslint-config'],
          [path.join(props.name, 'tsconfig.json'), '@loopback/build'],
        ]);
        assert.fileContent([
          [path.join(props.name, 'package.json'), '"typescript"'],
          [path.join(props.name, 'package.json'), '"prettier"'],
          [path.join(props.name, 'tsconfig.json'), '"compilerOptions"'],
        ]);
        assert.noFileContent([
          [path.join(props.name, 'package.json'), '"eslint"'],
        ]);
      });
    });

    describe('with vscode disabled', () => {
      before(() => {
        return helpers.run(projGenerator).withPrompts(
          Object.assign(
            {
              settings: [
                'Enable loopbackBuild',
                'Enable eslint',
                'Enable prettier',
                'Enable mocha',
                'Disable vscode', // Force Enable vscode to be unchecked
              ],
            },
            props,
          ),
        );
      });

      it('does not create .vscode files', () => {
        assert.noFile('.vscode/');
      });
    });

    describe('with --skip-optional-prompts', () => {
      before(() => {
        return helpers.run(projGenerator).withOptions({
          name: props.name,
          'skip-optional-prompts': true,
        });
      });

      it('creates files', () => {
        assert.jsonFileContent(path.join(props.name, 'package.json'), {
          name: props.name,
          description: props.name,
        });
      });
    });

    describe('set npm packageManager', () => {
      before(() => {
        return helpers.run(projGenerator).withOptions({
          name: props.name,
          packageManager: 'npm',
        });
      });
      it('check .yo-rc.json', async () => {
        assert.file(path.join(props.name, '.yo-rc.json'));
        assert.jsonFileContent(path.join(props.name, '.yo-rc.json'), {
          '@loopback/cli': {
            packageManager: 'npm',
          },
        });
      });
    });

    skipIf(
      !utils.isYarnAvailable(),
      describe,
      'set yarn packageManager',
      () => {
        before(() => {
          return helpers.run(projGenerator).withOptions({
            name: props.name,
            packageManager: 'yarn',
          });
        });
        it('check .yo-rc.json', () => {
          assert.file(path.join(props.name, '.yo-rc.json'));
          assert.jsonFileContent(path.join(props.name, '.yo-rc.json'), {
            '@loopback/cli': {
              packageManager: 'yarn',
            },
          });
        });
      },
    );

    describe('set invalid packageManager', () => {
      it('get invalid error', () => {
        const result = testUtils
          .executeGenerator(projGenerator)
          .withOptions({packageManager: 'invalidPkgManager'})
          .toPromise();

        return expect(result).to.be.rejectedWith(
          /Package manager 'invalidPkgManager' is not supported\. Use npm or yarn\./,
        );
      });
    });

    async function testPrompt(gen, prompts, fnName) {
      await gen.setOptions();
      gen.prompt = sinon.stub(gen, 'prompt');
      gen.prompt.resolves(prompts);
      return gen[fnName]();
    }
  };
};
