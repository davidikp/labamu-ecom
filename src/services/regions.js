/**
 * @file regions.js
 * @description Provides fetching logic for deep Indonesian geographical entities
 * (Provinces -> Regencies/Cities -> Districts -> Villages) using the public Emsifa API.
 *
 * All functions return { data, error } — never throw or silently swallow failures.
 */

const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
};

export const fetchIndonesianProvinces = async () => {
  try {
    const res = await fetch(`${BASE_URL}/provinces.json`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return { data: data.map(d => ({ ...d, name: toTitleCase(d.name) })), error: null };
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return { data: [], error: 'Failed to load provinces. Please try again.' };
  }
};

export const fetchIndonesianCities = async (provinceId) => {
  if (!provinceId) return { data: [], error: null };
  try {
    const res = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return { data: data.map(d => ({ ...d, name: toTitleCase(d.name) })), error: null };
  } catch (error) {
    console.error('Error fetching cities:', error);
    return { data: [], error: 'Failed to load cities. Please try again.' };
  }
};

export const fetchIndonesianDistricts = async (regencyId) => {
  if (!regencyId) return { data: [], error: null };
  try {
    const res = await fetch(`${BASE_URL}/districts/${regencyId}.json`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return { data: data.map(d => ({ ...d, name: toTitleCase(d.name) })), error: null };
  } catch (error) {
    console.error('Error fetching districts:', error);
    return { data: [], error: 'Failed to load districts. Please try again.' };
  }
};

export const fetchIndonesianVillages = async (districtId) => {
  if (!districtId) return { data: [], error: null };
  try {
    const res = await fetch(`${BASE_URL}/villages/${districtId}.json`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return { data: data.map(d => ({ ...d, name: toTitleCase(d.name) })), error: null };
  } catch (error) {
    console.error('Error fetching villages:', error);
    return { data: [], error: 'Failed to load villages. Please try again.' };
  }
};

export const fetchZipCode = async (villageName, districtName) => {
  if (!villageName) return { data: null, error: null };
  try {
    const url = `https://kodepos.vercel.app/search?q=${encodeURIComponent(villageName)}`;
    const res = await fetch(url);
    if (!res.ok) return { data: null, error: 'Failed to load zip code. Please try again.' };
    const json = await res.json();

    if (json && json.data && json.data.length > 0) {
      if (districtName) {
        const match = json.data.find(d =>
          d.district && d.district.toLowerCase() === districtName.toLowerCase()
        );
        if (match && match.code) return { data: match.code.toString(), error: null };
      }
      return { data: json.data[0].code ? json.data[0].code.toString() : null, error: null };
    }
    return { data: null, error: null };
  } catch (error) {
    console.error('Error fetching zipcode:', error);
    return { data: null, error: 'Failed to load zip code. Please try again.' };
  }
};
