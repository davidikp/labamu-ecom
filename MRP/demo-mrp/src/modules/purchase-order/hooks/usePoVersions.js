import { useState, useMemo, useEffect } from "react";

export const usePoVersions = ({ basePoData = {} } = {}) => {
  const versions = useMemo(() => basePoData?.versions || [], [basePoData]);
  
  const latestVersionNum = useMemo(() => 
    basePoData?.currentVersion || (versions.length > 0 ? versions.length : 1),
    [basePoData, versions]
  );

  const [selectedVersionNum, setSelectedVersionNum] = useState(null);
  const [isVersionMenuOpen, setIsVersionMenuOpen] = useState(false);

  const displayVersionNum = useMemo(() => 
    selectedVersionNum || latestVersionNum,
    [selectedVersionNum, latestVersionNum]
  );

  const isHistoricalVersion = useMemo(() => 
    versions.length > 0 && displayVersionNum < latestVersionNum,
    [versions.length, displayVersionNum, latestVersionNum]
  );

  const displayData = useMemo(() => {
    if (!isHistoricalVersion) return basePoData;
    const versionEntry = versions.find((v) => v.version === displayVersionNum);
    return versionEntry ? versionEntry.data : basePoData;
  }, [isHistoricalVersion, displayVersionNum, versions, basePoData]);

  // Reset selected version if base data changes significantly (e.g. new PO)
  useEffect(() => {
    setSelectedVersionNum(null);
  }, [basePoData?.poNumber]);

  const handleVersionChange = (versionNum) => {
    setSelectedVersionNum(versionNum);
    setIsVersionMenuOpen(false);
  };

  return {
    versions,
    latestVersionNum,
    selectedVersionNum,
    setSelectedVersionNum,
    isVersionMenuOpen,
    setIsVersionMenuOpen,
    displayVersionNum,
    isHistoricalVersion,
    displayData,
    handleVersionChange,
  };
};
