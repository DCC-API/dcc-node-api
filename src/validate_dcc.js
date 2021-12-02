const {Certificate, Validator} = require('verificac19-sdk');

const validateDcc = async function(rawString){
  let result = {};

  try {
    const dcc = await Certificate.fromRaw(rawString);
    const validation = await Validator.validate(dcc);
    result = validation;
  } catch (e) {
    console.error(e);
    result = false;
  }

  return result;
}

module.exports = validateDcc;
