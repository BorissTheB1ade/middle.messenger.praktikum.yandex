const express = require('express')
const path = require('path')

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (request, response) =>{
    response.sendFile(path.join(__dirname, 'dist', 'index.html'))
    response.status(200)
})

app.listen(3000, () =>console.log('Сервер заупщен на порту :3000'))
