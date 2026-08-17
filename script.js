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
