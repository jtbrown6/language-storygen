/**
 * Utility for generating and managing device IDs
 * This helps identify different devices for syncing current stories
 */

// Generate a random ID string
const generateRandomId = () => {
  return 'device_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Get the current device ID from localStorage, or create a new one
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  
  // If no device ID exists, create and save one
  if (!deviceId) {
    deviceId = generateRandomId();
    localStorage.setItem('deviceId', deviceId);
    console.log('New device ID generated:', deviceId);
  }
  
  return deviceId;
};
