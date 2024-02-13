const nodemailer = require("nodemailer");
require("dotenv").config();

const { META_PASSWORD } = process.env;

const nodemailerConnfig = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: "vlad.grinevich@meta.ua",
    pass: META_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConnfig);

const sendEmail = async (data) => {
  const email = { ...data, from: "vlad.grinevich@meta.ua" };
  await transport.sendMail(email);
  return true;
};

module.exports = sendEmail;
