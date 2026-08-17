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
        jarvisDisplay.textContent = "Go ahead, sir.";
    };

    recognition.onresult = function (event) {

        const text = event.results[0][0].transcript;

        youDisplay.textContent = text;
        statusDisplay.textContent = "THINKING...";

        console.log("You said:", text);

        respond(text);
    };

    recognition.onerror = function (event) {

        statusDisplay.textContent =
            "ERROR: " + event.error;

        jarvisDisplay.textContent =
            "Microphone error: " + event.error;

        console.log("Speech recognition error:", event.error);
    };

    recognition.onend = function () {

        if (statusDisplay.textContent !== "SPEAKING...") {
            statusDisplay.textContent = "READY";
        }
    };
}


// ========================================
// JARVIS RESPONSE SYSTEM
// ========================================

function respond(command) {
    command = command.toLowerCase().trim();

    let reply = "";

    if (command.includes("how are you")) {
        reply = "I'm doing great, sir. All systems are operational.";
    }

    else if (command.includes("tell me a joke") || command.includes("joke")) {
        reply = "Why did the computer go to the doctor? Because it had a virus.";
    }

    else if (command.includes("hello") || command.includes("hi") || command.includes("hey")) {
        reply = "Hello, sir. How can I assist you?";
    }

    else if (command.includes("who are you")) {
        reply = "I am JARVIS, your personal voice assistant.";
    }

    else if (command.includes("what can you do")) {
        reply = "I can tell you the time and date, have conversations, tell jokes, calculate numbers, and more.";
    }

    else if (command.includes("thank you") || command.includes("thanks")) {
        reply = "You're welcome, sir.";
    }

    else if (command.includes("what are you doing")) {
        reply = "I'm right here waiting for your next command, sir.";
    }

    else if (command.includes("are you there")) {
        reply = "Always, sir.";
    }

    else if (command.includes("what time is it") || command.includes("what is the time")) {
        reply = "The time is " + new Date().toLocaleTimeString();
    }

    else if (command.includes("what day is it") || command.includes("what date is it")) {
        reply = "Today is " + new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    }

    else {
        reply = "I heard you, sir. I'm still learning how to respond to that.";
    }

    jarvisDisplay.textContent = reply;
    statusDisplay.textContent = "SPEAKING...";

    speak(reply);
}


function speak(text) {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onend = function () {
        statusDisplay.textContent = "READY";
    };

    window.speechSynthesis.speak(speech);
}
