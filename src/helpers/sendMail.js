import transporter from "../config/transport";

export const sendMail = async ({ to, subject, html }) =>
  await transporter.sendMail(
    {
      from: {
        address: process.env.AUTH_EMAIL,
        name: "Web quản lý phòng game",
      },
      to: to,
      subject: subject,
      html: html,
    },
    (err, info) => {
      if (err) console.log("Failed to send mail.\nError: ", err.message);
      else console.log(info.response);
    }
  );
