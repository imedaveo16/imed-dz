import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.najdadz.app',
  appName: 'Najda DZ',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;