echo 'Removing old builds'
rm -rf build/F1MV-DigiFlag-*
echo 'Old builds removed'
echo 'Building .ts file...'
tsc
echo 'Building .ts file done'
echo 'Starting building...'
echo 'Building Linux'
electron-packager ./ F1MV-DigiFlag --platform=linux --icon=icon.png --arch=arm64
electron-packager ./ F1MV-DigiFlag --platform=linux --icon=icon.png --arch=x64
echo 'Zipping files...'
zip F1MV-DigiFlag-linux-arm64.zip ./F1MV-DigiFlag-linux-arm64/* -r
zip F1MV-DigiFlag-linux-x64.zip ./F1MV-DigiFlag-linux-x64/* -r
echo 'Zippied files done'
mv F1MV-DigiFlag-* build/