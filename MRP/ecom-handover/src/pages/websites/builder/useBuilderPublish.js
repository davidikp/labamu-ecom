import { useState, useCallback } from 'react';

export function useBuilderPublish() {
  const [subdomain, setSubdomain] = useState('');
  const [domainStatus, setDomainStatus] = useState(null);
  const [customDomain, setCustomDomain] = useState('');

  const handleCheckDomain = useCallback(() => {
    setDomainStatus(subdomain.length > 2 ? 'available' : 'unavailable');
  }, [subdomain]);

  const handleSubdomainChange = useCallback((value) => {
    setSubdomain(value);
    setDomainStatus(null);
  }, []);

  return {
    subdomain,
    domainStatus,
    customDomain,
    setCustomDomain,
    handleSubdomainChange,
    handleCheckDomain,
  };
}
