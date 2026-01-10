(function () {
  const proxyConnectionStatus = document.getElementById('proxy-connection-status');
  const obsConnectionStatus = document.getElementById('obs-connection-status');
  const accessCodeDisplay = document.getElementById('access-code');
  const accessCode = accessCodeDisplay.textContent.trim();

  let proxySocket = new WebSocket(window.location.href.replace(/^http/, 'ws'));
  let obsSocket;

  proxySocket.onopen = function () {
    proxyConnectionStatus.textContent = 'Connected';
    proxyConnectionStatus.className = 'badge bg-success';
  };

  proxySocket.onclose = function () {
    proxyConnectionStatus.textContent = 'Disconnected';
    proxyConnectionStatus.className = 'badge bg-danger';
    if (obsSocket) {
      obsSocket.close();
    }
    proxySocket = null;
  };

  proxySocket.onmessage = function (event) {
    const data = event.data;
    if (data === 'CONNECT') {
      connectObsSocket();
      proxyConnectionStatus.textContent = 'Connected';
      proxyConnectionStatus.className = 'badge bg-success';
    } else if (obsSocket) {
      obsSocket.send(data);
    }
  };

  function connectObsSocket() {
    obsSocket = new WebSocket('ws://localhost:4455');

    obsSocket.onopen = function () {
      // Connected to OBS WebSocket
      obsConnectionStatus.textContent = 'Connected';
      obsConnectionStatus.className = 'badge bg-success';
      accessCodeDisplay.textContent = '****-****';
      proxySocket.send('CONNECTED');
    };

    obsSocket.onclose = function () {
      // Disconnected from OBS WebSocket
      obsConnectionStatus.textContent = 'Disconnected';
      obsConnectionStatus.className = 'badge bg-danger';
      accessCodeDisplay.textContent = accessCode;

      if (proxySocket) {
        proxySocket.close();
      }
      obsSocket = null;
    };

    obsSocket.onmessage = function (event) {
      const data = event.data;
      proxySocket.send(data);
    };
  }

  // Copy access code function
  window.copyAccessCode = function () {
    const accessCode = document.getElementById('access-code').textContent.trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(accessCode).then(() => {
        showCopySuccess();
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = accessCode;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showCopySuccess();
      } catch (err) {
        // Failed to copy access code
      }
      document.body.removeChild(textArea);
    }
  };

  function showCopySuccess() {
    const button = document.querySelector('button[onclick="copyAccessCode()"]');
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="bi bi-check me-1"></i>Copied!';
    button.classList.remove('btn-outline-primary');
    button.classList.add('btn-success');

    setTimeout(() => {
      button.innerHTML = originalContent;
      button.classList.remove('btn-success');
      button.classList.add('btn-outline-primary');
    }, 2000);
  }
})();
