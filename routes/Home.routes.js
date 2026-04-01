import express from 'express'
import { loginView, HomeView } from '../controller/Home.controller.js'
const Router = express.Router();
// login Route
Router.get("/login", loginView);
Router.get("/", HomeView);

export default Router;