// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import hyperid from 'hyperid';

/**
 * Generate a (globally) unique identifier in a very fast way.
 * Please note the ids ARE NOT formatted as UUID and have variable length.
 * The format of generated values may change in the future.
 *
 * @internal
 */
export const generateUniqueId = hyperid({
  fixedLength: false,
  urlSafe: true,
});

/**
 * A regular expression for testing values generated by generateUniqueId.
 * @internal
 */
export const UNIQUE_ID_PATTERN = /[A-Za-z0-9-_]+-\d+/;
