socket = io()

const btnAddProduct = document.getElementById("addProducts")

btnAddProduct.addEventListener('click', () => {

    socket.emit('pageAddProduct',{url:'/products/addproducts'})
})
socket.on('redirect', (data) => {
    console.log(data);
    window.location.href = data.url;
}) 

const btnShowProduct = document.getElementById("showProducts")

btnShowProduct.addEventListener('click', () => {

    socket.emit('showProducts',{url:'/products'})
})
socket.on('redirect', (data) => {
    console.log(data);
    window.location.href = data.url;
}) 