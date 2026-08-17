const micButton = document.getElementById("micButton");
const statusDisplay = document.getElementById("statusDisplay");
const youDisplay = document.getElementById("you");
const jarvisDisplay = document.getElementById("jarvis");

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (!SpeechRecognition) {

  statusDisplay.textContent = "VOICE NOT SUPPORTED";

  jarvisDisplay.textContent =
    "Speech recognition is not available in this browser.";

} else {

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  micButton.onclick = function () {

    statusDisplay.textContent = "LISTENING...";
    jarvisDisplay.textContent = "I'm listening, sir.";

    try {
      recognition.start();
    } catch (error) {
      console.log(error);
    }

  };

  recognition.onstart = function () {

    statusDisplay.textContent = "LISTENING...";

    jarvisDisplay.textContent =
      "Go ahead, sir.";

  };

  recognition.onresult = function (event) {

    const text =
      event.results[0][0].transcript;

    youDisplay.textContent = text;

    statusDisplay.textContent = "HEARD YOU";

   jarvisDisplay.textContent =
    "I heard: " + text;

console.log("You said:", text);

respond(text);
  };

  recognition.onerror = function (event) {

    statusDisplay.textContent =
      "ERROR: " + event.error;

    jarvisDisplay.textContent =
      "Microphone error: " + event.error;

    console.log(
      "Speech recognition error:",
      event.error
    );

  };

  recognition.onend = function () {

    statusDisplay.textContent =
      "READY";

  };

}
function respond(command) {
  command = command.toLowerCase().trim();

  let reply = "";

  if (command.includes("hello") || command.includes("hi")) {
    reply = "Hello, sir. How can I assist you?";
  }

  else if (command.includes("time")) {
    reply = "The time is " + new Date().toLocaleTimeString();
  }

  else if (command.includes("date") || command.includes("day")) {
    reply = "Today is " + new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  else if (command.includes("what can you do")) {
    reply = "I can tell you the time and date, calculate numbers, check the weather, start timers, use a stopwatch, and respond to your commands, sir.";
  }

  else {
    reply = "I heard you, sir, but I don't have a command for that yet.";
  }

  // Show JARVIS's response
  jarvisDisplay.textContent = reply;

  // Speak the response
  const speech = new SpeechSynthesisUtterance(reply);
  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}
