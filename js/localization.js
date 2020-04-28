function addLocation(){
    let form = document.querySelector('#locationButton');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        firebase.auth().onAuthStateChanged(user => {
            if(user) {
                db.collection("users")
                  .doc(user.uid)
                  .collection("locations")
                  .doc()
                  .set({
                        // Atributes
                }, { merge: true })
                .then(function() {
                    console.log("Document successfully written ");
                })
                .catch(function(error) {
                    console.error("Error writing document: ", error);
                });
            } else {
              console.log("User not logged in");
            }
          })
    })
}
