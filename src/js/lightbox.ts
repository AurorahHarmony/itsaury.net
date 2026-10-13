const images = document.querySelectorAll<HTMLImageElement>("img[data-lightbox]");

if (images.length) {
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  const big = document.createElement("img");
  big.alt = "";
  dialog.append(big);
  document.body.append(dialog);

  dialog.addEventListener("click", () => dialog.close());

  images.forEach((img) => {
    img.addEventListener("click", () => {
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      dialog.showModal();
    });
  });
}
