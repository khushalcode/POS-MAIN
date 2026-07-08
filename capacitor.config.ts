import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.servingsync.pos',
  appName: 'ServingSyncPOS',
  webDir: 'www',
  server: {
    url: 'https://thuso0.vercel.app',
    cleartext: false
  }
};

export default config;
