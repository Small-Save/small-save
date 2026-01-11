import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'smallSave',
  webDir: 'dist',
  server: {
    // TODO: Remove these setting for Production
    url: 'http://10.0.2.2:3000',
    cleartext: true, // Allow HTTP traffic
    androidScheme: 'http' // Use HTTP instead of HTTPS
  }
};

export default config;
