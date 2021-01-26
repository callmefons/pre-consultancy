const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')

const indexRouter = require('./routes/index');
const intentRouter = require('./routes/intent');

// Set up the express app
const app = express();
app.use(cors())

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// View engine setup.
app.use(express.static(__dirname + '/frontend/dist'));

app.use('/', indexRouter);
app.use('/api/v1/intent', intentRouter);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});