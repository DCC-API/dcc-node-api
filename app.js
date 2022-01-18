
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 4000
const jsonParser = bodyParser.json()

const {Service} = require('verificac19-sdk');
const validateDcc = require('./src/validate_dcc.js')
const {encrypt, decrypt} = require('./src/encryption.js')

function requireHTTPS(req, res, next) {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.use(requireHTTPS);

app.options('/encrypt', cors())
app.post('/encrypt', cors(), jsonParser, async (req, res) => {
  const { rawString } = req.body;

  try {
    let result = await encrypt(rawString);
    res.json({encryptedString: result})
  } catch (e) {
    console.error(e);
    res.status(400)
    res.json({error: "Bad request"})
  }

})

app.post('/validations', jsonParser, async (req, res) => {
  const { encryptedString, mode } = req.body;

  try {
    let decryptedString = decrypt(encryptedString);
    // console.log(decryptedString);
    let result = await validateDcc(decryptedString, mode);
    res.json({validation: result})
  } catch (e) {
    // console.error(e);
    res.status(400)
    res.json({error: "Bad request"})
  }

})

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`)
  console.log(`Updating verifica-c19 Service`)
  const updateResult = await Service.updateAll();
  console.log("Done updating");
})
