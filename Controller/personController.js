import expressAsyncHandler from "express-async-handler";
import Person from "../Model/personSchema.js";
import { sendMail } from "../Config/sendMail.js";
import crypto from 'crypto';

export const createPerson = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  const findUser = await Person.findOne({ email });
  if (!findUser) {
    try {
      const person = new Person(req.body);
      await person.save();
      res.send(person);
    } catch (err) {
      throw new Error(err);
    }
  } else {
    throw new Error("User already exists");
  }
});

export const login = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await Person.findOne({ email });
  if (!findUser) {
    throw new Error("invalid credentials");
  }
  try {
    if (findUser && (await findUser.isPasswordMatched(password))) {
      res.send(findUser);
    } else {
      throw new Error("invalid credentials");
    }
  } catch (err) {
    throw new Error(err);
  }
});

export const tokenForgerPassword = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  const finduser = await Person.findOne({ email });
  if (!finduser) {
    throw new Error("User not found");
  }
  try {
    const token = await finduser.createPasswordResetToken();
    await finduser.save();
    const resetURL = `Hi ${finduser.name}, Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href="http://localhost:3000/reset_password/${token}">Click Here</a>`;
    const data = {
      to: email,
      subject: "Password reset",
      html: resetURL,
      text: `Greeting ${finduser.name}`,
    };
    sendMail(data);
    res.send(token);
  } catch (err) {
    throw new Error(err);
  }
});

export const resetPassword = expressAsyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  try{

    const user = await Person.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
  }catch(err){
    throw new Error(err)
  }
});