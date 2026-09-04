import { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import {
  fetchIndonesianProvinces,
  fetchIndonesianCities,
  fetchIndonesianDistricts,
  fetchIndonesianVillages,
} from '../services/regions';

export default function useRegions(countryName, provinceName, cityName, districtName) {
  const [options, setOptions] = useState({
    countries:      [],
    provinces:      [],
    cities:         [],
    districts:      [],
    villages:       [],
    provincesError: null,
    citiesError:    null,
    districtsError: null,
    villagesError:  null,
  });

  // Load Countries
  useEffect(() => {
    const countries = Country.getAllCountries().map(c => ({
      id: c.name, label: c.name, isoCode: c.isoCode
    }));
    setOptions(prev => ({ ...prev, countries }));
  }, []);

  // Load Provinces/States
  useEffect(() => {
    if (!countryName) {
      setOptions(prev => ({
        ...prev,
        provinces: [], cities: [], districts: [], villages: [],
        provincesError: null, citiesError: null, districtsError: null, villagesError: null,
      }));
      return;
    }

    if (countryName === 'Indonesia') {
      fetchIndonesianProvinces().then(result => {
        setOptions(prev => ({
          ...prev,
          provinces: result.data.map(p => ({ id: p.name, label: p.name, originalId: p.id })),
          provincesError: result.error,
        }));
      });
    } else {
      const cObj = Country.getAllCountries().find(c => c.name === countryName);
      if (cObj) {
        const states = State.getStatesOfCountry(cObj.isoCode);
        setOptions(prev => ({
          ...prev,
          provinces: states.map(s => ({ id: s.name, label: s.name, isoCode: s.isoCode, countryCode: cObj.isoCode })),
          provincesError: null,
        }));
      } else {
        setOptions(prev => ({ ...prev, provinces: [], provincesError: null }));
      }
    }
  }, [countryName]);

  // Load Cities/Regencies
  useEffect(() => {
    if (!provinceName || !countryName) {
      setOptions(prev => ({
        ...prev,
        cities: [], districts: [], villages: [],
        citiesError: null, districtsError: null, villagesError: null,
      }));
      return;
    }

    if (countryName === 'Indonesia') {
      const pObj = options.provinces.find(p => p.name === provinceName || p.label === provinceName);
      if (pObj && pObj.originalId) {
        fetchIndonesianCities(pObj.originalId).then(result => {
          setOptions(prev => ({
            ...prev,
            cities: result.data.map(c => ({ id: c.name, label: c.name, originalId: c.id })),
            citiesError: result.error,
          }));
        });
      }
    } else {
      const cObj = Country.getAllCountries().find(c => c.name === countryName);
      const sObj = options.provinces.find(s => s.name === provinceName || s.label === provinceName);
      if (cObj && sObj) {
        const cities = City.getCitiesOfState(cObj.isoCode, sObj.isoCode);
        setOptions(prev => ({
          ...prev,
          cities: cities.map(city => ({ id: city.name, label: city.name })),
          citiesError: null,
        }));
      } else {
        setOptions(prev => ({ ...prev, cities: [], citiesError: null }));
      }
    }
  }, [countryName, provinceName, options.provinces]);

  // Load Districts (Only Indonesia)
  useEffect(() => {
    if (!cityName || countryName !== 'Indonesia') {
      setOptions(prev => ({
        ...prev,
        districts: [], villages: [],
        districtsError: null, villagesError: null,
      }));
      return;
    }

    const cObj = options.cities.find(c => c.name === cityName || c.label === cityName);
    if (cObj && cObj.originalId) {
      fetchIndonesianDistricts(cObj.originalId).then(result => {
        setOptions(prev => ({
          ...prev,
          districts: result.data.map(d => ({ id: d.name, label: d.name, originalId: d.id })),
          districtsError: result.error,
        }));
      });
    }
  }, [countryName, cityName, options.cities]);

  // Load Villages (Only Indonesia)
  useEffect(() => {
    if (!districtName || countryName !== 'Indonesia') {
      setOptions(prev => ({ ...prev, villages: [], villagesError: null }));
      return;
    }

    const dObj = options.districts.find(d => d.name === districtName || d.label === districtName);
    if (dObj && dObj.originalId) {
      fetchIndonesianVillages(dObj.originalId).then(result => {
        setOptions(prev => ({
          ...prev,
          villages: result.data.map(v => ({ id: v.name, label: v.name, originalId: v.id })),
          villagesError: result.error,
        }));
      });
    }
  }, [countryName, districtName, options.districts]);

  return {
    countries:      options.countries,
    provinces:      options.provinces,
    cities:         options.cities,
    districts:      options.districts,
    villages:       options.villages,
    provincesError: options.provincesError,
    citiesError:    options.citiesError,
    districtsError: options.districtsError,
    villagesError:  options.villagesError,
  };
}
