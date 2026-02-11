import express from "express";
import handler from "../controller/emailcontroller.js";

const emailrouter = express.Router();

emailrouter.post('/contact', handler);

export default emailrouter;