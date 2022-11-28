const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const userInput = document.getElementById("username");

if (sessionStorage.getItem("username")) {
  userInput.setAttribute("value", sessionStorage.getItem("username"));
}

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
