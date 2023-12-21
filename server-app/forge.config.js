require('dotenv').config();
module.exports = {
    packagerConfig: {
        shortcuts: {
            name: 'Healthy Samoa',
            icon: './icons/icon',
        },
    },
    rebuildConfig: {},
    config: {
        forge: {
            packagerConfig: {
                icon: './icons/icon',
            },
            shortcuts: {
                name: 'Healthy Samoa',
                icon: './icons/icon',
            },
        },
    },
    publishers: [
        {
            name: '@electron-forge/publisher-s3',
            config: {
                bucket: 'healthy-samoa-release',
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
                public: true,
            },
        },
    ],
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                // An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
                iconUrl: 'https://healthy-samoa-icon.s3.amazonaws.com/icon.ico',
                // The ICO file to use as the icon for the generated Setup.exe
                setupIcon: './icons/icon.ico',
            },
        },
        {
            // Path to the icon to use for the app in the DMG window
            name: '@electron-forge/maker-dmg',
            config: {
                icon: './icons/icon.icns',
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin', 'linux'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    icon: './icons/icon.png',
                },
            },
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-webpack',
            config: {
                mainConfig: './webpack.main.config.js',
                devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
                renderer: {
                    config: './webpack.renderer.config.js',
                    entryPoints: [
                        {
                            html: './src/index.html',
                            js: './src/renderer.js',
                            name: 'main_window',
                            preload: {
                                js: './src/preload.js',
                            },
                        },
                    ],
                },
            },
        },
    ],
};
