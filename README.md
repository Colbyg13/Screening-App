# Screening-App

This repository is to hold and maintain all code related to the UVU Screening App.
This app is being used for our 2022 UVU Capstone Project.
If you are developing on this project here is a quick guide to get you started.

Clone this repository to your computer.
Open the project in VSCode or your preferred editor.

## Starting the application for development testing.

Make sure you have NodeJS installed. https://nodejs.org/en/download/
As well as a local MongoDB https://www.mongodb.com/try/download/community

### Project

This project uses prettier and eslint extensions. Make sure to have both of them installed and do an `npm install` on the root level to keep the formatting consistent.

### Server/Desktop Application:

`Open a terminal and run 'cd server-application'. Then type 'npm i' to install dependencies. After which you can run 'npm start'`

`To build the app make sure to cd server-application and run npm run publish. The publish puts the executable in an Amazon S3 bucket. Make sure to define AWS_ACCESS_KEY and AWS_SECRET_KEY within your .env file (see .env-example)`

### Mobile/iPad Application:

`Open a terminal and run 'cd mobile-app'. Then type 'npm i' to install dependencies. After which you can run 'npm start'`

## To Test the App Download the Expo Go App from the app store.

`The mobile application terminal will display a QR code that will open the app on your device.`
`The server desktop application will automatically open on your computer when you run the npm run dev command.`

## Local Production

To run production locally run `npm run prod`
