# Healthy Samoa Screening App

## Building the Mobile App for iOS Deployment
**this must be done on a Mac*

It is preferred, at the moment, to use the EAS (non-local) steps so the builds can be tracked through expo.dev

At this time, local build should be used as a last resort or to troubleshoot builds.

Due to the potentially extremely long waits for the EAS queue, a lead may decide to do it locally only, or it may be decided to build locally to upload but still have EAS build it to keep track of builds.

### Initial Steps
Either direction has the same initial steps:
1. Clone the [repository](https://github.com/Colbyg13/Screening-App) to local machine
2. Make sure you are in the mobile app directory. `cd mobile-app`
3. Checkout the branch (should be main) that is confirmed by devs to be built
4. Run `npm install`
5. Ensure [package.json](./package.json) has the correct version number for the release. Likely line 3
6. Ensure [info.plist](./ios/HealthySamoaScreeningApp/Info.plist) has the correct version number for the release. Likely line 22
7. Make sure [info.plist](./ios/HealthySamoaScreeningApp/Info.plist) has the correct build number. This should generally be 1 unless build fails and need to make changes to try again. Likely line 35

### EAS (non-local) steps
8. Make sure [app.json](./app.json) has the correct EAS projectID. This can be confirmed by logging into [expo.dev](https://expo.dev/accounts/uvu_wms/projects/healthy-samoa). Likely line 35
9. Run `eas build --platform ios` and follow the prompts. This will likely take a while. You can see status either from the same terminal or by viewing in the [builds section](https://expo.dev/accounts/uvu_wms/projects/healthy-samoa/builds) of expo.dev
10. Download artifacts to local machine

### EAS local steps
8. You shouldn't have to update the EAS projectID, but it won't hurt to do step 8 from above.
9. Run `eas build --platform ios --local` and follow the prompts. This will likely take a while. You can see status from the same terminal.
10. Grab the ipa file. Likely at the root of the mobile-app directory. Will be a file name `build-<some hash>.ipa`

### Final Steps
Both of the above paths have the same final steps:

11. Open Transporter App
12. Drag and drop iOS ipa artifact into Transporter
13. Submit the app to the app store for review
14. Once approved and ready for distribution on the app store, tag the built commit with the release version number. e.g. `v1.2.1`

**Make sure that iPad is the only supported device prior to submitting to the App Store for review*

## Troubleshooting
There is a good chance you will have to fight the build and troubleshoot what you can.

Follow the error logs from the terminal.

You pay need to open the project in xcode to try to get it working.

You will likely have to do some google searching to try to resolve issues. Issues could be related to incorrect files due to deprecations in current versions or packages/pods not installing correctly.

If a build cannot be completed within half a day to a day, work with the lead to reach out to the devs to resolve remaining issues.