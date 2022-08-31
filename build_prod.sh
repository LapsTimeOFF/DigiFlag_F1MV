echo 'CD...'
cd src/
echo 'CD done'
echo 'Removing old builds'
rm -rf F1MV-DigiFlag-*
echo 'Old builds removed'
echo 'Starting building...'
echo 'Building Win32x64'
npx electron-forge package --arch=x64 --platform=win32
mv out/* ../*
mv ./Can\'tBeOpenBug.sh ../
rm -rf out
echo 'Building Win32x64 completed'
echo 'Building Darwin'
npx electron-forge package --platform=darwin
echo 'Building Darwin completed'
echo "Making can't be open file"
echo "sudo spctl --master-disable" > Can\'tBeOpenBug.sh
echo "sudo chmod -R 777 /Applications/F1MV-DigiFlag.app" > Can\'tBeOpenBug.sh
echo "xattr -d com.apple.quarantine /Applications/F1MV-DigiFlag.app" > Can\'tBeOpenBug.sh
echo "xattr -cr /Applications/F1MV-DigiFlag.app" > Can\'tBeOpenBug.sh
echo "" > Can\'tBeOpenBug.sh
echo "echo 'Done.'" > Can\'tBeOpenBug.sh
echo "Making can't be open file done"
echo 'Building Linux'
npx electron-forge package --platform=linux
echo 'Building Linux completed'
echo 'Removing useless files...'
rm -rf ./F1MV-DigiFlag-darwin-arm64/LICENSE*
rm -rf ./F1MV-DigiFlag-darwin-arm64/version
echo 'Useless files removed'
echo 'Zipping files...'
zip F1MV-DigiFlag-linux-arm64.zip ./F1MV-DigiFlag-linux-arm64/*
zip F1MV-DigiFlag-win32-x64.zip ./F1MV-DigiFlag-win32-x64/*
echo 'Zippied files done'
echo 'Create Applications folder alias'
ln -s /Applications ./F1MV-DigiFlag-darwin-arm64/Applications
echo 'Create Applications folder alias done'
echo 'Create the .dmg file'
hdiutil create -srcfolder ./F1MV-DigiFlag-darwin-arm64 ./F1MV-DigiFlag-darwin-arm64.dmg
echo '.dmg file created'
echo 'Building completed'