import { vidsrcBase } from "./common.js";
import { load } from "cheerio";
import { decryptSourceUrl } from "./utils.js";

export async function getVidsrcSourcesId(tmdbId, seasonNumber, episodeNumber) {
  const type = seasonNumber && episodeNumber ? "tv" : "movie";
  const url = `${vidsrcBase}/v2/embed/${type}/${tmdbId}${
    type === "tv" ? `/${seasonNumber}/${episodeNumber}` : ""
  }`;

  try {
    const data = await (await fetch(url)).text();

    const doc = load(data);
    let sourcesCode = doc("[data-id]")
      .map((i, el) => doc(el).attr("data-id"))
      .get();

    let result = {
      id: sourcesCode,
      info: {
        type: type,
        s: seasonNumber,
        e: episodeNumber,
      },
    };

    return result;
  } catch (err) {
    return;
  }
}

export async function getVidsrcSources(sourceId) {
  const data = await (
    await fetch(
      `${vidsrcBase}/api/episodes/${sourceId["id"][1]}/servers?id=${
        sourceId["id"][0]
      }&type=${
        sourceId["info"]["type"] === "tv"
          ? `tv/&season=${sourceId["info"]["s"]}&episode=${sourceId["info"]["e"]}`
          : "movie"
      }`
    )
  ).json();

  return data;
}

export async function getVidsrcSourceDetails(sourceId) {
  const data = await (
    await fetch(`${vidsrcBase}/ajax/embed/source/${sourceId}`)
  ).json();

  const encryptedUrl = data.result.url;
  const decryptedUrl = decryptSourceUrl(encryptedUrl);
  return decodeURIComponent(decryptedUrl);
}

export async function getSubtitles(vidplayLink) {
  if (vidplayLink.includes("sub.info=")) {
    const subtitleLink = vidplayLink.split("?sub.info=")[1].split("&")[0];
    const subtitlesFetch = await (
      await fetch(decodeURIComponent(subtitleLink))
    ).json();
    return subtitlesFetch;
  }
}
