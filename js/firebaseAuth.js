//login
function login() {
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
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
}


var btnLogout = document.getElementById('btnLogout')
btnLogout.addEventListener('click', e => {
  firebase.auth().signOut()
  alert('succesfully signed out')
  window.location.replace("authentication.html")
})

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    document.getElementById("btnLogout").disabled = false;
    document.getElementById("btnLogin").disabled = true;
  } else {
    document.getElementById("btnLogout").disabled = true;
    document.getElementById("btnLogin").disabled = false;
  }
})





