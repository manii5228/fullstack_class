const socket = io();
const eventList = document.getElementById("eventList");

function appendEvent(event) {
    const li = document.createElement("li");
    li.textContent = `[${event.timestamp}] ${event.message}`;
    eventList.prepend(li);
}

function sendEvent() {
    const input = document.getElementById("eventInput");
    const message = input.value.trim();

    if (!message) return;

    socket.emit("new_event", { message });
    input.value = "";
}

// Receive full history on sync
socket.on("sync_history", (history) => {
    eventList.innerHTML = "";
    history.slice().reverse().forEach(appendEvent);
});

// Receive live events
socket.on("broadcast_event", (event) => {
    appendEvent(event);
});