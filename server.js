const express = require('express')
const app = express()
const port = 3000
import session from 'express-session'
import MongoStore from 'connect-mongo'
import 'dotenv/config'
import './js/db'
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from './routers/apiRouter'
import { localsMiddleware } from './js/middlewares'

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.use('/static', express.static('assets'));
app.use('/images', express.static('images'));
app.use('/uploads', express.static('uploads'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));


app.use(
  session({
    secret: "Hello!",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL })
  })
);


app.use(localsMiddleware);

app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use('/api',apiRouter)


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// app.use((req, res, next) => {
//   req.sessionStore.all((error, sessions) => {
//     console.log(sessions);
//     next();
//   });
// });