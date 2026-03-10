import nodemailer from 'nodemailer';
import {
  RESET_PASSWORD_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  NEWS_SUMMARY_EMAIL_TEMPLATE,
} from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL!,
    pass: process.env.NODEMAILER_PASSWORD!,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE
    .replace('{{name}}', name)
    .replace('{{intro}}', intro);

  const mailOptions = {
    from: `"Attempt Signal" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: `Welcome to Attempt Signal - your stock market toolkit is ready!`,
    text: 'Thanks for joining Attempt Signal',
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async ({
  email,
  name,
  resetUrl,
}: ResetPasswordEmailData): Promise<void> => {
  const safeName = (name || 'there').trim();
  const htmlTemplate = RESET_PASSWORD_EMAIL_TEMPLATE
    .replace('{{name}}', safeName)
    .replace('{{resetUrl}}', resetUrl);

  const mailOptions = {
    from: `"Attempt Signal Security" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: 'Reset your Attempt Signal password',
    text: `Reset your password using this link: ${resetUrl}`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}): Promise<void> => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
    .replace('{{date}}', date)
    .replace('{{newsContent}}', newsContent);

  const mailOptions = {
    from: `"Attempt Signal News" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Attempt Signal`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};


await transporter.verify();
console.log("Mailer is ready");
