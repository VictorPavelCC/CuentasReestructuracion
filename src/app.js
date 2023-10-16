const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
const path = require('path')
const handlebars = require('express-handlebars')
const sessionRouter = require('./routes/sessions.router')
const cartRouter = require("./routes/carts.router")
const productRouter = require("./routes/products.router")

const passport = require('passport')
const initializePassport = require('./config/passport.config')

const app = express()
const PORT = 8080

app.engine("handlebars", handlebars.engine())
app.set("views", path.join(__dirname, 'views'))
app.set("view engine", "handlebars")


app.listen(PORT, () => {
    console.log(`Servidor is running on port ${PORT}`)
})


mongoose.connect("mongodb+srv://pavelcuentas:Tsuna_ZERO2@projectsplus.awa4d2q.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://pavelcuentas:Tsuna_ZERO2@projectsplus.awa4d2q.mongodb.net/?retryWrites=true&w=majority",
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 1000
    }),
    secret: "coderhouse",
    resave: false,
    saveUninitialized: false
}))


initializePassport();
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/sessions/", sessionRouter)
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);  