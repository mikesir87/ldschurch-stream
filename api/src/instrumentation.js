const { NodeSDK } = require('@opentelemetry/sdk-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { Resource } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'ldschurch-stream-api',
    [ATTR_SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  metricReader: new PrometheusExporter({
    port: 9090,
    endpoint: '/metrics',
  }),
});

sdk.start();
