import express from "express";
import { createPerson, resetPassword, tokenForgerPassword, login } from "../Controller/personController.js";

const router = express.Router();

router.post('/create_user', createPerson);
router.post('/login', login)
router.post('/forget_password', tokenForgerPassword);
router.post('/reset_password/:token', resetPassword)

export default router;