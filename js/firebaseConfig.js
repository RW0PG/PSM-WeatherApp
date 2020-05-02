var firebaseConfig = {
  apiKey: "AIzaSyCLvpxS3gUoKuEw_0E5D8LEDHvpYN_Jbh0",
  authDomain: "http://psm-weatherapp.firebaseapp.com/",
  databaseURL: "https://psm-weatherapp.firebaseio.com/",
  projectId: "psm-weatherapp",
  storageBucket: "http://psm-weatherapp.appspot.com/",
  messagingSenderId: "58715636644",
  appId: "1:58715636644:web:42ad8ecd6cbe0288843731"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


  
