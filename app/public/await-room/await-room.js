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
  console.log(data.timeToStart);
  if (data.timeToStart != -1) {
    document.getElementById("timer").removeAttribute("style");
    document.getElementById("await-title").style.display = "none";
    let user_list = document.getElementById("user-list-id");
    user_list.style.marginTop = "50px";
  } else {
    document.getElementById("timer").style.display = "none";
    document.getElementById("await-title").removeAttribute("style");
  }

  timeLimit = timeLeft = data.timeToStart / 1000;
  timePassed = 0;
});
