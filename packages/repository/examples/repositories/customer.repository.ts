// Copyright IBM Corp. and LoopBack contributors 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CrudRepositoryImpl, DataSource, Options, Where} from '../..';
import {Customer} from '../models/customer.model';

/**
 * A custom repository implementation
 */
export class CustomerRepository extends CrudRepositoryImpl<Customer, string> {
  constructor(dataSource: DataSource, model: Customer) {
    super(dataSource, Customer);
  }

  /**
   * Override deleteAll to disable the operation
   */
  deleteAll(where?: Where<Customer>, options?: Options) {
    return Promise.reject(new Error('deleteAll is disabled'));
  }
}
