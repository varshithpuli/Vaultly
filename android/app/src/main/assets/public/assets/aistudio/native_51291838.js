import { Capacitor, registerPlugin, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { DocumentScanner } from '@capacitor-mlkit/document-scanner';
import { CapacitorPluginMlKitTextRecognition as OCR } from '@pantrist/capacitor-plugin-ml-kit-text-recognition';

const Screen = registerPlugin('Screen');
const CardNfc = registerPlugin('CardNfc');
const BioVault = registerPlugin('BioVault');
const AppIcon = registerPlugin('AppIcon');
const NotifTx = registerPlugin('NotifTx');
const AutoBackup = registerPlugin('AutoBackup');
const isNative = Capacitor.isNativePlatform();

window.CV = {
  ntx: () => NotifTx,
  async sharedText() { try { return ((await NotifTx.shared()).text) || ''; } catch (e) { return ''; } },
  onResume: f => { if (isNative) App.addListener('resume', f); },
  bkChoose: () => AutoBackup.choose(),
  async bkStatus() { try { return await AutoBackup.status(); } catch (e) { return { set: false }; } },
  bkWrite: (name, data, keep) => AutoBackup.write({ name, data, keep }),
  bkClear: () => AutoBackup.clear().catch(() => {}),
  isNative,
  onBack: f => { if (isNative) App.addListener('backButton', f); },
  minimize: () => { if (isNative) App.minimizeApp(); },
  onPause: f => { if (isNative) App.addListener('pause', f); },
  async appInfo() { try { return await App.getInfo(); } catch (e) { return null; } },
  bars: dark => { if (isNative) SystemBars.setStyle({ style: dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {}); },
  // hardware-bound biometric unlock (Android Keystore + BiometricPrompt)
  async bioAvailable() { try { return isNative && (await BioVault.available()).available; } catch (e) { return false; } },
  bioEnroll: secret => BioVault.enroll({ secret }),
  async bioUnlock() { return (await BioVault.unlock()).secret; },
  bioClear: () => BioVault.clear().catch(() => {}),
  // secure storage (used for the PIN)
  saveSecret: (k, v) => SecureStorage.setItem(k, v),
  getSecret: k => SecureStorage.getItem(k),
  delSecret: k => SecureStorage.removeItem(k),
  setSecure: secure => isNative ? Screen.setSecure({ secure }).catch(() => {}) : Promise.resolve(),
  async iconGet() { try { return (await AppIcon.get()).name; } catch (e) { return 'default'; } },
  iconSet: name => AppIcon.set({ name }),
  async nfcAvail() { try { return await CardNfc.isAvailable(); } catch (e) { return { available: false, enabled: false }; } },
  nfcRead: () => CardNfc.read(),
  nfcCancel: () => CardNfc.cancel().catch(() => {}),
  async notify(list) {
    if (!isNative) return false;
    try { const pend = await LocalNotifications.getPending(); if (pend.notifications.length) await LocalNotifications.cancel({ notifications: pend.notifications }); } catch (e) {}
    if (!list.length) return true;
    let p = await LocalNotifications.checkPermissions();
    if (p.display !== 'granted') p = await LocalNotifications.requestPermissions();
    if (p.display !== 'granted') return false;
    await LocalNotifications.schedule({ notifications: list.slice(0, 400).map((n, i) => ({ id: i + 1, title: n.title, body: n.body, schedule: { at: new Date(n.at), allowWhileIdle: true } })) });
    return true;
  },
  async scanDoc() {
    try { if (!(await DocumentScanner.isGoogleDocumentScannerModuleAvailable()).available) await DocumentScanner.installGoogleDocumentScannerModule(); } catch (e) {}
    const r = await DocumentScanner.scanDocument({ pageLimit: 1, galleryImportAllowed: true, resultFormats: 'JPEG', scannerMode: 'FULL' });
    return Promise.all((r.scannedImages || []).map(async u => (await fetch(Capacitor.convertFileSrc(u))).blob()));
  },
  async ocr(dataUrl) { const r = await OCR.detectText({ base64Image: dataUrl.split(',')[1] }); return r.text || ''; },
  async share(title, text) {
    if (isNative) return Share.share({ title, text, dialogTitle: 'Share' });
    if (navigator.share) return navigator.share({ title, text });
    throw new Error('Sharing is not available here');
  },
  async saveFile(name, text) {
    if (!isNative) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click(); return; }
    const w = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    try { await Share.share({ title: name, url: w.uri }); } finally { Filesystem.deleteFile({ path: name, directory: Directory.Cache }).catch(() => {}); }
  }
};
