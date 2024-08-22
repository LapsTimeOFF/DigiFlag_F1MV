const {notarize} = require('electron-notarize');

module.exports = async (context) => {
    if (process.platform !== 'darwin') return;

    console.log('aftersign hook triggered, start to notarize app.');

    if (!process.env.CI) {
        console.log(`skipping notarizing, not in CI.`);
        return;
    }

    if (!('APPLE_ID' in process.env && 'APPLE_APP_SPECIFIC_PASSWORD' in process.env)) {
        console.warn('skipping notarizing, APPLE_ID and APPLE_APP_SPECIFIC_PASSWORD env variables must be set.');
        return;
    }

    const appId = 'com.DigiFlagTeam.DigiFlag-F1MV';

    const {appOutDir} = context;

    const appName = context.packager.appInfo.productFilename;

    try {
        await notarize({
            tool: 'notarytool',
            teamId: process.env.APPLE_TEAM_ID,
            appBundleId: appId,
            appPath: `${appOutDir}/${appName}.app`,
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
        });
    } catch (error) {
        console.error(error);
    }

    console.log(`done notarizing ${appId}.`);
};
