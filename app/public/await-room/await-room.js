const userList = document.getElementById("user-list");

function addPlayer(name) {
  const li = document.createElement("li");
  li.innerText = name;
  userList.appendChild(li);
}

function removePlayer(name) {
  Array.from(userList.getElementsByTagName("li"))
    .filter((e) => e.innerText === name)
    .forEach((e) => userList.removeChild(e));
}

var handler = parent.provideHandler();

handler.json(1, (data) => {
  data.players.forEach((name) => addPlayer(name));
});

handler.json(2, (data) => {
  const func = data.joined ? addPlayer : removePlayer;
  func(data.username);
});

handler.json(3, (data) => {
  document.getElementById("timer").removeAttribute("style");
  document.getElementById("await-title").remove();
  let user_list = document.getElementById("user-list-id");
  user_list.style.marginTop = "50px";
  timeLimit = timeLeft = data.timeToStart / 1000;
  timePassed = 0;
});
