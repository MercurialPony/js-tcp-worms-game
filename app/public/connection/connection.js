const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const userInput = document.getElementById("username");

const dialog = document.getElementById("dialog-id");
const openButton = document.getElementById("choose-ip");
// const homeButton = dialog.querySelector('sl-button[slot="footer"]');
// const closeButton = dialog.querySelector('sl-button[slot="footer"]');

if (openButton) {
  openButton.addEventListener("click", () => {
    dialog.show();
  });
}

// if (closeButton) {
//   closeButton.addEventListener("click", () => dialog.hide());
// }

dialog.addEventListener("sl-request-close", (event) => {
  if (event.detail.source === "overlay") {
    event.preventDefault();
  }
});

if (sessionStorage.getItem("username")) {
  userInput.setAttribute("value", sessionStorage.getItem("username"));
}

/////////////////////////////////////

const form = document.getElementById("form");
form.addEventListener("submit", (e) => e.preventDefault());
form.addEventListener("submit", () => {
  parent.connect(ipInput.value, portInput.value, userInput.value);

  sessionStorage.setItem("username", userInput.value);
});

var handler = parent.provideHandler();

handler.json(0, (data) => {
  if (data.accepted) {
    window.location.href = "await-room/await-room.html";
    return;
  }

  alert(`This name "${userInput.value}" already exists`);
  // highlight error
});
