import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testMailer() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL!,
      pass: process.env.NODEMAILER_PASSWORD!,
    },
  });

  await transporter.verify();
  console.log("Mailer connection is valid");

  const info = await transporter.sendMail({
    from: `"Attempt Signal Test" <${process.env.NODEMAILER_EMAIL}>`,
    to: process.env.NODEMAILER_EMAIL,
    subject: "Attempt Signal mail test",
    text: "This is a test email from Nodemailer.",
  });

  console.log("Email sent:", info.response);
}

testMailer().catch((err) => {
  console.error("Mail test failed:");
  console.error(err);
});