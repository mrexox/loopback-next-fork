// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {
  validateClassName,
  logNamingIssues,
  pascalCase,
  stringifyModelSettings,
} = require('../../lib/utils');
const {sanitizeProperty} = require('../../lib/model-discoverer');
const {
  createPropertyTemplateData,
  findBuiltinType,
} = require('../model/property-definition');
const chalk = require('chalk');
const {isDeepStrictEqual} = require('util');

module.exports = {
  importLb3ModelDefinition,
};

/**
 * Convert definition of a LB3 model into template data used by
 * LB4 model generator.
 *
 * @param {Function} modelCtor LB3 model class
 * @param {(msg: string, ...args: any) => void} log Logging function
 * @returns {object} Template data for model source file template
 */
function importLb3ModelDefinition(modelCtor, log) {
  const modelName = modelCtor.modelName;
  const result = validateClassName(modelName);
  if (!result) {
    const err = new Error(
      `Cannot import model: the name ${modelName} is not valid. ${result}`,
    );
    err.exit = true;
    throw err;
  }

  logNamingIssues(modelName, log);

  const baseDefinition = modelCtor.base.definition;
  const baseProps = {...baseDefinition.properties};

  // Core LB3 models like PersistedModel come with an id property that's
  // injected by juggler. We don't want to inherit that property, because
  // in LB4, we want models to define the id property explicitly.
  if (isCoreModel(modelCtor.base)) {
    delete baseProps.id;
  }

  const templateData = {
    name: modelName,
    className: pascalCase(modelName),
    ...migrateBaseClass(modelCtor.settings.base),
    properties: migrateModelProperties(
      modelCtor.definition.properties,
      baseProps,
    ),
    settings: migrateModelSettings(
      modelCtor.definition.settings,
      baseDefinition.settings,
      log,
    ),
  };

  const settings = templateData.settings;
  delete settings.base; // already handled by migrateBaseClass
  templateData.allowAdditionalProperties = !settings.strict;
  templateData.modelSettings = stringifyModelSettings(settings);

  return templateData;
}

function migrateModelProperties(properties = {}, inherited = {}) {
  const templateData = {};

  // In LB 3.x, primary keys are typically contributed by connectors later in
  // the startup process, therefore they end up at the end of the property list.
  // Here we create placeholder entries for PKs to get them generated first.
  Object.keys(properties)
    .filter(p => !!properties[p].id)
    .forEach(pk => {
      templateData[pk] = null;
    });

  for (const prop in properties) {
    const propDef = properties[prop];

    // Skip the property if it was inherited from the base model (the parent)
    const baseProp = inherited[prop];
    if (baseProp && isDeepStrictEqual(propDef, baseProp)) {
      delete templateData[prop];
      continue;
    }

    const def = migratePropertyDefinition(propDef);
    templateData[prop] = createPropertyTemplateData(def);
  }

  return templateData;
}

function migratePropertyDefinition(lb3PropDef) {
  const def = {...lb3PropDef};

  if (!Array.isArray(def.type)) {
    // scalar type
    def.type = migratePropertyType(def.type);
  } else {
    // array type - conversion is slightly more complex
    def.itemType = migratePropertyType(def.type[0]);
    def.type = 'array';

    // workaround for a weird behavior of LB3
    if (0 in def && def[0] === def.itemType) {
      delete def[0];
    }
  }

  if (def.updateOnly === false) {
    // updateOnly is disabled by default, no need to specify "false" value
    delete def.updateOnly;
  }
  sanitizeProperty(def);
  return def;
}

function migratePropertyType(typeDef) {
  if (typeof typeDef === 'function') {
    typeDef = typeDef.name.toString();
  }

  const builtin = findBuiltinType(typeDef);
  if (builtin) typeDef = builtin;

  // TODO: handle anonymous object types (nested properties)

  return typeDef;
}

const BUILTIN_BASE_MODELS = {
  Model: 'Model',
  PersistedModel: 'Entity',
  KeyValueModel: 'KeyValueModel',
};

function migrateBaseClass(base) {
  const baseModelName = base.modelName || base.name || base;
  if (baseModelName in BUILTIN_BASE_MODELS) {
    return {
      modelBaseClass: BUILTIN_BASE_MODELS[baseModelName],
      isModelBaseBuiltin: true,
    };
  }

  return {
    modelBaseClass: baseModelName,
    isModelBaseBuiltin: false,
  };
}

function migrateModelSettings(settings = {}, inherited = {}, log) {
  // Shallow-clone the object to prevent modification of external data
  settings = {...settings};

  // "strict" mode is enabled only when explicitly requested
  // LB3 models allow additional properties by default
  settings.strict = settings.strict === true;

  // Remove settings inherited from the base model
  for (const key in inherited) {
    // Always emit the value of 'strict' setting, make it explicit
    if (key === 'strict') continue;

    if (isDeepStrictEqual(settings[key], inherited[key])) {
      delete settings[key];
    }
  }

  if (settings.forceId === 'auto') {
    // The value 'auto' is used when a parent model wants to let the child
    // model make the decision automatically, depending on whether the child
    // model has a database-generated PK.
    // See https://github.com/loopbackio/loopback-datasource-juggler/blob/15251880a1d07ccc2ca6d2dccdd065d00a7375eb/lib/model-builder.js#L347-L355
    //
    // Let's delete the flag from the generated model settings and
    // leave it up to the runtime to decide.
    delete settings.forceId;
  }

  // Notable settings that are not supported yet:
  //   relations, acls, methods, mixins, validations

  const relationNames = Object.keys(settings.relations || {});
  if (relationNames.length) {
    log(
      chalk.yellow(
        'Import of model relations is not supported yet. ' +
          'Skipping the following relations: ' +
          relationNames.join(', '),
      ),
    );
  }
  delete settings.relations;

  const unsupportedSettings = [];
  if ((settings.acls || []).length) {
    unsupportedSettings.push('acls');
  }
  delete settings.acls;

  for (const k of ['methods', 'mixins', 'validations']) {
    if (k in settings && Object.keys(settings[k]).length) {
      unsupportedSettings.push(k);
    }
    delete settings[k];
  }

  if (unsupportedSettings.length) {
    log(
      chalk.yellow(
        'Ignoring the following unsupported settings: ' +
          unsupportedSettings.join(', '),
      ),
    );
  }

  if (
    typeof settings.hiddenProperties === 'object' &&
    Object.keys(settings.hiddenProperties).length === 0
  ) {
    delete settings.hiddenProperties;
  }

  return settings;
}

function isCoreModel(modelCtor) {
  const name = modelCtor.modelName;
  return (
    name === 'Model' || name === 'PersistedModel' || name === 'KeyValueModel'
  );
}
