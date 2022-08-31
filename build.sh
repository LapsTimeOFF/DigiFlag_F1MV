echo 'Building...'
rm -rf F1MV-DigiFlag-*
tsc
echo 'Done.'
echo 'Starting electron...'
electron main.js
echo 'Electron closed'