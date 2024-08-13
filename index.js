import express from "express";
import { vidsrcBase } from "./src/common.js";
import { getVidsrcSourcesId, getVidsrcSources } from "./src/hooks.js";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.status(200).json({
    intro:
      "Welcome to the unofficial vidsrc provider: check the provider website @ https://vidsrc.cc/ ",
    routes: {
      movie: "/:movieTMDBid",
      show: "/:showTMDBid?s=seasonNumber&e=episodeNumber",
    },
    author: "This api is developed and created by AijaZ",
  });
});

app.get("/:tmdbId", async (req, res) => {
  const id = req.params.tmdbId;
  const season = req.query.s;
  const episode = req.query.e;

  const sourcesId = await getVidsrcSourcesId(id, season, episode);

  if (!sourcesId) {
    res.status(404).send({
      status: 404,
      return: "Oops media not available",
    });
    return;
  }

  const sources = await getVidsrcSources(sourcesId, season, episode);

  const servers = sources.data.filter((v) => v.name.toLowerCase() !== "vidsrc");

  if (!servers)
    res.status(404).json({
      status: 404,
      response: "No streaming servers found",
    });

  const [server1, server2] = await Promise.all([
    (async () => {
      return await (
        await fetch(`${vidsrcBase}/api/source/${servers[0]["hash"]}`)
      ).json();
    })(),
    (async () => {
      return await (
        await fetch(`${vidsrcBase}/api/source/${servers[1]["hash"]}`)
      ).json();
    })(),
  ]);

  res.status(200).json({
    [servers[0].name]: server1.data,
    [servers[1].name]: server2.data,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
