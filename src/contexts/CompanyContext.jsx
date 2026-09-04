import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCompanyInfo, syncCompanyInfo } from '../services/companyService';

const CompanyContext = createContext();

/**
 * CompanyProvider
 *
 * Fetches company data from the backend API on mount.
 * Company data is owned by Labamu Core (SSO) — the ecommerce layer only reads it.
 *
 * Exposes:
 *  - companyData       — the mapped company object (or null while loading)
 *  - isLoading         — true while the initial fetch is in progress
 *  - error             — error message string if something went wrong
 *  - refreshCompanyData — call this to re-fetch from backend
 *  - syncCompanyData   — simulates re-pull from Labamu Core SSO, updates synced_at
 *  - setCompanyData    — for manual injection during testing
 */
export function CompanyProvider({ children }) {
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCompanyInfo();
      setCompanyData(data);
    } catch (err) {
      console.error('Failed to fetch company data', err);
      setError(err.message || 'Failed to load company information');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // DEMO ONLY — simulates re-pull from Labamu Core SSO
  const syncCompanyData = useCallback(async () => {
    const data = await syncCompanyInfo();
    setCompanyData(data);
    return data;
  }, []);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  return (
    <CompanyContext.Provider
      value={{
        companyData,
        isLoading,
        error,
        setCompanyData,
        syncCompanyData,
        refreshCompanyData: fetchCompanyData,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
