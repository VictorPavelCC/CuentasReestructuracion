const { userModel } = require('../models/user.model');
const {cartModel} =require('../models/cart.model')
const { createHash } = require('../../utils');
const passport = require('passport');

exports.renderRegister = (req, res) => {
    try {
        res.render("register.handlebars")
    } catch (error) {
        res.status(500).send("Error de render")
    }
};

exports.register = async (req, res) => {
     try {

        console.log("Usuario registrado correctamente.");
        res.redirect("/api/sessions")

    } catch (error) {
        res.status(500).send("Error de registro.")
    }
};

exports.renderLogin = (req, res) => {
    try {
        res.render("login.handlebars")
    } catch (error) {
        res.status(500).send("Error de render.")
    }
};

exports.renderProfile = (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/api/sessions');
        }

        let { first_name, last_name, email, age, rol } = req.session.user;

        res.render('profile.handlebars', {
            first_name, last_name, email, age, rol
        });

    } catch (error) {
        res.status(500).send("Error de render.")
    }
};

exports.renderRestore = (req, res) => {
    try {
        res.render('restore.handlebars')
    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (!err) {
            res.redirect('/api/sessions')
        } else {
            res.send("Error al intentar salir.")
        }
    })
};

exports.failRegister = async (req, res) => {
    console.log("Failed strategy");
    res.send({ error: "Failed" })
};

exports.login = async (req, res) => {
    if (!req.user) {
        return res.status(400).send({ status: "error", error: "Credenciales inválidas." });
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        rol: req.user.rol,
        cart: req.user.cart,
        _id: req.user._id
    };

    console.log("Datos correctos, ingresando a vista de perfil.");
    res.redirect("/api/sessions/profile");
};

exports.failLogin = (req, res) => {
    res.send({ error: "Failed login" });
};

exports.githubAuth = async (req, res) => {}

exports.githubAuthCallback = async (req, res) => {
    req.session.user = req.user;
    res.redirect("/api/sessions/profile")
}



exports.restorePassword = async (req, res) => {
    try {
        let { email, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).send({ status: "error", error: "Valores inexistentes" })

        let user = await userModel.findOne({ email: email });

        if (!user) return res.status(400).send({ status: "error", error: "Usuario no encontrado" })

        user.password = createHash(newPassword);
        await userModel.updateOne({ _id: user._id }, user);
        res.redirect("/api/sessions");

    } catch (error) {
        res.status(500).send("Error al cambiar contraseña.")
    }
};
