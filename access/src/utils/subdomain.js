export const extractSubdomain = () => {
  const hostname = window.location.hostname;

  // Extract subdomain from hostname
  // test-unit.traefik.me → test-unit
  if (hostname.includes('.traefik.me')) {
    return hostname.split('.traefik.me')[0];
  }

  // Production: test-unit.ldschurch.stream → test-unit
  if (hostname.includes('.ldschurch.stream')) {
    return hostname.split('.ldschurch.stream')[0];
  }

  return null;
};
