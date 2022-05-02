"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

var lastTicks = 0;

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (message) {
    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    // We can assign user-supplied strings to an element's textContent because it
    // is not interpreted as markup. If you're assigning in any other way, you 
    // should be aware of possible script injection concerns.
    li.textContent = `Someone says ${message}`;

    var messagesSpace = document.getElementById("messagesSpace");
    messagesSpace.scrollTop = messagesSpace.scrollHeight;
});

connection.on("UpdateOnline", function (onlineCount, ticks) {
    if (ticks <= lastTicks)
        return;

    lastTicks = ticks;
    document.getElementById("onlineCount").innerText = onlineCount;
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var messageInput = document.getElementById("messageInput");
    connection.invoke("SendMessage", messageInput.value).catch(function (err) {
        return console.error(err.toString());
    });
    messageInput.value = "";
    event.preventDefault();
});

document.getElementById("clearButton").addEventListener("click", function (event) {
    document.getElementById("messagesList").innerHTML = "";
    event.preventDefault();
});