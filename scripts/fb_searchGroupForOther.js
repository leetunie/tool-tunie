export default {
  icon: '<i class="fa-solid fa-users-line fa-lg"></i>',
  name: {
    en: "Facebook - View your friends's joined groups",
    vi: "Facebook - Xem các nhóm bạn bè tham gia",
  },
  description: {
    en: "Know about your friends's joined groups (public groups) on facebook",
    vi: "Biết bạn bè của bạn đang tham gia các nhóm (công khai) nào trên facebook",
  },

  popupScript: {
    onClick: async () => {
      const {
        getUidFromUrl,
        getYourUserId,
        getFbdtsg,
        searchAllGroupForOther,
        getUserInfoFromUid,
      } = await import("./fb_GLOBAL.js");
      const { showLoading } = await import("./helpers/utils.js");
      let url = prompt("Nhập link facebook bạn bè (hoặc của bạn): ");
      if (url == null) return;

      let { setLoadingText, closeLoading } = showLoading("Đang chuẩn bị...");
      try {
        setLoadingText("Đang lấy uid, token...");
        let other_uid = await getUidFromUrl(url);
        let uid = await getYourUserId();
        let dtsg = await getFbdtsg();
        let info = await getUserInfoFromUid(other_uid);
        console.log(info);

        setLoadingText("Đang tải danh sách group...");
        let allGroups = await searchAllGroupForOther(
          other_uid,
          uid,
          dtsg,
          (groups, all) => {
            setLoadingText(
              "Đang tải danh sách group...<br/>Tải được " +
                all.length +
                " group."
            );
          }
        );
        console.log(allGroups);
        localStorage.ufs_fb_searchGroupForOther = JSON.stringify(allGroups);
        localStorage.ufs_fb_searchGroupForOther_owner = JSON.stringify(info);
        window.open(
          chrome.runtime.getURL("scripts/fb_searchGroupForOther.html")
        );
      } catch (e) {
        alert("ERROR: " + e);
      } finally {
        closeLoading();
      }
    },
  },
};
