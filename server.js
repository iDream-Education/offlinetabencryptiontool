// *--------------------------Imports------------------------------*
import express, { json, static as Static } from "express";
// import session from "express-session"
// import MongoStore from "connect-mongo"
import { config } from "dotenv";
// import connectDatabase from "./db/db.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import path from "path"

// *-------------------------Routers--------------------------------*
import HomeRouter from "./routes/Home.routes.js"
import ApiRouter from "./routes/Api.routes.js"

const app = express();
// Path & File Reader Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// dotenv config
config({ path: __dirname + '/config/.env' });
// Serve Static Files
app.use("/assets", Static(resolve(__dirname, "assets")));
app.use("/encrypted", Static(resolve(__dirname, "encrypted"), { setHeaders: (res, rec, path, stat) => res.setHeader("Content-Type", "text/plain") }));
// set View engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
// forceSSL
const forceSsl = function (req, res, next) {
	if (req.headers["x-forwarded-proto"] !== "https") {
		return res.redirect(["https://", req.get("Host"), req.url].join(""));
	}
	return next();
};
// use force ssl
if (process.env.MODE === "production") {
	app.use(forceSsl);
} else {
	console.log(`App is Running in ${process.env.MODE} Mode.`);
}

// Parsing Body
app.use(json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
// connectDatabase().then((val) => {
// 	console.log(val)
// }).catch(e => {
// 	console.log(e)
// })

// Express-Session Config
// app.use(
// 	session({
// 		secret: process.env.SECRET,
// 		resave: true,
// 		saveUninitialized: false,
// 		store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
// 		cookie: { maxAge: 180 * 60 * 1000 },
// 	})
// );

// Routes
app.use("/", HomeRouter);
app.use("/api", ApiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server has started at PORT http://localhost:${PORT}`));