import { USE_MOCK_DATA_FOR_READS, getApiUrl } from '../config/apiConfig';
import { mockSettings } from '../utils/comprehensiveMockData';
import { getToken } from './localStorageService';

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getSettings = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    await mockDelay();
    const storedSettings = localStorage.getItem('user_settings');
    return {
      data: { result: storedSettings ? JSON.parse(storedSettings) : mockSettings },
      status: 200,
    };
  }

  const response = await fetch(getApiUrl('/settings'), {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  return { data: await response.json(), status: response.status };
};

export const updateSettings = async (section, settingsData) => {
  await mockDelay(400);
  
  const currentSettings = JSON.parse(localStorage.getItem('user_settings') || JSON.stringify(mockSettings));
  const updatedSettings = {
    ...currentSettings,
    [section]: { ...currentSettings[section], ...settingsData },
  };
  localStorage.setItem('user_settings', JSON.stringify(updatedSettings));

  const response = await fetch(getApiUrl(`/settings/${section}`), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settingsData),
  });

  return { data: await response.json(), status: response.status };
};

export const changePassword = async (currentPassword, newPassword) => {
  await mockDelay(400);
  
  localStorage.setItem('password_changed_at', Date.now().toString());

  const response = await fetch(getApiUrl('/settings/password'), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  return { data: await response.json(), status: response.status };
};

export const deleteAccount = async () => {
  await mockDelay(400);
  
  localStorage.setItem('account_deletion_requested', Date.now().toString());

  const response = await fetch(getApiUrl('/settings/account'), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  return { data: await response.json(), status: response.status };
};
