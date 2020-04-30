/*var firebaseConfig = {
    apiKey: "api-key",
    authDomain: "project-id.firebaseapp.com",
    databaseURL: "https://project-id.firebaseio.com",
    projectId: "project-id",
    storageBucket: "project-id.appspot.com",
    messagingSenderId: "sender-id",
    appId: "app-id",
    measurementId: "G-measurement-id",
  };
  firebase.initializeApp(firebaseConfig);
  */
 var firebaseConfig = {
  apiKey: "AIzaSyAl-T1L3An94FNoOfcK1sROo1kyXZZFX38",
  authDomain: "psm-weatherapp.firebaseapp.com",
  databaseURL: "https://psm-weatherapp.firebaseio.com/",
  projectId: "psm-weatherapp",
  storageBucket: "psm-weatherapp.appspot.com",
  messagingSenderId: "58715636644",
  appId: "1:58715636644:web:42ad8ecd6cbe0288843731"
}
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();


  
