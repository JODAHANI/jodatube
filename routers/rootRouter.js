import express from 'express'
import User from '../models/User'
import Video from '../models/Video'
import bcrypt from 'bcrypt'
import { publicOnlyMiddleware } from "../js/middlewares";

const rootRouter = express.Router()

rootRouter.get('/', async (req, res) => {
    const videos = await Video.find({})
        .sort({ createdAt: "desc" })
        .populate("owner");
    res.render('home', { pageTitle: 'Home', videos })
})

rootRouter.get('/search', async (req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
          title: {
            $regex: new RegExp(`${keyword}`, "i"),
        },
      }).populate("owner");
    }
    console.log(videos)
    res.render('search', { pageTitle: 'Search', videos })
})

rootRouter.get('/join', (req, res) => {
    res.render('join', { pageTitle: 'Join', err: undefined })
});
rootRouter.post('/join', async (req, res) => {
    const { email, pw, pw2, userName, name } = req.body;
    const userCheck = await User.exists({ name });
    const userEmailCheck = await User.exists({ email });
    if (pw !== pw2) {
        return res.render('join', { err: "패스워드가 일치하지 않습니다.." })
    }
    if (userEmailCheck) {
        return res.render('join', { err: "이미 사용중인 이메일입니다." })
    }
    if (userCheck) {
        return res.render('join', { err: "이미 사용중인 별명입니다." })
    }
    await User.create({
        email,
        pw,
        userName,
        name
    })
    return res.redirect('/login')
});

rootRouter.get('/login', publicOnlyMiddleware, (req, res) => {
    let result = 1;
    res.render('login', { result })
});
rootRouter.post('/login', publicOnlyMiddleware, async (req, res) => {
    let result;
    const { email, pw } = req.body
    const user = await User.findOne({ email });
    if (!user) {
        result = 0;
        return res.render('login', { result })
    } else {
        const userPwCheck = await bcrypt.compare(pw, user.pw);
        if (!userPwCheck) {
            result = 0;
            return res.render('login', { result })
        } else {
            req.session.loggedIn = true;
            req.session.user = user
            return res.redirect('/')
        }
    }
});


export default rootRouter;