function enableCopy() {
  document.querySelectorAll("pre:not(.mermaid)").forEach((node) => {
    let copyBtn = document.createElement("span");
    copyBtn.classList.add("copybutton");
    copyBtn.classList.add("icon");
    copyBtn.classList.add("icon-copy");
    node.appendChild(copyBtn);
    copyBtn.addEventListener("click", async () => {
      if (navigator.clipboard) {
        let rows = [];

        node.querySelectorAll("code")[0].querySelectorAll("tr").forEach((r) => {
          if (r.childElementCount == 1) {
            rows.push(r.childNodes[0].innerText);
          } else {
            rows.push(r.childNodes[1].innerText);
          }
        });
        let text = rows.join("");
        await navigator.clipboard.writeText(text);
        copyBtn.classList.add("clicked");
      }
      setTimeout(() => copyBtn.classList.remove("clicked"), 600);
    });
  });
}
