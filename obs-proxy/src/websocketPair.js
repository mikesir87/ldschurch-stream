import { connectedClients, messagesForwarded } from './metrics.js';
import logger from './utils/logger.js';

export class WebSocketPair {
  constructor(accessCode, obsSocket) {
    this.accessCode = accessCode;
    this.controllerSocket = null;
    this.hasConnectedDownstreamObsSocket = false;
    this.setObsSocket(obsSocket);
  }

  setObsSocket(obsSocket) {
    logger.info('OBS socket connected', { accessCode: this.accessCode });
    this.obsSocket = obsSocket;
    this.#setupObsSocket();
  }

  setControllerSocket(controllerSocket) {
    logger.info('Controller socket connected', { accessCode: this.accessCode });
    this.controllerSocket = controllerSocket;
    this.#setupControllerSocket();
  }

  #setupObsSocket() {
    this.obsSocket.on('close', () => {
      logger.info('OBS socket closed', { accessCode: this.accessCode });
      connectedClients.add(-1, { type: 'obs' });
      if (this.controllerSocket) {
        this.controllerSocket.close();
      }
      this.obsSocket = null;
    });
  }

  #setupControllerSocket() {
    this.controllerSocket.on('error', error => {
      logger.error('Controller socket error', {
        accessCode: this.accessCode,
        error: error.message,
      });
    });

    this.obsSocket.send('CONNECT');

    this.obsSocket.on('message', data => {
      const message = data.toString();
      logger.debug('Message from OBS socket', {
        accessCode: this.accessCode,
        messagePreview: message.substring(0, 100),
      });

      if (message === 'CONNECTED') {
        logger.info('OBS connected downstream', { accessCode: this.accessCode });
        this.hasConnectedDownstreamObsSocket = true;
        return;
      }

      messagesForwarded.add(1, { direction: 'obs_to_controller' });
      this.controllerSocket.send(data.toString());
    });

    this.controllerSocket.on('message', data => {
      messagesForwarded.add(1, { direction: 'controller_to_obs' });
      this.obsSocket.send(data.toString());
    });

    this.controllerSocket.on('close', () => {
      logger.info('Controller socket closed', { accessCode: this.accessCode });
      connectedClients.add(-1, { type: 'controller' });
      this.controllerSocket = null;
    });
  }
}
