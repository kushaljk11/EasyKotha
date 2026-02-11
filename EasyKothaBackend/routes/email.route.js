import express from "express";
import handler from "../controller/email.controller.js";

const emailrouter = express.Router();

emailrouter.post('/contact', handler);

export default emailrouter;