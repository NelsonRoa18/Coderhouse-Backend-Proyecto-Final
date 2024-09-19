socket = io()

const btnShowProduct = document.getElementById("showProducts")

btnShowProduct.addEventListener('click', () => {

    socket.emit('showProducts',{url:'/products'})
})
socket.on('redirect', (data) => {
    console.log(data);
    window.location.href = data.url;
}) 