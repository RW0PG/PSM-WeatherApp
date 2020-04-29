
  var ui = new firebaseui.auth.AuthUI(firebase.auth())
  var uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          return true;
        },
        uiShown: function() {
          document.getElementById('loader').style.display = 'none';
        }
      },
      signInFlow: 'popup',
      signInSuccessUrl: 'index.html',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        //firebase.auth.PhoneAuthProvider.PROVIDER_ID
      ],
    };

ui.start('#firebaseui-auth-container', uiConfig);

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)

const logout = document.getElementById('btnLogout')
logout.addEventListener('click', (e) => {
  //e.preventDefault()
  firebase.auth().signOut()
  console.log("logged out")
  window.location.replace("authentication.html")
})

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    document.getElementById("btnLogout").hidden = false;
    document.getElementById("btnLogin").hidden= true;
  } else {
    document.getElementById("btnLogout").hidden = true;
    document.getElementById("btnLogin").hidden = false;
    document.getElementById("plus-button").hidden = true;
  }
})

