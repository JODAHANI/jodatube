import express from 'express'
import User from '../models/User'
import fetch from 'node-fetch'
import bcrypt from 'bcrypt'
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from "../js/middlewares";

const userRouter = express.Router();

userRouter.get('/logout', async (req, res) => {
    req.session.destroy();  
    res.redirect('/');
})

userRouter.get('/edit', protectorMiddleware, (req, res) => {
    res.render('edit-profile', { pageTitle: 'User Edit' });
})

userRouter.post('/edit', protectorMiddleware, avatarUpload.single('avatar'), async (req, res) => {
    const { 
        session : {
             user : { _id, avatarUrl } 
        },
        body : { userName}, 
        file 
    } = req
    console.log( file ? file.path : avatarUrl)
    const searchUser  = await User.find({ userName })
    if(userName.length != 0 && searchUser.length == 0) {
        const updatedUser  = await User.findByIdAndUpdate(_id, 
            { userName, avatarUrl: file ? file.path : avatarUrl}, 
            { new : true }
        );
        req.session.user = updatedUser
        return res.redirect('/users/edit');
    } else {
        return res.render('edit-profile', { pageTitle: 'User Edit', err: true});
    }
    
})
// // 패스워드 변경
userRouter.get('/change-password', protectorMiddleware, (req,res) => {
    const { session : { user : { socialOnly }}} = req
    if(!socialOnly) {
        return res.render('change-password',{ pageTitle: 'Change-Password'})
    } else {
        return res.redirect('/users/profile')
    }
})

// 패스워드 변경
userRouter.post('/change-password', protectorMiddleware, async (req,res) => {
    const { 
        session : {
            user : { _id} 
        },
        body : { oldPw, newPw, confirmPw } 
    } = req
    const user = await User.findById(_id)
    const ok = await bcrypt.compare(oldPw,user.pw)
    if(!ok) {
        return res.status(400).render('change-password',{ 
            pageTitle: 'Change-Password', err:"The previous password does not match."
        })
    }
    if(newPw !== confirmPw) {
        return res.status(400).render('change-password',{ 
            pageTitle: 'Change-Password', err:"The passwords do not match."
        })
    }
    user.pw = newPw;
    await user.save()
    return res.redirect('/users/logout')
})

// 유저 비디오? 프로필?
userRouter.get('/:id', async (req, res) => {
    const { params: { id } } = req
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    if (!user) {
        return res.status(404).render('404', { pageTitle: 'User Not Found...' })
    } else {
        return res.render('profile', { pageTitle: `${user.userName}`, user })
    }
});

// 깃헙 로그인
userRouter.get('/github/start', publicOnlyMiddleware, (req, res) => {
    const url = 'https://github.com/login/oauth/authorize?'
    const config = {
        client_id: '606f783afcbaebdb04a2',
        allow_signup: false,
        scope: 'read:user user:email'
    }
    const params = new URLSearchParams(config).toString()
    const finalUrl = `${url}${params}`
    return res.redirect(finalUrl)
});

userRouter.get('/github/finish', publicOnlyMiddleware, async (req, res) => {
    const url = 'https://github.com/login/oauth/access_token'
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString()
    const finalUrl = `${url}?${params}`
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();
    if ("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = 'https://api.github.com'
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailObj = emailData.find((email) => email.primary === true && email.verified === true);
        console.log(emailData,userData, emailObj)
        if (!emailObj) {
            return res.redirect("/login")
        }
        const user = await User.findOne({ email: emailObj.email });
        if (!user) {
            await User.create({
                avatarUrl: userData.avatar_url,
                socialOnly: true,
                email: emailObj.email,
                pw: "",
                userName: userData.login,
                name: userData.name
            })
        }
        req.session.loggedIn = true;
        req.session.user = user
        return res.redirect('/')
    } else {
        return res.redirect("/login");
    }
})

export default userRouter