import { vidsrcBase } from "./common.js";
import { load } from "cheerio";

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

    return sourcesCode;
  } catch (err) {
    return;
  }
}

export async function getVidsrcSources(sourceId, s, e) {
  const type = s && e ? "tv" : "movie";
  const data = await (
    await fetch(
      `${vidsrcBase}/api/episodes/${sourceId[1]}/servers?id=${
        sourceId[0]
      }&type=${type === "tv" ? `tv/&season=${s}&episode=${e}` : "movie"}`
    )
  ).json();

  return data;
}
