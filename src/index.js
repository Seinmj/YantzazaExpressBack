const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PORT } = require("./config.js");
const userRoutes = require("./routes/user.route.js");
const addressRoutes = require("./routes/address.route.js");
const categoryRoutes = require("./routes/category.route.js");
const productRoutes = require("./routes/product.route.js");
const enterpriseRoutes = require("./routes/enterprise.route.js");
const orderRoutes = require("./routes/order.route.js");
const motoRoutes = require("./routes/motorcycle.route.js");

const corsOptions = {
    origin: '*', // Reemplaza con tu dominio permitido
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
};

const app = express();

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/Api/user', userRoutes);
app.use('/Api/categorias', categoryRoutes);
app.use('/Api/productos', productRoutes);
app.use('/Api/direcciones', addressRoutes);
app.use('/Api/tienda', enterpriseRoutes);
app.use('/Api/motocicletas', motoRoutes);
app.use('/Api/pedidos', orderRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});