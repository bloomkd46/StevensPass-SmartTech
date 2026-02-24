import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { browserTracingIntegration, feedbackIntegration, init, replayIntegration } from '@sentry/angular';
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';


const development = isDevMode();
init({
  dsn: "https://51751bdfbfcf7b67fabd22bd0121e7da@o4510905152045056.ingest.us.sentry.io/4510905155387392",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/angular/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  integrations: [
    // Registers and configures the Tracing integration,
    // which automatically instruments your application to monitor its
    // performance, including custom Angular routing instrumentation
    browserTracingIntegration(),

    // Registers the Replay integration,
    // which automatically captures Session Replays
    replayIntegration(
      {
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: false,
      }
    ),
    feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: 'system',
    })
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,
  // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  //tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
  replaysSessionSampleRate: 0,//0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: development ? 'development' : 'production',
  debug: development,
  beforeSend: event => development ? null : event
});

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAik-xTp_Wpbf7qL70Hh__A_4LBT8z7cuY",
  authDomain: "stevenspass-smarttech.firebaseapp.com",
  projectId: "stevenspass-smarttech",
  storageBucket: "stevenspass-smarttech.firebasestorage.app",
  messagingSenderId: "203127262310",
  appId: "1:203127262310:web:b0b1cd7c8f968ede3f31a7",
  measurementId: "G-QZCZ4BPBWS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
