import { vidsrcBase } from "../src/common.js";
import { load } from "cheerio";
import axios from "axios";
import { decryptSourceUrl } from "./utils.js";

export async function getVidsrcMovieSourcesId(tmdbId)
{
    try {
        const data = await axios.get(`${vidsrcBase}/embed/movie/${tmdbId}`);

        const doc = load(data.data);
        const sourcesCode = doc('a[data-id]').attr('data-id');

        return sourcesCode;
    } catch (err) {
        return;
    }
}

export async function getVidsrcShowSourcesId(tmdbId, seasonNumber, episodeNumber) {
    try {
        const data = await axios.get(`${vidsrcBase}/embed/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`);

        const doc = load(data.data);
        const sourcesCode = doc('a[data-id]').attr('data-id');

        return sourcesCode;
    } catch (err) {
        return;
    }
}

export async function getVidsrcSources(sourceId)
{
    const data = await axios.get(`${vidsrcBase}/ajax/embed/episode/${sourceId}/sources`);

    return data;
}

export async function getVidsrcSourceDetails(sourceId)
{
    const data = await axios.get(`${vidsrcBase}/ajax/embed/source/${sourceId}`)

    const encryptedUrl = data.data.result.url;
    const decryptedUrl = decryptSourceUrl(encryptedUrl);
    return decodeURIComponent(decryptedUrl);
}