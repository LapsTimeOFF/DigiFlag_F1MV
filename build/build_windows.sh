echo 'Removing old builds'
rm -rf build/F1MV-DigiFlag-*
echo 'Old builds removed'
echo 'Building .ts file...'
tsc
echo 'Building .ts file done'
echo 'Starting building...'
echo 'Building Win32x64'
electron-packager ./ F1MV-DigiFlag --platform=win32 --arch=x64 --icon=icon.ico
echo 'Building Win32x64 completed'
echo 'Zipping files...'
zip F1MV-DigiFlag-win32-x64.zip ./F1MV-DigiFlag-win32-x64/* -r
echo 'Zippied files done'
mv F1MV-DigiFlag-* build/