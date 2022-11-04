echo 'Removing old builds'
rm -rf build/F1MV-DigiFlag-*
echo 'Old builds removed'
echo 'Building .ts file...'
tsc
echo 'Building .ts file done'
echo 'Starting building...'
echo 'Building Darwin'
electron-packager ./ F1MV-DigiFlag --platform=darwin --icon=icon.icns --arch=arm64
electron-packager ./ F1MV-DigiFlag --platform=darwin --icon=icon.icns --arch=x64
echo 'Create Applications folder alias'
ln -s /Applications ./F1MV-DigiFlag-darwin-arm64/Applications
ln -s /Applications ./F1MV-DigiFlag-darwin-x64/Applications
echo 'Create Applications folder alias done'
echo 'Create the .dmg file'
hdiutil create -srcfolder ./F1MV-DigiFlag-darwin-arm64 ./F1MV-DigiFlag-darwin-arm64.dmg
hdiutil create -srcfolder ./F1MV-DigiFlag-darwin-x64 ./F1MV-DigiFlag-darwin-x64.dmg
echo '.dmg file created'
mv F1MV-DigiFlag-* build/