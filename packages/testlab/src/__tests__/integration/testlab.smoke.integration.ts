// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import assert from 'assert';
import * as testlab from '../..';

describe('testlab smoke test', () => {
  it('exports expect interface', () => {
    assert.equal(typeof testlab.expect, 'function');
  });
});
