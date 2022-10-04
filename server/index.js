const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const {SanitizeMongoData , RemoveHTMLTags} = require('./middlewares/dataSantizationMiddleware')
const Main = require('./routes/main')
const Test = require('./routes/test')
const User = require('./routes/user')
const Auth = require('./routes/auth')
const Download = require('./routes/download')
const Upload = require('./routes/upload')
const limiter = require('./middlewares/rateLimiter');
/*
    Initializing express server
*/
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload()); 
app.use(limiter);

//Data sanitisation against NOSQL query injection and XSS

app.use(SanitizeMongoData); // ->check out the req.body, req.param , req.query and remove the $ and .
app.use(RemoveHTMLTags);    // -> remove the html tags from the input data


/*
    Connection to the MongoDB instance. Currently access is available to everyone for development.
*/

const dburl = process.env.MONGODB_URI;
mongoose.connect(dburl).then(() => { console.log('Connected to StorzDB') })
    .catch((err) => {
        console.log(err)
    })

const PORT = process.env.PORT || 8080;

app.use('/', Main)
app.use(Test);
app.use(User);
app.use(Upload);
app.use(Download);
app.use(Auth);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})