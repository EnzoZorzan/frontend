import Keycloak from 'keycloak-js';
import { useState, useEffect } from 'react';

export const keycloak = new Keycloak({
  url: 'http://localhost:8081',
  realm: 'platform',
  clientId: 'platform-frontend',
});

export const useAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({ onLoad: 'login-required' }).then(auth => {
      setAuthenticated(auth);
    });
  }, []);

  return { keycloak, authenticated };
};
