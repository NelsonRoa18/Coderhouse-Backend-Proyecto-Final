import { Router } from 'express';
import passport from 'passport';

import dotenv from 'dotenv';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import moment from 'moment';

import userManager from '../../dao/models/user.model.js'
import { createHash, isValidPassword } from '../../utils.js';


const router = Router();

dotenv.config()

router.post('/register', passport.authenticate('register', { failureRedirect: 'failregister' }), async (req, res) => {
  res.redirect('/login');
});

router.get('/failregister', async (req, res) => {
  req.logger.info("Estrategia fallida")
  res.send({ error: "Falló" })
})

router.post('/login', passport.authenticate('login', { failureRedirect: 'faillogin' }), async (req, res) => {
  if (!req.user) return res.status(400).send({ status: "error", error: "Datos incompletos" })
  try {
    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      cart: req.user.cart,
      rol: req.user.rol,
      documents: req.user.documents,
      last_connection: req.user.last_connection
    };
    console.log(req.session.user)
    res.redirect('/products');

  } catch (err) {
    res.status(500).send('Error al iniciar sesión');
  }
});


router.get('/faillogin', (req, res) => {
  req.logger.error('Login fallido')
  res.send({ error: "Login fallido" })
})

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Error al cerrar sesión');
    res.redirect('/login');
  });
});

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { })


router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
  req.session.user = req.user
  res.redirect("/")
})

/* 
router.post('/restorepass', passport.authenticate('restorepass', { failureRedirect: '/failrestore' }), async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ status: "error", error: "Datos incompletos" });
    try {
        console.log(`Email: ${email}, Password: ${password}`);
        res.redirect('/profile');
    } catch (err) {
        res.status(500).send('Error al cambiar contraseña');
    }
});
 */
// Configurar el transportador de Nodemailer
const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS
  }
})
const secretKey = 'restore_pass';

// Ruta para enviar el enlace de restablecimiento de contraseña
router.post('/firstrestorepass', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send({ status: "error", error: "Email es requerido" });

  try {

    const expirationTime = moment().add(1, 'hour').unix(); // Link válido por 1 hora
    const token = jwt.sign({ email, exp: expirationTime }, secretKey);

    const resetLink = `${req.protocol}://${req.get('host')}/restorepass?token=${token}`;

    const mailOptions = {
      from: 'tettitto@gmail.com',
      to: email,
      subject: 'Restablecer Contraseña',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`
    };

    await transport.sendMail(mailOptions);

    res.send({ message: 'Correo electrónico enviado' });
  } catch (error) {
    res.status(500).send({ message: 'Error al enviar el correo electrónico' });
  }
});




// Ruta para manejar el restablecimiento de contraseña
router.post('/restorepass', async (req, res) => {

  const { token, password } = req.body;

  if (!token || !password) return res.status(400).send({ status: "error", error: "Datos incompletos" });

  try {
    const decoded = jwt.verify(token, secretKey);

    const email = decoded.email;

    const user = await userManager.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado' })
    }
    if ((isValidPassword(user, password))) {
      return res.render('restorepass', { token, error: 'No puede colocar la ultima constraseña existente' })
    }
    
    const newPassword = createHash(password) //Hasheamos la password

    await userManager.updateOne({ email: email }, { password: newPassword })

    res.send({ message: 'Contraseña restablecida con éxito' });
  } catch (err) {
    res.status(401).send({ message: 'El enlace ha expirado o no es válido.' });
  }
});


router.get('/failrestore', (req, res) => {
  res.send({ error: "Restauracion fallida" })
})

export default router;