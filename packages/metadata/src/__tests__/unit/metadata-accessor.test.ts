// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  ClassDecoratorFactory,
  MetadataAccessor,
  MetadataInspector,
} from '../..';

describe('MetadataAccessor', () => {
  it('creates an accessor with a string key', () => {
    expect(
      MetadataAccessor.create<string, ClassDecorator>('foo'),
    ).to.have.property('key', 'foo');
  });

  it('overrides toString()', () => {
    expect(
      MetadataAccessor.create<object, ClassDecorator>('bar').toString(),
    ).to.equal('bar');
  });

  it('can be used to create decorator', () => {
    const nameKey = MetadataAccessor.create<string, ClassDecorator>('name');

    function classDecorator(name: string) {
      return ClassDecoratorFactory.createDecorator<string>(nameKey, name);
    }

    @classDecorator('my-controller')
    class MyController {}

    expect(MetadataInspector.getClassMetadata(nameKey, MyController)).to.equal(
      'my-controller',
    );
  });
});
