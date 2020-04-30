
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



