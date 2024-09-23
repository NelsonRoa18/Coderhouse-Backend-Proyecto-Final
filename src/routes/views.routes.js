import { Router } from 'express';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';


import multer from 'multer'
import path from 'path'
import __dirname from '../utils.js'
import fs from 'fs';

import userManager from '../dao/models/user.model.js'

const router = Router();

router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login');
});

router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register');
});

router.get('/profile', isAuthenticated, (req, res) => {

    if (req.session.user.documents.length < 3) {
        res.render('profileUser', { user: req.session.user });

    }
    else {
        res.render('profileAdmin', { user: req.session.user });
    }


});


router.get('/users', async(req, res) =>{
    if (req.session.user.rol == "admin") {
        const data = await userManager.find();
        const users = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];

            if (element.rol !== "admin") {
                users.push(element)
            }
            else{
                data.splice(0,i)
            }
        }

        res.render('users', {user:req.session.user, users})
    }
    else{
        res.render('profileUser', {user: req.session.user})
    }
})

router.post('/users', async(req, res) => {
    const {id} = req.body;

    res.render('updateUsers', {user:id})
})

const secretKey = 'restore_pass';
// Ruta para mostrar el formulario de restablecimiento de contraseña
router.get('/restorepass', (req, res) => {
    const token = req.query.token;

    try {
        const decoded = jwt.verify(token, secretKey);
        if (decoded) {
            res.render('restorepass', { token });
        }
        res.render('firstrestorepass');
    } catch (err) {
        res.status(401).send('El enlace ha expirado o no es válido.');
    }
});

router.get('/firstrestorepass', (req, res) => {
    res.render('firstrestorepass')
})

const documentsDir = path.resolve(__dirname, './documents');

// Verificar si la carpeta "documents" existe, si no, crearla
if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
}

//Crear carpeta "descargas"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, documentsDir)
    },

    filename: (req, file, cb) => {

        const originalname = file.originalname
        const ext = path.extname(originalname)
        cb(null, `${originalname}`)
    }
})

const upload = multer({ storage });

router.post('/documents', upload.array('archivos'), async (req, res) => {
    try {
       
        const userEmail = req.session.user.email; // Obtén el ID del usuario desde el body de la petición


        // Estructura del objeto que se añadirá al array documents
        const documents = req.files.map(file => ({
            name_document: file.originalname,
            reference: `/documents/${file.filename}` // Ruta donde se encuentra el archivo
        }));

        // Supongamos que identificas el documento por su ID

        console.log(documents);
        // Actualizar el documento del usuario en MongoDB para añadir el nuevo archivo
        await userManager.updateOne({ email: userEmail }, { $push: { documents: { $each: documents } } })
        
        const user = await userManager.findOne({ email: userEmail })
        console.log(user.documents.length);
        if (user.documents.length < 3) {
            console.log("perfil user");
            res.render('profileUser', { user: req.session.user });
        }
        else {
            console.log("perfiladmin");
            await userManager.updateOne({ email: userEmail }, { rol: "premium" })
            res.render('profileAdmin', { user: req.session.user });
        }




    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})



export default router;