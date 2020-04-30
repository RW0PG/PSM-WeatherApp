var place = 'gorzsssyce'

window.addEventListener('load', () => {
    document.querySelector('#places').innerHTML = `
        <div class="card bg-dark text-white">
            <h5 class="card-title">` + place + `</h5>
            <p class="card-text">Jakieś randomowe cardsy, trzeba by zrobic conditional rendering z reacta</p>
            <p class="card-text">Trzeba to jakoś wykminić żeby to tylko pojawiało się dopiero po dodaniu pogody</p>
        </div>
    `
})

