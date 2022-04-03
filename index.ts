import axios from "axios";
import { load } from "cheerio";
import fs from "fs";
import pino from "pino";
import pretty from "pino-pretty";

const logger = pino(
  pretty({
    colorize: true,
    translateTime: true,
  })
);

const fetchFlorida = (num?: number, maxNum?: number) => {
  const url = `https://floridaman.com/page/${!num ? 1 : num++}`;
  axios
    .get(url)
    .then((response) => {
      const data = response.data;
      const $ = load(data);

      const headlines = $("h3.g1-delta.g1-delta-1st.entry-title").map(
        (i, el) => {
          const text = $(el).text();

          if (!text.startsWith("  ")) {
            return text;
          }
        }
      );

      const finetune = `${headlines.get().join("\n")}\n`;
      fs.appendFile("finetune.txt", finetune, (err) => {
        if (err) {
          logger.error(err);
          return;
        }
      });
    })
    .catch((err) => {
      logger.error(err);
    })
    .then(() => {
      logger.info(`Wrote to file ${num}/${maxNum}...`);
    });
};

let maxNum = 17;
for (let i = 0; i < maxNum; i++) {
  fetchFlorida(i + 1, maxNum);
}
