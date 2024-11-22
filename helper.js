import express from "express";

function isValidEmail(email, varName) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) throw `Error: ${varName} cannot be empty`;
  if (typeof email !== "string")
    throw `Error: ${varName} needs to be of valid type`;

  email = email.trim();
  if (email.length === 0)
    throw `Error: ${varName} cannot be an empty string or string with just spaces`;

  // Throw an error if email does not match the regex
  if (!emailRegex.test(email)) {
    throw `Error: ${email} is not a valid ${varName}`;
  }
  return email;
}

function isValidPhoneNumber(phone, varName) {
  const phoneRegex = /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/;
  if (!phone) throw `Error: ${varName} cannot be empty`;
  if (typeof phone !== "string")
    throw `Error: ${varName} needs to be of valid type`;

  phone = phone.trim();
  if (phone.length === 0)
    throw `Error: ${varName} cannot be an empty string or string with just spaces`;

  // Throw an error if phone does not match the regex
  if (!phoneRegex.test(phone)) {
    throw `Error: ${phone} is not a valid ${varName}`;
  }
  return phone;
}

function checkString(strVal, varName) {
  if (!strVal) throw `Error: You must supply a ${varName}!`;
  if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
  strVal = strVal.trim();
  if (strVal.length === 0)
    throw `Error: ${varName} cannot be an empty string or string with just spaces`;
  // if (!isNaN(strVal)){
  //   throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
  // }
  return strVal;
}

function isNumber(number) {
  return number >= 0 && typeof number === "number";
}

function isStringArray(strArr) {
  if (!Array.isArray(strArr)) {
    return false;
  }
  strArr.forEach((Element) => {
    if (typeof Element !== "string") {
      return false;
    }
  });
  return true;
}

const validator = {
  isValidEmail,
  isValidPhoneNumber,
  checkString,
  isStringArray,
  isNumber,
};
export default validator;
