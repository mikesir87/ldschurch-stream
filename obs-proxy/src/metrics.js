import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('obs-proxy', '1.0.0');

// Metrics
export const connectedClients = meter.createUpDownCounter('obs_proxy_connected_clients_total', {
  description: 'Number of currently connected clients',
});

export const connectionAttempts = meter.createCounter('obs_proxy_connection_attempts_total', {
  description: 'Total number of connection attempts',
});

export const messagesForwarded = meter.createCounter('obs_proxy_messages_forwarded_total', {
  description: 'Total number of messages forwarded',
});
