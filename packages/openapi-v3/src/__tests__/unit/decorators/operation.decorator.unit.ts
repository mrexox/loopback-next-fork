// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOpenApiSpec, anOperationSpec} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';
import {
  api,
  del,
  get,
  getControllerSpec,
  operation,
  param,
  patch,
  post,
  put,
} from '../../..';

describe('Routing metadata', () => {
  it('returns spec defined via @api()', () => {
    const expectedSpec = anOpenApiSpec()
      .withOperationReturningString('get', '/greet', 'greet')
      .build();

    @api(expectedSpec)
    class MyController {
      greet() {
        return 'Hello world!';
      }
    }

    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec).to.eql(expectedSpec);
  });

  it('caches controller spec', () => {
    const expectedSpec = anOpenApiSpec()
      .withOperationReturningString('get', '/greet', 'greet')
      .build();

    @api(expectedSpec)
    class MyController {
      greet() {
        return 'Hello world!';
      }
    }

    const spec1 = getControllerSpec(MyController);
    const spec2 = getControllerSpec(MyController);
    expect(spec2).to.be.exactly(spec1);
  });

  it('returns spec defined via @get decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @get('/greet', operationSpec)
      greet() {
        return 'Hello world!';
      }
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec).to.eql({
      paths: {
        '/greet': {
          get: {
            'x-controller-name': 'MyController',
            'x-operation-name': 'greet',
            operationId: 'MyController.greet',
            ...operationSpec,
          },
        },
      },
    });
  });

  it('returns spec defined via @post decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @post('/greeting', operationSpec)
      createGreeting() {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec).to.eql({
      paths: {
        '/greeting': {
          post: {
            'x-controller-name': 'MyController',
            'x-operation-name': 'createGreeting',
            operationId: 'MyController.createGreeting',
            ...operationSpec,
          },
        },
      },
    });
  });

  it('returns spec defined via @put decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @put('/greeting', operationSpec)
      updateGreeting() {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec).to.eql({
      paths: {
        '/greeting': {
          put: {
            'x-controller-name': 'MyController',
            'x-operation-name': 'updateGreeting',
            operationId: 'MyController.updateGreeting',
            ...operationSpec,
          },
        },
      },
    });
  });

  it('returns spec defined via @patch decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @patch('/greeting', operationSpec)
      patchGreeting() {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec).to.eql({
      paths: {
        '/greeting': {
          patch: {
            'x-controller-name': 'MyController',
            'x-operation-name': 'patchGreeting',
            operationId: 'MyController.patchGreeting',
            ...operationSpec,
          },
        },
      },
    });
  });

  it('returns spec defined via @del decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @del('/greeting', operationSpec)
      deleteGreeting() {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec).to.eql({
      paths: {
        '/greeting': {
          delete: {
            'x-controller-name': 'MyController',
            'x-operation-name': 'deleteGreeting',
            operationId: 'MyController.deleteGreeting',
            ...operationSpec,
          },
        },
      },
    });
  });

  it('returns spec defined via @operation decorator', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class MyController {
      @operation('post', '/greeting', operationSpec)
      createGreeting() {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec).to.eql({
      paths: {
        '/greeting': {
          post: {
            'x-controller-name': 'MyController',
            'x-operation-name': 'createGreeting',
            operationId: 'MyController.createGreeting',
            ...operationSpec,
          },
        },
      },
    });
  });

  it('returns default spec for @get with no spec', () => {
    class MyController {
      @get('/greet')
      greet() {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec.paths['/greet']['get']).to.eql({
      'x-controller-name': 'MyController',
      'x-operation-name': 'greet',
      operationId: 'MyController.greet',
      responses: {'200': {description: 'Return value of MyController.greet'}},
    });
  });

  it('returns default spec for @operation with no spec', () => {
    class MyController {
      @operation('post', '/greeting')
      createGreeting() {}
    }

    const actualSpec = getControllerSpec(MyController);

    expect(actualSpec.paths['/greeting']['post']).to.eql({
      'x-controller-name': 'MyController',
      'x-operation-name': 'createGreeting',
      operationId: 'MyController.createGreeting',
      responses: {
        '200': {description: 'Return value of MyController.createGreeting'},
      },
    });
  });

  it('honours specifications from inherited methods', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class Parent {
      @get('/parent', operationSpec)
      getParentName() {
        return 'The Parent';
      }
    }

    class Child extends Parent {
      @get('/child', operationSpec)
      getChildName() {
        return 'The Child';
      }
    }

    const actualSpec = getControllerSpec(Child);

    expect(actualSpec).to.eql({
      paths: {
        '/parent': {
          get: {
            'x-controller-name': 'Child',
            'x-operation-name': 'getParentName',
            operationId: 'Child.getParentName',
            ...operationSpec,
          },
        },
        '/child': {
          get: {
            'x-controller-name': 'Child',
            'x-operation-name': 'getChildName',
            operationId: 'Child.getChildName',
            ...operationSpec,
          },
        },
      },
    });
  });

  it('allows children to override parent REST endpoints', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class Parent {
      @get('/name', operationSpec)
      getParentName() {
        return 'The Parent';
      }
    }

    class Child extends Parent {
      @get('/name', operationSpec)
      getChildName() {
        return 'The Child';
      }
    }

    const actualSpec = getControllerSpec(Child);

    expect(actualSpec.paths['/name']['get']).to.have.property(
      'x-operation-name',
      'getChildName',
    );
  });

  it('allows children to override parent REST operations', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class Parent {
      @get('/parent-name', operationSpec)
      getName() {
        return 'The Parent';
      }
    }

    class Child extends Parent {
      @get('/child-name', operationSpec)
      getName() {
        return 'The Child';
      }
    }

    const childSpec = getControllerSpec(Child);
    const parentSpec = getControllerSpec(Parent);

    expect(childSpec.paths['/child-name']['get']).to.have.property(
      'x-operation-name',
      'getName',
    );

    // The parent endpoint has been overridden
    expect(childSpec.paths).to.not.have.property('/parent-name');

    expect(parentSpec.paths['/parent-name']['get']).to.have.property(
      'x-operation-name',
      'getName',
    );

    // The parent endpoint should not be polluted
    expect(parentSpec.paths).to.not.have.property('/child-name');
  });

  it('allows children to override parent REST parameters', () => {
    const operationSpec = anOperationSpec().withStringResponse().build();

    class Parent {
      @get('/greet', operationSpec)
      greet(@param.query.string('msg') msg: string) {
        return `Parent: ${msg}`;
      }
    }

    class Child extends Parent {
      greet(@param.query.string('message') msg: string) {
        return `Child: ${msg}`;
      }
    }

    const childSpec = getControllerSpec(Child);
    const parentSpec = getControllerSpec(Parent);

    const childGreet = childSpec.paths['/greet']['get'];
    expect(childGreet).to.have.property('x-operation-name', 'greet');

    expect(childGreet.parameters).to.have.property('length', 1);

    expect(childGreet.parameters[0]).to.containEql({
      name: 'message',
      in: 'query',
    });

    const parentGreet = parentSpec.paths['/greet']['get'];
    expect(parentGreet).to.have.property('x-operation-name', 'greet');

    expect(parentGreet.parameters).to.have.property('length', 1);

    expect(parentGreet.parameters[0]).to.containEql({
      name: 'msg',
      in: 'query',
    });
  });
});
