// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {getLogMetadata, LevelMetadata, log, LOG_LEVEL} from '../../..';

describe('@log() decorator (unit)', () => {
  it('sets log level for method to given value', () => {
    class TestClass {
      @log(LOG_LEVEL.ERROR)
      test() {}
    }

    const level: LevelMetadata = getLogMetadata(TestClass, 'test');
    expect(level.level).to.be.eql(LOG_LEVEL.ERROR);
  });

  it('sets log level for method to default', () => {
    class TestClass {
      @log()
      test() {}
    }

    const level: LevelMetadata = getLogMetadata(TestClass, 'test');
    expect(level.level).to.be.eql(LOG_LEVEL.WARN);
  });
});
