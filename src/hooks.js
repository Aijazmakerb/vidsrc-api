import { vidsrcBase } from "./common.js";
import { load } from "cheerio";
import { decryptSourceUrl } from "./utils.js";

export async function getVidsrcSourcesId(tmdbId, seasonNumber, episodeNumber){
    const type = seasonNumber && episodeNumber ? "tv" : "movie";
    const url = `${vidsrcBase}/embed/${type}/${tmdbId}${type === "tv" ? `/${seasonNumber}/${episodeNumber}`: ''}`
    try {
        const data = await (await fetch(url)).text();

        const doc = load(data);
        const sourcesCode = doc('a[data-id]').attr('data-id');

        return sourcesCode;
    } catch (err) {
        return;
    }
}

export async function getVidsrcSources(sourceId)
{
    const data = await (await fetch(`${vidsrcBase}/ajax/embed/episode/${sourceId}/sources`)).json();

    return data;
}

export async function getVidsrcSourceDetails(sourceId)
{
    const data = await (await fetch(`${vidsrcBase}/ajax/embed/source/${sourceId}`)).json();

    const encryptedUrl = data.result.url;
    const decryptedUrl = decryptSourceUrl(encryptedUrl);
    return decodeURIComponent(decryptedUrl);
}

export async function getSubtitles(vidplayLink)
{
    if(vidplayLink.includes('sub.info='))
    {
        const subtitleLink = vidplayLink.split('?sub.info=')[1].split('&')[0];
        const subtitlesFetch = await (await fetch(decodeURIComponent(subtitleLink))).json();
        return subtitlesFetch;
    }
}