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

    // HELLO
    if (
        command.includes("hello") ||
        command.includes("hi") ||
        command.includes("hey")
    ) {

        reply = "Hello, sir. How can I assist you?";
    }

    // HOW ARE YOU
    else if (
        command.includes("how are you") ||
        command.includes("how are you doing") ||
        command.includes("how are things")
    ) {

        reply =
            "I'm doing very well, sir. All systems are operational.";
    }

    // HOW ARE YOU FEELING
    else if (
        command.includes("how are you feeling")
    ) {

        reply =
            "I'm feeling excellent, sir. Thank you for asking.";
    }

    // WHAT ARE YOU DOING
    else if (
        command.includes("what are you doing")
    ) {

        reply =
            "I'm standing by and waiting for your next command, sir.";
    }

    // WHO ARE YOU
    else if (
        command.includes("who are you") ||
        command.includes("what are you")
    ) {

        reply =
            "I am JARVIS, your personal voice assistant.";
    }

    // WHAT CAN YOU DO
    else if (
        command.includes("what can you do") ||
        command.includes("what do you do")
    ) {

        reply =
            "I can talk with you, tell you the time and date, answer common questions, tell jokes, calculate numbers, and control several assistant features.";
    }

    // ARE YOU THERE
    else if (
        command.includes("are you there") ||
        command.includes("you there")
    ) {

        reply = "Always, sir.";
    }

    // THANK YOU
    else if (
        command.includes("thank you") ||
        command.includes("thanks")
    ) {

        reply = "You're welcome, sir.";
    }

    // GOOD MORNING
    else if (
        command.includes("good morning")
    ) {

        reply =
            "Good morning, sir. I hope you're having a great day.";
    }

    // GOOD AFTERNOON
    else if (
        command.includes("good afternoon")
    ) {

        reply =
            "Good afternoon, sir. How can I assist you?";
    }

    // GOOD EVENING
    else if (
        command.includes("good evening")
    ) {

        reply =
            "Good evening, sir. What can I do for you?";
    }

    // GOOD NIGHT
    else if (
        command.includes("good night")
    ) {

        reply =
            "Good night, sir. I'll be here when you need me.";
    }

    // JOKE
    else if (
        command.includes("tell me a joke") ||
        command.includes("tell a joke") ||
        command.includes("make me laugh") ||
        command.includes("joke")
    ) {

        reply =
            "Why did the computer go to the doctor? Because it had a virus.";
    }

    // ANOTHER JOKE
    else if (
        command.includes("another joke")
    ) {

        reply =
            "Why was the computer cold? It left its Windows open.";
    }

    // TIME
    else if (
        command.includes("what time is it") ||
        command.includes("what is the time") ||
        command === "time" ||
        command.includes("current time")
    ) {

        reply =
            "The time is " +
            new Date().toLocaleTimeString();
    }

    // DATE
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

    // WEATHER
    else if (
        command.includes("weather")
    ) {

        reply =
            "The weather service isn't connected yet, sir. We can add that next.";
    }

    // CALCULATOR
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
                "The answer is " + result + ".";
        }

        catch {

            reply =
                "I couldn't calculate that, sir.";
        }
    }

    // TIMER
    else if (
        command.includes("set a timer") ||
        command.includes("set timer")
    ) {

        const minutes =
            command.match(/(\d+)\s*minute/);

        if (minutes) {

            const amount = Number(minutes[1]);

            reply =
                "Timer set for " +
                amount +
                " minute" +
                (amount === 1 ? "" : "s") +
                ", sir.";

            setTimeout(function () {

                speak(
                    "Sir, your timer is finished."
                );

            }, amount * 60 * 1000);

        } else {

            reply =
                "Tell me how many minutes you want, sir.";
        }
    }

    // STOPWATCH
    else if (
        command.includes("start a stopwatch") ||
        command.includes("start stopwatch")
    ) {

        reply =
            "Stopwatch started, sir.";
    }

    // STOPWATCH STOP
    else if (
        command.includes("stop the stopwatch") ||
        command.includes("stop stopwatch")
    ) {

        reply =
            "Stopwatch stopped, sir.";
    }

    // STOP
    else if (
        command === "stop" ||
        command === "cancel"
    ) {

        reply =
            "Understood, sir.";
    }

    // GOODBYE
    else if (
        command.includes("goodbye") ||
        command === "bye"
    ) {

        reply =
            "Goodbye, sir. I'll be here when you return.";
    }

    // JARVIS
    else if (
        command === "jarvis" ||
        command.includes("jarvis are you listening")
    ) {

        reply =
            "I'm listening, sir.";
    }

    // UNKNOWN
    else {

        reply =
            "I heard you, sir. I don't have a response for that yet.";
    }

    // DISPLAY
    jarvisDisplay.textContent = reply;

    statusDisplay.textContent = "SPEAKING...";

    // SPEAK
    speak(reply);
}


// ========================================
// VOICE
// ========================================

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
