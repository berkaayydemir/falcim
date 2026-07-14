// Metro yapılandırması — Expo varsayılanını genişletir.
// android/ ve ios/ (native prebuild çıktıları) Metro'nun dosya-izleyicisi
// tarafından izlenmez; böylece `expo run:android` derlemesi sırasında
// Windows'ta dosya-kilit çakışması ("Could not move temporary workspace") oluşmaz.
const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = exclusionList([
  /.*\/android\/.*/,
  /.*\/ios\/.*/,
]);

module.exports = config;
