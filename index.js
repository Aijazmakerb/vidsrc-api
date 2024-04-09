import express from "express";
import { getVidsrcSourcesId, getVidsrcSourceDetails, getVidsrcSources, getSubtitles } from "./src/hooks.js";
import { encodeId, generateRandomIp, generateRandomUserAgent ,getFutoken } from "./src/vidplay/utils.js";

const app = express()
const port = 3000;

app.get('/', (req, res) => {
    res.status(200).json({
        intro: "Welcome to the unofficial vidsrc provider: check the provider website @ https://vidsrc.to/ ",
        routes: {
            movie: "/:movieTMDBid",
            show: "/:showTMDBid?s=seasonNumber&e=episodeNumber"
        },
        author: "This api is developed and created by AijaZ"
    })
})

app.get('/:tmdbId', async(req, res) => {
    const id = req.params.tmdbId;
    const season = req.query.s;
    const episode = req.query.e;

    const sourcesId = await getVidsrcSourcesId(id, season, episode);

    if (!sourcesId) {
        res.status(404).send({
            status: 404,
            return: "Oops media not available"
        })
        return;
    };

    const sources = await getVidsrcSources(sourcesId);
    const vidplay = sources.result.find((v) => v.title.toLowerCase() === 'vidplay');
    if(!vidplay) res.status(404).json('vidplay stream not found for vidsrc');

    const vidplayLink = await getVidsrcSourceDetails(vidplay.id);

    const key = await encodeId(vidplayLink.split('/e/')[1].split('?')[0]);
    const data = await getFutoken(key, vidplayLink);

    const subtitles = await getSubtitles(vidplayLink)

    const response = await (await fetch(`https://vidplay.online/mediainfo/${data}?${vidplayLink.split('?')[1]}&autostart=true`, {
        headers: {
            "Origin": generateRandomIp(),
            "Referer": vidplayLink,
            "Host": "vidplay.online",
            "User-Agent": generateRandomUserAgent()
        }
    })).json();

    const result = response.result;

    if (!result && typeof result !== 'object') {
        throw new Error('an error occured');
    }

    const source = result.sources?.[0]?.file;
    if(!source) res.status(404).send({
        status: 404,
        return: "Oops reached rate limit of this api"
    })

    res.status(200).json({
        source: source,
        referer: vidplayLink.split('?')[0],
        subtitles: subtitles
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})