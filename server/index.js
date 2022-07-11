const express = require('express');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Welcome to Storz API v1.0!');
});


app.listen(8080, () => {
    console.log('Server is running on port 8080');
})