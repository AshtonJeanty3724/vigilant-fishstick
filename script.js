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

    // -------------------------
    // MICROPHONE BUTTON
    // -------------------------

    micButton.onclick = function () {

        statusDisplay.textContent = "LISTENING...";
        jarvisDisplay.textContent = "I'm listening, sir.";

        try {
            recognition.start();
        } catch (error) {
            console.log(error);
        }
    };

    // -------------------------
    // WHEN LISTENING STARTS
    // -------------------------

    recognition.onstart = function () {

        statusDisplay.textContent = "LISTENING...";

        jarvisDisplay.textContent =
            "Go ahead, sir.";
    };

    // -------------------------
    // WHEN JARVIS HEARS YOU
    // -------------------------

    recognition.onresult = function (event) {

        const text =
            event.results[0][0].transcript;

        youDisplay.textContent = text;

        statusDisplay.textContent = "THINKING...";

        console.log("You said:", text);

        respond(text);
    };

    // -------------------------
    // MICROPHONE ERROR
    // -------------------------

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

    // -------------------------
    // LISTENING FINISHED
    // -------------------------

    recognition.onend = function () {

        statusDisplay.textContent = "READY";
    };
}


// ==================================================
// JARVIS RESPONSE SYSTEM
// ==================================================

function respond(command) {

    command = command.toLowerCase().trim();

    let reply = "";

    // -------------------------
    // GREETINGS
    // -------------------------

    if (
        command.includes("hello") ||
        command.includes("hi") ||
        command.includes("hey")
    ) {

        reply =
            "Hello, sir. It's good to hear from you.";
    }

    else if (
        command.includes("good morning")
    ) {

        reply =
            "Good morning, sir. How can I assist you?";
    }

    else if (
        command.includes("good afternoon")
    ) {

        reply =
            "Good afternoon, sir. What can I do for you?";
    }

    else if (
        command.includes("good evening")
    ) {

        reply =
            "Good evening, sir. How can I assist you?";
    }

    else if (
        command.includes("good night")
    ) {

        reply =
            "Good night, sir. Have a good rest.";
    }

    // -------------------------
    // HOW ARE YOU
    // -------------------------

    else if (
        command.includes("how are you") ||
        command.includes("how are you doing")
    ) {

        reply =
            "I'm doing well, sir. All systems are operational.";
    }

    // -------------------------
    // WHO ARE YOU
    // -------------------------

    else if (
        command.includes("who are you") ||
        command.includes("what are you")
    ) {

        reply =
            "I am JARVIS, your personal voice assistant.";
    }

    // -------------------------
    // WHAT CAN YOU DO
    // -------------------------

    else if (
        command.includes("what can you do") ||
        command.includes("what do you do")
    ) {

        reply =
            "I can talk with you, tell you the time and date, calculate numbers, and respond to many different commands.";
    }

    // -------------------------
    // THANK YOU
    // -------------------------

    else if (
        command.includes("thank you") ||
        command.includes("thanks")
    ) {

        reply =
            "You're welcome, sir.";
    }

    // -------------------------
    // YOU'RE WELCOME
    // -------------------------

    else if (
        command.includes("you're welcome")
    ) {

        reply =
            "Indeed, sir.";
    }

    // -------------------------
    // TIME
    // -------------------------

    else if (
        command.includes("what time is it") ||
        command === "time" ||
        command.includes("current time")
    ) {

        reply =
            "The time is " +
            new Date().toLocaleTimeString();
    }

    // -------------------------
    // DATE
    // -------------------------

    else if (
        command.includes("what day is it") ||
        command.includes("what is today's date") ||
        command.includes("what date is it")
    ) {

        reply =
            "Today is " +
            new Date().toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );
    }

    // -------------------------
    // JOKES
    // -------------------------

    else if (
        command.includes("tell me a joke") ||
        command.includes("make me laugh")
    ) {

        reply =
            "Why did the computer go to the doctor? Because it had a virus.";
    }

    // -------------------------
    // WHAT ARE YOU DOING
    // -------------------------

    else if (
        command.includes("what are you doing")
    ) {

        reply =
            "I'm right here, sir, waiting for your next command.";
    }

    // -------------------------
    // ARE YOU THERE
    // -------------------------

    else if (
        command.includes("are you there") ||
        command.includes("you there")
    ) {

        reply =
            "Always, sir.";
    }

    // -------------------------
    // WAKE / ATTENTION
    // -------------------------

    else if (
        command === "jarvis" ||
        command.includes("jarvis are you listening")
    ) {

        reply =
            "I'm listening, sir.";
    }

    // -------------------------
    // CALCULATOR
    // -------------------------

    else if (
        command.startsWith("calculate")
    ) {

        let expression =
            command.replace("calculate", "").trim();

        try {

            expression = expression
                .replace(/plus/g, "+")
                .replace(/minus/g, "-")
                .replace(/times/g, "*")
                .replace(/multiplied by/g, "*")
                .replace(/divided by/g, "/");

            const result = Function(
                '"use strict"; return (' +
                expression +
                ')'
            )();

            reply =
                "The answer is " + result;

        } catch {

            reply =
                "I couldn't calculate that, sir.";
        }
    }

    // -------------------------
    // WEATHER
    // -------------------------

    else if (
        command.includes("weather")
    ) {

        reply =
            "I can check the weather once the weather service is connected, sir.";
    }

    // -------------------------
    // TIMER
    // -------------------------

    else if (
        command.includes("set a timer") ||
        command.includes("set timer")
    ) {

        const minutes =
            command.match(/(\d+)\s*minute/);

        if (minutes) {

            const amount =
                Number(minutes[1]);

            reply =
                "Timer set for " +
                amount +
                " minute" +
                (amount === 1 ? "" : "s") +
                ", sir.";

            setTimeout(function () {

                speak("Sir, your timer is finished.");

            }, amount * 60 * 1000);

        } else {

            reply =
                "Tell me how many minutes you want, sir.";
        }
    }

    // -------------------------
    // STOPWATCH
    // -------------------------

    else if (
        command.includes("start a stopwatch") ||
        command.includes("start stopwatch")
    ) {

        reply =
            "Stopwatch started, sir.";
    }

    // -------------------------
    // GOODBYE
    // -------------------------

    else if (
        command.includes("goodbye") ||
        command.includes("bye")
    ) {

        reply =
            "Goodbye, sir. I'll be here when you return.";
    }

    // -------------------------
    // UNKNOWN COMMAND
    // -------------------------

    else {

        reply =
            "I'm not sure about that yet, sir, but I'm learning.";
    }

    // -------------------------
    // DISPLAY RESPONSE
    // -------------------------

    jarvisDisplay.textContent = reply;

    statusDisplay.textContent = "SPEAKING...";

    // -------------------------
    // SPEAK RESPONSE
    // -------------------------

    speak(reply);
}


// ==================================================
// TEXT TO SPEECH
// ==================================================

function speak(text) {

    if (!window.speechSynthesis) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onend = function () {

        statusDisplay.textContent = "READY";
    };

    window.speechSynthesis.speak(speech);
}
