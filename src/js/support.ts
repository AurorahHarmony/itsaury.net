// Copy-to-clipboard methods in the support box, e.g. wallet addresses
document.querySelectorAll<HTMLButtonElement>("[data-support-copy]").forEach((btn) => {
  const label = btn.querySelector("span > span");
  const original = label?.textContent ?? "";
  let timer: ReturnType<typeof setTimeout> | undefined;

  btn.addEventListener("click", async () => {
    const text = btn.dataset.supportCopy ?? "";
    try {
      await navigator.clipboard.writeText(text);
      if (label) label.textContent = "Copied!";
    } catch {
      prompt("Copy this address:", text);
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => label && (label.textContent = original), 1600);
  });
});
