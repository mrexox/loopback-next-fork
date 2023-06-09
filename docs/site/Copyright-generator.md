---
lang: en
title: 'Generate copyright/license header for JavaScript/TypeScript files'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, CLI, Utility
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Copyright-generator.html
---

### Synopsis

The `lb4 copyright` command runs inside a Node.js project with `package.json` to
add or update copyright/license header for JavaScript and TypeScript files based
on `package.json` and git history.

The command also supports [lerna](https://github.com/lerna/lerna) monorepos. It
traverses all packages within the monorepo and apply copyright/license headers.

```sh
lb4 copyright [options]
```

The following is an example of such headers.

```js
// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
```

The year(s) is built from the git history of the file and `Node module` is read
from the `name` property in `package.json`.

Please note the command expects `git` is installed.

### Options

`--owner` : _(Optional)_ The owner of the copyright, such as
`IBM Corp. and LoopBack contributors`.

`--license` : _(Optional)_ The name of the license, such as `MIT`.

`--gitOnly` : _(Optional)_ A flag to control if only git tracked files are
updated. Default to `true`.

`--updateLicense`: _(Optional)_ A flag to control if `package.json` and
`LICENSE` files should be updated to reflect the selected license id.

`--exclude`: _(Optional)_ One or more glob patterns with `,` delimiter to
exclude files that match the patterns from being updated.

### Interactive Prompts

The command prompts you for:

1. The copyright owner. The default value is read from `copyright.owner` or
   `author` in the `package.json`.

2. The license name. The default value is read from `license` in the
   `package.json`.

   If the license name is `CUSTOM`, you'll be prompted to provide a custom
   template. For example:

   ```
   =============================================================================
   Licensed Materials - Property of <%= owner %>
   (C) Copyright <%= owner %> <%= years %>
   US Government Users Restricted Rights - Use, duplication or disclosure
   restricted by GSA ADP Schedule Contract with <%= owner %>.
   =============================================================================
   ```

   To avoid such prompt, create the `license-header.template` in the root
   directory of your package, its content will be read as the license header
   template without prompting.

The default owner is `IBM Corp. and LoopBack contributors` and license is `MIT`
with the following `package.json`.

```json
{
  "name": "@loopback/boot",
  "version": "2.0.2",
  "author": "IBM Corp. and LoopBack contributors",
  "copyright.owner": "IBM Corp. and LoopBack contributors",
  "license": "MIT"
}
```

### Output

The following output is captured when `lb4 copyright` is run against
[`loopback4-example-shopping`](https://github.com/loopbackio/loopback4-example-shopping).

```
? Copyright owner: IBM Corp. and LoopBack contributors
? License name: (Use arrow keys or type to search)
❯ MIT (MIT License)
  ISC (ISC License)
  Artistic-2.0 (Artistic License 2.0)
  Apache-2.0 (Apache License 2.0)
  ...
? Do you want to update package.json and LICENSE? No
Updating project loopback4-example-recommender (packages/recommender)
Updating project loopback4-example-shopping (packages/shopping)
Updating project loopback4-example-shopping-monorepo (.)
```
