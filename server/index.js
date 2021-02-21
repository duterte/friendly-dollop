const express = require('express');
const modules = require('./modules');
const PORT = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');
modules.routes(express, app);
modules.logger();
app.listen(PORT, () => console.log('server is running'));
