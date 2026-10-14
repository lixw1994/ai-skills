(() => {
  const h = window.PreviewDOM.h;
  const font = '-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", sans-serif';

  function MacTrafficLights() {
    return h(
      "div",
      {
        "aria-hidden": "true",
        style: { display: "flex", gap: 9 },
      },
      ["#ff736a", "#febc2e", "#19c332"].map((background) =>
        h("span", {
          style: {
            width: 14,
            height: 14,
            borderRadius: "50%",
            background,
            border: "0.5px solid rgba(0,0,0,0.1)",
            boxSizing: "border-box",
          },
        }),
      ),
    );
  }

  // Dimensions describe the product viewport; the title bar sits outside it.
  function MacWindow({ width = 900, height = 600, title = "", children }) {
    return h(
      "div",
      {
        className: "desktop-window",
        style: {
          width,
          height: height + 44,
          borderRadius: 26,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.23), 0 16px 48px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          fontFamily: font,
        },
      },
      h(
        "div",
        {
          className: "desktop-titlebar",
          style: {
            height: 44,
            flexShrink: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f4f4f6",
            borderBottom: "1px solid #d8d8dc",
            boxSizing: "border-box",
          },
        },
        h("div", { style: { position: "absolute", left: 16 } }, h(MacTrafficLights)),
        h(
          "div",
          {
            style: {
              padding: "0 84px",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(0,0,0,0.85)",
            },
          },
          title,
        ),
      ),
      h(
        "div",
        {
          className: "desktop-content",
          style: { width: "100%", height, flexShrink: 0, overflow: "hidden" },
        },
        children,
      ),
    );
  }

  window.MacWindow = MacWindow;
})();
