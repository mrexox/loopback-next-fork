// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Component,
  config,
  ContextTags,
  CoreBindings,
  createBindingFromClass,
  inject,
  injectable,
} from '@loopback/core';
import {register} from 'prom-client';
import {metricsControllerFactory} from './controllers';
import {MetricsInterceptor} from './interceptors';
import {MetricsBindings} from './keys';
import {MetricsObserver, MetricsPushObserver} from './observers';
import {DEFAULT_METRICS_OPTIONS, MetricsConfig, MetricsOptions} from './types';

/**
 * A component providing metrics for Prometheus
 */
@injectable({tags: {[ContextTags.KEY]: MetricsBindings.COMPONENT}})
export class MetricsComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    metricsConfig: MetricsConfig = {},
  ) {
    const options: MetricsOptions = {
      ...DEFAULT_METRICS_OPTIONS,
      ...metricsConfig,
    };
    if (options.defaultMetrics && !options.defaultMetrics.disabled) {
      this.application.lifeCycleObserver(MetricsObserver);
    }
    if (options.pushGateway && !options.pushGateway.disabled) {
      this.application.lifeCycleObserver(MetricsPushObserver);
    }
    this.application.add(createBindingFromClass(MetricsInterceptor));
    if (options.endpoint && !options.endpoint.disabled) {
      this.application.controller(metricsControllerFactory(options));
    }
    if (options.defaultLabels) {
      register.setDefaultLabels(options.defaultLabels);
    }
  }
}
