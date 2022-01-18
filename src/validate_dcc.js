const {Certificate, Validator} = require('verificac19-sdk');

const validateDcc = async function(rawString, mode){
  let result = {};
  let validatorMode = Validator.mode[mode] || Validator.mode.NORMAL_DGP;

  try {
    const dcc = await Certificate.fromRaw(rawString);
    const validation = await Validator.validate(dcc, validatorMode);
    // Add validation mode to response
    validation.mode = validatorMode;
    result = validation;
  } catch (e) {
    console.error(e);
    result = false;
  }

  return result;
}

module.exports = validateDcc;
