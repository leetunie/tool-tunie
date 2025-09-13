export default {
  icon: `<i class="fa-solid fa-pen-nib fa-lg"></i>`,
  name: {
    en: "Toggle edit page",
    vi: "Bật/tắt chế độ chỉnh sửa website",
  },
  description: {
    en: "Edit all text in website",
    vi: "Cho phép chỉnh sửa mọi văn bản trong website",
  },

  contentScript: {
    onClick: function () {
      let isOn = document.designMode == "on";

      if (!isOn) {
        document.body.contentEditable = "true";
        document.designMode = "on";

        alert("Bạn có thể chỉnh sửa ngay bây giờ");
      } else {
        document.body.contentEditable = "false";
        document.designMode = "off";

        alert("Đã tắt chế độ chỉnh sửa");
      }
    },
  },
};
