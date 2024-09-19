socket = io()

const listProducts = document.getElementById('products')
const divButtons = document.getElementById('buttons')
const btnEmpty = document.createElement('button');
const finalizePurchase = document.getElementById('finalizePurchase')

finalizePurchase.addEventListener('click', () => {

    // Obtener detalles de todos los productos
    let products = [];
    document.querySelectorAll('ul li').forEach(p => {
        console.log(p.querySelector('p:nth-of-type(1)'));
        console.log(p.querySelector('p:nth-of-type(2)'));
        let name = p.querySelector('p:nth-of-type(1)').textContent;
        let price = p.querySelector('p:nth-of-type(2)').textContent;
        products.push({ name: name, price: price });
    });
    console.log(products);
    fetch('carts/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            products: products
        })
    })
        .then(response => response.text())
        .then(result => {
            alert(result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


function appendProduct(product) {
    const newProduct = document.createElement('li')
    const btnDelete = document.createElement('button');

    btnDelete.innerHTML = "Borrar";
    btnDelete.addEventListener('click', () => {
        socket.emit('deleteProductToCart', product.productId._id)

    });
    newProduct.innerHTML = `<strong>Name: </strong>${product.productId.name}, <strong>Description: </strong>${product.productId.description},
    <strong>Price: </strong>${product.productId.price}, <strong>Category: </strong>${product.productId.category}, <strong>Available: </strong>${product.productId.available}`;
    listProducts.append(newProduct)
    listProducts.append(btnDelete)
}



socket.on('productsCart', products => {
    console.log(products);
    btnEmpty.innerHTML = "Vaciar Carrito";
    for (let product = 0; product < products.length; product++) {
        const idCart = products[product];
        btnEmpty.addEventListener('click', () => {
            socket.emit('emptyCart', idCart)
        })
    }

    divButtons.append(btnEmpty);
    listProducts.innerHTML = ""

    products.forEach(product => {

        product.products.forEach(element => {
            const { productId, _id } = element
            appendProduct(element);
        });

    });


})
