// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/booter-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');

const app = (module.exports = loopback());

app.dataSource('memory', {connector: 'memory'});
const Color = app.registry.createModel('Color', {name: String});
app.model(Color, {dataSource: 'memory'});

app.get('/hello', (req, res) => {
  res.send('hello');
});

boot(app, __dirname, function (err) {
  if (err) throw err;
});
