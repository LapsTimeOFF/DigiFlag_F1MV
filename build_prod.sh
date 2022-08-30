echo 'Starting building...'
echo 'Building Win32x64'
electron-packager . F1MV-DigiFlag --platform=win32 --arch=x64
echo 'Building Win32x64 completed'
echo 'Building Darwin'
electron-packager . F1MV-DigiFlag --platform=darwin
echo 'Building Darwin completed'
echo 'Building Linux'
electron-packager . F1MV-DigiFlag --platform=linux
echo 'Building Linux completed'
echo 'Building completed'