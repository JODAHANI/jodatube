import express from "express";
import Video, { formatHashtags } from '../models/Video'
const apiRouter = express.Router();

apiRouter.post('/videos/:id([0-9a-f]{24})/view', async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if(!video) {
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    video.save();
    return res.sendStatus(200);
})

export default apiRouter; 