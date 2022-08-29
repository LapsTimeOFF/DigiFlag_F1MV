echo 'Building...'
tsc
echo 'Done.'
echo 'Starting electron...'
electron main.js
echo 'Electron closed'