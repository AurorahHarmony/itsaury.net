document.querySelectorAll<HTMLPreElement>(".prose pre").forEach((pre) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-btn";
  button.textContent = "Copy";
  button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(pre.querySelector("code")?.innerText ?? pre.innerText);
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = "Copy"), 1500);
  });
  pre.append(button);
});
