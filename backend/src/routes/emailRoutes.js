import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const usernameAdmin = process.env.EMAIL_USER;
const password = process.env.EMAIL_APP_PASS;

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: usernameAdmin,
    pass: password,
  },
});

// Send welcome email to new users
export const sendWelcomeEmail = async (username, email) => {
  const mailOptions = {
    from: usernameAdmin,
    to: email,
    subject: `Welcome to Crossword Crew, ${username}!`,
    text: `Hi ${username}, \n\n 
      Thanks for signing up for Crossword Crew. In the Create tab, you can create new crosswords without limits! In the Library tab you'll find all the crosswords others have shared with you as well as your own crosswords. You can edit your crosswords and solve those shared with you, all from the Library tab.\n
      If you encounter any issues, please let the Crossword Crew Team know in the Contact tab. Enjoy crosswording!\n\n
      
      -Crossword Crew Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

// Send email to admin from contact form
router.post("/contact", async (req, res) => {
  const { username, email, message } = req.body;

  const mailOptions = {
    from: usernameAdmin,
    to: usernameAdmin,
    subject: `Contact Form Submission from ${username}`,
    text: `You have received a new message from ${username} (${email}):\n\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email" });
  }
});

export default router;
