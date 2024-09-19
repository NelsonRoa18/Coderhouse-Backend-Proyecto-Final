import { Router } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import CartManager from '../dao/class/CartManager.js';

const cartManager = new CartManager()
const router = Router()

dotenv.config()

router.get('/', async (req, res) => {
    try {
        const email = req.session.user.email;
        const data = await cartManager.getProductsToCart(email);
        console.log(data);

        let products = [];
        if (data && data.cart.length > 0) {
            //let cart = data.cart[0];
            let cantOfProducts = data.cart.length

            for (let index = 0; index < cantOfProducts; index++) {
                let cart = data.cart[index];
                if (cart.cartId && cart.cartId.products) {
                    //products = cart.cartId.products;
                    products.push(cart.cartId.products[0].productId)
                }

            }

        }
        console.log(products);
        // Renderiza la vista 'carts' con los datos obtenidos
        res.render('carts', { userEmail: email, products });
    } catch (error) {
        console.error('Error al obtener los productos del carrito:', error);
        res.status(500).send('Error al obtener los productos del carrito');
    }
});

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS
    }
})

router.post('/send-email', async (req, res) => {
    try {
        // Extraer los detalles de los productos del cuerpo de la solicitud
        const products = req.body.products;
        console.log(products);
        // Construir el contenido del correo con los detalles de los productos
        let mailContent = '<h3>Detalles del Carrito de Compras</h3>';
        products.forEach((product, index) => {
            mailContent += `
            <p><strong>Producto ${index + 1}:</strong></p>
            <ul>
                <li><strong>Nombre:</strong> ${product.name}</li>
                <li><strong>Precio:</strong> ${product.price}</li>
            </ul>
            <br>
        `;
        });

        // Configurar detalles del correo
        let mailOptions = {
            from: "tettitto@gmail.com",
            to: "tete18_15@hotmail.com",
            subject: "Test de correo preentrega nº 3",
            html: mailContent
        };

        // Enviar el correo electrónico
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).send('Error al enviar el correo');
            } else {
                console.log('Correo enviado: ' + info.response);
                res.send('Correo enviado correctamente');
            }
        });
        res.send({ status: "success", result: "Correo enviado" })
    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).send('Error al enviar correo ');
    }

})

export default router;