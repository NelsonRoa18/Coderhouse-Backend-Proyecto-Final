import { Server } from "socket.io";

import ProductManager from './dao/class/ProductManager.js'
import MessageManager from './dao/class/ChatManager.js'
import CartManager from './dao/class/CartManager.js'

import { loggerMiddleware, devLogger, prodLogger } from './loggers.js';


const productManager = new ProductManager()
const messageManager = new MessageManager()
const cartManager = new CartManager()


const logger = process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

export default function initializeSocket(httpServer) {

    const socketServer = new Server(httpServer)

    let idProductToUpdate = ""

    socketServer.on('connection', socket => {
        logger.info("Nuevo cliente conectado");


        messageManager.getChats()
            .then(chats => {
                socketServer.emit('mensaje', chats)
            })

        socket.on('addMensaje', data => {
            console.log(data);
            messageManager.addMessage(data)
                .then(() => {
                    messageManager.getChats()
                        .then(chats => {
                            socketServer.emit('mensaje', chats)
                        })
                })
        })

        productManager.getProducts()
            .then(products => {

                socketServer.emit('allProducts', products)
                socketServer.emit('addProductsRealTime', products)
            })

        socket.on('showProfile', (data) => {
            socketServer.emit('redirect', data)
        })

        socket.on('showCart', (data) => {
            socketServer.emit('redirect', data)
            cartManager.getProductsToCart(data.email)
                .then(productsCart => {
                    socketServer.emit('productsCart', productsCart)
                })
        })

        socket.on('showProducts', (data) => {
            socketServer.emit('redirect', data)
        })
        
        socket.on('dataToPaginate', (dataToPaginate) => {
            productManager.getProductsPaginate(dataToPaginate)
                .then(products => {
                    console.log(products);
                    socketServer.emit('products', products)
                })
        })
        socket.on('addProductToCart', async(data) => {
            console.log("Recibiendo producto para agregar al carrito");
            await cartManager.addProductToCart(data)
                .then(() => {
                    console.log('Mostrando carrito');
                    productManager.getProductsPaginate()
                        .then(products => {
                            socketServer.emit('products', products)
                        })
                })

        })

        socket.on('addProduct', (data) => {
            console.log("Recibiendo producto agregado");
            productManager.addProduct(data)
                .then(() => {
                    console.log("Solicitando mostrar productos");
                    productManager.getProducts()
                        .then(products => {
                            socketServer.emit('addProductsRealTime', products)
                        })
                })

        })


        socket.on('deleteProduct', (data) => {
            productManager.deleteProduct(data)
                .then(() => {
                    productManager.getProducts()
                        .then((products) => {
                            socketServer.emit('addProductsRealTime', products)
                        })
                })
        })

        socket.on('updateProductPage', (dataPage) => {
            socketServer.emit('redirect', dataPage)
            idProductToUpdate = dataPage.id
        })

        socket.on('addProductsRealTime', (dataPage) => {
            socketServer.emit('redirect', dataPage)
        })

        socket.on('updateProduct', (data) => {
            productManager.updateProduct(idProductToUpdate, data)
                .then(() => {
                    productManager.getProducts()
                        .then((products) => {
                            socketServer.emit('addProductsRealTime', products)
                        })
                })
        })

        socket.on('deleteProductToCart', (data) => {
            cartManager.deleteProductToCart(data)
                .then(() => {
                    cartManager.getProductsToCart()
                        .then(productsCart => {
                            socketServer.emit('productsCart', productsCart)
                        })
                })
        })

        socket.on('emptyCart', (data) => {
            cartManager.deleteAllProductsToCart(data)
                .then(() => {
                    cartManager.getProductsToCart()
                        .then(productsCart => {
                            socketServer.emit('productsCart', productsCart)
                        })
                })
        })


        socket.on('pageAddProduct', data => {
            socket.emit('redirect', data)
        })



    })


}