const express = require('express');
const app = express();
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');
const cors = require('cors');
var bodyParser = require('body-parser')
require('dotenv').config();

const { CreatePostObjectUrl, TranscodeToMP3, GetUrl, GetUncompressed , TotalSize, GetZipFile, TestGetZip} = require('./Controllers/S3Controller/S3Controller')


if (!process.env.ISSUER_BASE_URL || !process.env.AUDIENCE) {
  throw 'Make sure you have ISSUER_BASE_URL, and AUDIENCE in your .env file';
}

const corsOptions = {
  origin: '*'
};

app.use(cors(corsOptions));

const checkJwt = auth();

var jsonParser = bodyParser.json()

app.post('/api/CreatePostObjectUrl', checkJwt, jsonParser ,function (req, res) {
  console.log(req.body)
  CreatePostObjectUrl(req.body, (data, err) => {
    res.send(data)
  })
});

app.post('/api/TranscodeToMP3', checkJwt, jsonParser, function (req, res) {
  TranscodeToMP3(req.body, (data, err) => {
    res.send(data)
  })
})

app.post('/api/GetUrl', jsonParser, function(req, res) {
  GetUrl(req.body, (data, err) => {
    res.send(data)
  })
})

app.post('/api/GetUncompressed', jsonParser, function (req, res) {
  GetUncompressed(req.body, (data, err) => {
    res.send(data)
  })
})

app.post('/api/TotalSize', jsonParser, function (req, res) {
  TotalSize(req.body, (data, err) => {
    res.send(data)
  })
})

app.post('/api/GetZipFile', jsonParser, function (req, res) {
  GetZipFile(req.body, res)
})

app.get('/api/TestGetZip', jsonParser, function(req,res) {
  TestGetZip(res)
})

app.use(function (err, req, res, next) {
  console.error(err.stack);
  return res.set(err.headers).status(err.status).json({ message: err.message });
});



app.listen(3010);
console.log('Listening on http://localhost:3010');
