import { BADGES } from "./helpers/badge.js";
import { UfsGlobal } from "./content-scripts/ufs_global.js";
import { showLoading, runScriptInCurrentTab } from "./helpers/utils.js";
import { shared as tiktok_downloadVideo } from "./tiktok_downloadVideo.js";

export default {
  icon: "https://www.tiktok.com/favicon.ico",
  name: {
    en: "Tiktok - Download watching video",
    vi: "Tiktok - Tải video đang xem",
  },
  description: {
    en: "Download tiktok video you are watching (no watermark)",
    vi: "Tải video tiktok bạn đang xem (không watermark)",
  },
  badges: [BADGES.hot],
  changeLogs: {
    "2024-04-27": "fix bug - use snaptik",
    "2024-05-16": "fix title + show download speed",
  },

  whiteList: ["https://www.tiktok.com/*"],

  popupScript: {
    onClick: async function () {
      const { t } = await import("../popup/helpers/lang.js");
      const { closeLoading, setLoadingText } = showLoading(
        t({ vi: "Đang tìm video id..", en: "Finding video id..." })
      );

      let title = "tiktok_video";

      const getLinkFuncs = [
        async () => {
          setLoadingText(
            t({ vi: "Đang lấy video id..", en: "Finding video id..." })
          );
          const videos = await shared.getListVideoIdInWebsite();
          if (videos.length) {
            let video = videos[0];
            title = video?.title?.split?.("#")?.[0] || video.id || title;
            setLoadingText(
              t({
                vi: `Đang tìm link tải video ${title}...`,
                en: `Fetching download link of ${title}...`,
              })
            );

            let res = await tiktok_downloadVideo.getVideoNoWaterMark(
              shared.genTiktokUrl(video.author, video.id)
            );
            return res;
          }
        },

        async () => {
          setLoadingText(
            t({
              vi: "Đang tìm video url từ DOM...",
              en: "Finding video url from DOM..",
            })
          );
          return await runScriptInCurrentTab(
            async () => await UfsGlobal.DOM.getWatchingVideoSrc()
          );
        },
      ];

      let link;
      for (let func of getLinkFuncs) {
        try {
          link = await func();
          if (link) break;
        } catch (e) {
          alert("ERROR: " + e);
        }
      }

      if (!link)
        alert(
          t({ vi: "Không tìm được link video", en: "Cannot find video link" })
        );
      else {
        setLoadingText(
          t({ vi: `Đang tải video ${title}...`, en: `Downloading ${title}...` })
        );

        UfsGlobal.Extension.download({
          url: link,
          filename: title + ".mp4",
        });

        // const { formatSize, downloadBlob } = UfsGlobal.Utils;
        // const blob = await getBlobFromUrlWithProgress(
        //   link,
        //   ({ loaded, total, speed }) => {
        //     let desc =
        //       formatSize(loaded, 1) +
        //       " / " +
        //       formatSize(total, 1) +
        //       " (" +
        //       formatSize(speed, 1) +
        //       "/s)";
        //     setLoadingText(
        //       t({
        //         vi: `Đang tải ${desc}...<br/>${title}`,
        //         en: `Downloading ${desc}...<br/>${title}`,
        //       })
        //     );
        //   }
        // );
        // downloadBlob(blob, title + ".mp4");
      }

      closeLoading();
    },
  },
};

export const shared = {
  genTiktokUrl(author, videoId) {
    return `https://www.tiktok.com/@${author}/video/${videoId}`;
  },
  getListVideoIdInWebsite: async function () {
    return await runScriptInCurrentTab(() => {
      const { getOverlapScore, closest } = UfsGlobal.DOM;

      let allVideos = Array.from(document.querySelectorAll("video"));
      let result = [];
      for (let video of allVideos) {
        try {
          result.push({
            overlapScore: getOverlapScore(video),
            id: video.parentElement.id.split("-").at(-1),
            title:
              closest(video, '[data-e2e="browse-video-desc"]')?.textContent ||
              closest(video, '[data-e2e="video-desc"]')?.textContent,
            author:
              closest(video, '[data-e2e="browse-user-avatar"]')?.href ||
              closest(video, '[data-e2e="video-author-avatar"]')?.href,
          });
        } catch (e) {
          console.log("ERROR on get: ", e);
        }
      }

      return result.sort((a, b) => b.overlapScore - a.overlapScore);
    });
  },
};

async function getBlobFromUrlWithProgress(url, progressCallback) {
  const response = await fetch(url, {});
  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  const contentLength = response.headers.get("content-length");
  const total = parseInt(contentLength, 10);
  let loaded = 0;
  const reader = response.body.getReader();
  const chunks = [];

  const startTime = Date.now();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.byteLength;
    const ds = (Date.now() - startTime + 1) / 1000;
    progressCallback?.({
      loaded,
      total,
      speed: loaded / ds,
    });
    chunks.push(value);
  }

  const blob = new Blob(chunks, {
    type: response.headers.get("content-type"),
  });

  return blob;
}
