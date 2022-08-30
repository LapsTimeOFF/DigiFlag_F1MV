echo 'Removing old builds'
rm -rf F1MV-DigiFlag-*
echo 'Old builds removed'
echo 'Starting building...'
echo 'Building Win32x64'
electron-packager . F1MV-DigiFlag --platform=win32 --arch=ia32
echo 'Building Win32x64 completed'
echo 'Building Darwin'
electron-packager . F1MV-DigiFlag --platform=darwin
echo 'Building Darwin completed'
echo 'Building Linux'
electron-packager . F1MV-DigiFlag --platform=linux
echo 'Building Linux completed'
echo 'Removing useless files...'
rm -rf ./F1MV-DigiFlag-darwin-arm64/LICENSE*
rm -rf ./F1MV-DigiFlag-darwin-arm64/version
echo 'Useless files removed'
echo 'Zipping files...'
zip F1MV-DigiFlag-linux-arm64.zip ./F1MV-DigiFlag-linux-arm64/*
zip F1MV-DigiFlag-win32-ia32.zip ./F1MV-DigiFlag-win32-ia32/*
echo 'Zippied files done'
echo 'Create Applications folder alias'
ln -s /Applications ./F1MV-DigiFlag-darwin-arm64/Applications
echo 'Create Applications folder alias done'
echo 'Create the .dmg file'
hdiutil create -srcfolder ./F1MV-DigiFlag-darwin-arm64 ./F1MV-DigiFlag-darwin-arm64.dmg
echo '.dmg file created'
echo 'Building completed'