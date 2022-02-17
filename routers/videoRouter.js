import express from "express";
import { protectorMiddleware, videoUpload, } from "../js/middlewares";
import Video, { formatHashtags } from '../models/Video'
import User from '../models/User'
const videoRouter = express.Router()


videoRouter.get('/upload',protectorMiddleware, async (req, res) => {
    res.render('upload', { pageTitle: 'upload' })
});

videoRouter.post('/upload',protectorMiddleware, videoUpload.fields([{ name: 'video', maxCount: 1 },{ name: 'thumb', maxCount: 1 }]), async (req, res) => {
    const {
        session : {user : {_id : id}}
    } = req
    const { video, thumb} = req.files;
    const { title, description, hashtags } = req.body;
    
    try {
        const newVideo = await Video.create({
            fileUrl : video[0].path,
            thumbUrl : thumb[0].path.replace(/[\\]/g, "/"),
            title,
            description,
            hashtags: formatHashtags(hashtags),
            owner : id,
        })
        const user = await User.findById(id);
        user.videos.push(newVideo._id)
        user.save();
        console.log(newVideo)
        console.log(user)
        return res.redirect('/')
    } catch(err) {
        console.log(err);
        return res.status(400).render("upload", {
            pageTitle: "Upload Video",
            errorMessage: err,
        });
    }
});

videoRouter.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const video = await Video.findById(id).populate('owner');
        console.log(video)
        return res.render("watch", { pageTitle : 'JodaTube' , video });
    } catch (err) {
        console.log(err)
        return res.render("error");
    }
});

videoRouter.get('/:id/edit',protectorMiddleware, async (req, res) => {
    const {
        session: {user : { _id} } ,
        params : { id },
    } = req
    try {
        const video = await Video.findById(id);
        if(String(video.owner) !== String(_id)) {
            return res.redirect('/')
        }
        return res.render('edit', { video })
    } catch (err) {
        console.log(err)
        return res.render("error");
    }
});

videoRouter.post('/:id/edit',protectorMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: formatHashtags(hashtags)
    });
    return res.redirect('/')
    // const video = await Video.findById(id)
    // video.title = title
    // video.description = description;
    // await video.save();
});
videoRouter.get('/:id/delete',protectorMiddleware, async (req, res) => {
    const { id } = req.params;
    const {
        session : {user : {_id}}
    } = req
    await Video.findByIdAndDelete(id);
    const user = await User.findById(_id)
    const index = user.videos.indexOf(id)
    user.videos.splice(index,1)
    user.save();
    res.redirect('/')
});

export default videoRouter;


// const video = new Video({
  //   title,  
  //   description,
  //   createdeAt: Date.now(),
  //   meta: {
  //     views: 0,
  //     rating: 0,
  //   }
  // });
  // // save는 promist를 리턴 해준다. 기다려줘야됨.
  // const dbVideo = await video.save();