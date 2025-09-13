import { UfsGlobal } from "./content-scripts/ufs_global.js";

export default {
  icon: '<i class="fa-solid fa-bookmark fa-lg"></i>',
  name: {
    en: "Export bookmarks to file",
    vi: "Xuất bookmarks ra file",
  },
  description: {
    en: "Export all your browser's bookmarks to JSON file",
    vi: "Xuất tất cả bookmarks trong trình duyệt của bạn ra file JSON",
  },

  changeLogs: {
    "2024-04-27": "support download as .json",
  },

  popupScript: {
    onClick: async function () {
      chrome.bookmarks.getTree((tree) => {
        console.log(tree);

        UfsGlobal.Utils.downloadData(
          JSON.stringify(tree, null, 4),
          "bookmarks.json"
        );
      });
    },
  },
};
