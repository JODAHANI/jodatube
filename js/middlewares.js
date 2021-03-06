import multer from "multer";

export const localsMiddleware = (req,res,next) => {
    let loggedIn = Boolean(req.session.loggedIn)
    res.locals.loggedIn = loggedIn
    res.locals.siteName = "JodaTube"
    res.locals.loggedInUser = req.session.user || {};
    console.log(loggedIn)
    next()
};

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
      return next();
    } else {
      return res.redirect("/login");
    }
};
  
export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/");
    }
};

export const avatarUpload = multer({ 
    dest: 'uploads/avatars',
    limits: {
        fileSize: 3000000
    }
 })
export const videoUpload = multer({ 
    dest: 'uploads/videos',
    limits: {
        fileSize: 100000000
    }
})
