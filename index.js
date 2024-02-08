import express from "express";
import { getVidsrcMovieSourcesId, getVidsrcShowSourcesId, getVidsrcSourceDetails, getVidsrcSources } from "./src/main.js";
import { encodeId, getFutoken } from "./src/utils.js";
import axios from "axios";

const app = express()
const port = 3000

app.use(function (req, res, next) {
    if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
        return res.sendStatus(204);
    }
    next();
});

app.get('/', (req, res) => {
    res.status(200).json({
        intro: "Welcome to the unofficial vidsrc provider: check the provider website @ https://vidsrc.to/ ",
        routes: {
            movie: "/:movieTMDBid",
            show: "/:showTMDBid/:seasonNumber/:episodeNumber"
        },
        author: "This api is developed and created by AijaZ"
    })
})

app.get('/:movieTMDBid', async(req, res) => {
    const movieId = req.params.movieTMDBid;

    const sourcesId = await getVidsrcMovieSourcesId(movieId);
    if(!sourcesId) res.status(404).send({
        status: 404,
        return: "Oops movie not available"
    });

    const sources = await getVidsrcSources(sourcesId);

    const vidplay = sources.data.result.find((v) => v.title.toLowerCase() === 'vidplay');

    if(!vidplay) res.status(404).json('vidplay stream not found for vidsrc');

    const vidplayLink = await getVidsrcSourceDetails(vidplay.id);
    
    const key = await encodeId(vidplayLink.split('/e/')[1].split('?')[0]);
    const data = await getFutoken(key, vidplayLink);

    let subtitles;
    if(vidplayLink.includes('sub.info='))
    {
        const subtitleLink = vidplayLink.split('?sub.info=')[1].split('&')[0];
        const subtitlesFetch = await axios.get(decodeURIComponent(subtitleLink));
        subtitles = await subtitlesFetch.data;
    }

    const response = await axios.get(`https://vidplay.online/mediainfo/${data}?${vidplayLink.split('?')[1]}&autostart=true`, {
        params: {
            v: Date.now().toString(),
        },
        headers: {
            "Referer": vidplayLink
        }
    });

    const result = response.data.result;

    if (!result && typeof result !== 'object') {
        throw new Error('an error occured');
    }

    const source = result.sources?.[0]?.file;
    if(!source) res.status(404).send({
        status: 404,
        return: "Oops reached rate limit of this api"
    })

    res.status(200).json({
        source,subtitles
    })
})

app.get('/:showTMDBid/:seasonNum/:episodeNum', async(req, res) => {
    const showTMDBid = req.params.showTMDBid;
    const seasonNum = req.params.seasonNum;
    const episodeNum = req.params.episodeNum;

    console.log(showTMDBid,seasonNum,episodeNum)

    const sourcesId = await getVidsrcShowSourcesId(showTMDBid, seasonNum, episodeNum);
    if(!sourcesId) res.status(404).send({
        status: 404,
        return: "Oops show not available"
    });

    const sources = await getVidsrcSources(sourcesId);

    const vidplay = sources.data.result.find((v) => v.title.toLowerCase() === 'vidplay');

    if(!vidplay) res.status(404).json('vidplay stream not found for vidsrc');

    const vidplayLink = await getVidsrcSourceDetails(vidplay.id);
    
    const key = await encodeId(vidplayLink.split('/e/')[1].split('?')[0]);
    const data = await getFutoken(key, vidplayLink);

    let subtitles;
    if(vidplayLink.includes('sub.info='))
    {
        const subtitleLink = vidplayLink.split('?sub.info=')[1].split('&')[0];
        const subtitlesFetch = await axios.get(decodeURIComponent(subtitleLink));
        subtitles = await subtitlesFetch.data;
    }

    const response = await axios.get(`https://vidplay.online/mediainfo/${data}?${vidplayLink.split('?')[1]}&autostart=true`, {
        params: {
            v: Date.now().toString(),
        },
        headers: {
            "Referer": vidplayLink
        }
    });

    const result = response.data.result;

    if (!result && typeof result !== 'object') {
        throw new Error('an error occured');
    }

    const source = result.sources?.[0]?.file;
    if(!source) res.status(404).send({
        status: 404,
        return: "Oops reached rate limit of this api"
    })

    res.status(200).json({
        source,subtitles
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})