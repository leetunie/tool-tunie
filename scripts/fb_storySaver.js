import { UfsGlobal } from "./content-scripts/ufs_global.js";

export default {
  icon: "https://lh3.googleusercontent.com/e8gqesNOLhN-0xivFcaAlwGaoftfxEJcZXcXJ1F2bhoqrozs3mCYgLhPC0qJ9izdGYRnHwfXegimH9fjj3IBwlby9ZA=w128-h128-e365-rj-sc0x00ffffff",
  name: {
    en: "Download watching fb Story/Comment",
    vi: "Tải Story/Comment fb đang xem",
  },
  description: {
    en: "Download facebook story / comment video that you are watching",
    vi: "Tải facebook story / video bình luận bạn đang xem",
  },

  pageScript: {
    onClick: function () {
      // Source code extracted from: https://chrome.google.com/webstore/detail/story-saver/mafcolokinicfdmlidhaebadidhdehpk

      let videos = document.querySelectorAll("video");
      let listUrls = [];

      for (let i = videos.length - 1; i >= 0; i--) {
        if (videos[i].offsetHeight === 0) continue;
        let reactKey = "";
        let keys = Object.keys(videos[i]);
        for (let j = 0; j < keys.length; j++) {
          if (keys[j].indexOf("__reactFiber") != -1) {
            reactKey = keys[j].split("__reactFiber")[1];
            break;
          }
        }
        let storyUrl;
        try {
          storyUrl =
            videos[i].parentElement.parentElement.parentElement.parentElement[
              "__reactProps" + reactKey
            ].children[0].props.children.props.implementations[1].data.hdSrc;
        } catch (e) {}
        if (storyUrl == null) {
          try {
            storyUrl =
              videos[i].parentElement.parentElement.parentElement.parentElement[
                "__reactProps" + reactKey
              ].children[0].props.children.props.implementations[1].data.sdSrc;
          } catch (e) {}
        }
        if (storyUrl == null) {
          try {
            storyUrl =
              videos[i].parentElement.parentElement.parentElement.parentElement[
                "__reactProps" + reactKey
              ].children.props.children.props.implementations[1].data.hdSrc;
          } catch (e) {}
        }
        if (storyUrl == null) {
          try {
            storyUrl =
              videos[i].parentElement.parentElement.parentElement.parentElement[
                "__reactProps" + reactKey
              ].children.props.children.props.implementations[1].data.sdSrc;
          } catch (e) {}
        }
        if (storyUrl == null) {
          try {
            storyUrl =
              videos[i]["__reactFiber" + reactKey].return.stateNode.props
                .videoData.$1.hd_src;
          } catch (e) {}
        }
        if (storyUrl == null) {
          try {
            storyUrl =
              videos[i]["__reactFiber" + reactKey].return.stateNode.props
                .videoData.$1.sd_src;
          } catch (e) {}
        }
        if (storyUrl != null) {
          listUrls.push({ url: storyUrl, type: "video" });
        }
      }

      let storyImgUrl = Array.from(
        document.querySelectorAll('img[draggable="false"]')
      ).find((_) => _.alt)?.src;
      if (storyImgUrl) {
        listUrls.push({ url: storyImgUrl, type: "img" });
      }

      let profile_pic = document.querySelector(
        "a[role=link][tabindex='0'][href*='https://www.facebook']>img"
      );
      let username = profile_pic?.alt || "fb_story";

      if (!listUrls.length) {
        alert("Không tìm thấy facebook story nào trong trang web.");
      } else if (listUrls.length === 1) {
        UfsGlobal.Extension.download({
          url: listUrls[0].url,
          filename: username + (listUrls[0].type === "img" ? ".jpg" : ".mp4"),
        });
      } else {
        let w = window.open("", "", "width=500,height=700");
        w.document.write(
          listUrls
            .map(({ url, type }) =>
              type === "video"
                ? `<video controls src="${url}" style="max-width:300px"></video>`
                : type === "img"
                ? `<img src="${url}" style="max-width:300px" />`
                : ""
            )
            .join("<br/>")
        );
      }
    },
  },
};
