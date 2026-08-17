// =====================================================
// JARVIS V2 - STABLE VERSION
// =====================================================

// Find the elements from your existing HTML
const micButton = document.getElementById("micButton");

const statusDisplay =
    document.getElementById("statusDisplay") ||
    document.getElementById("status");

const youDisplay =
    document.getElementById("you");

const jarvisDisplay =
    document.getElementById("jarvis");

// =====================================================
// VARIABLES
// =====================================================

let recognition;
let listening = false;
let speaking = false;

let waitingForJarvis = true;

let lastCommand = "";

let timerID = null;

let stopwatchRunning = false;
let stopwatchStart = 0;
let stopwatchElapsed = 0;
let stopwatchID = null;


// =====================================================
// SPEECH RECOGNITION
// =====================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (!SpeechRecognition) {

    setStatus("VOICE NOT SUPPORTED");

    showJarvis(
        "Speech recognition isn't supported in this browser, sir."
    );

} else {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    // We handle restarting ourselves.
    recognition.continuous = false;

    recognition.interimResults = false;


    // =================================================
    // MICROPHONE BUTTON
    // =================================================

    if (micButton) {

        micButton.addEventListener("click", function () {

            startListening();
        });
    }


    // =================================================
    // START LISTENING
    // =================================================

    function startListening() {

        if (speaking || listening) {
            return;
        }

        try {

            recognition.start();

        } catch (error) {

            console.log("Already listening.");
        }
    }


    // =================================================
    // RECOGNITION START
    // =================================================

    recognition.onstart = function () {

        listening = true;

        if (waitingForJarvis) {

            setStatus("WAITING FOR JARVIS");

        } else {

            setStatus("LISTENING");
        }
    };


    // =================================================
    // RECOGNITION RESULT
    // =================================================

    recognition.onresult = function (event) {

        listening = false;

        const text =
            event.results[0][0].transcript
                .toLowerCase()
                .trim();

        console.log("Heard:", text);

        // ---------------------------------------------
        // WAITING FOR JARVIS
        // ---------------------------------------------

        if (waitingForJarvis) {

            if (text.includes("jarvis")) {

                waitingForJarvis = false;

                // Remove "jarvis" from the command.
                const command =
                    text
                        .replace("jarvis", "")
                        .trim();

                if (command.length === 0) {

                    showJarvis(
                        "I'm listening, sir."
                    );

                    setStatus("LISTENING");

                    // Give the user time to speak.
                    setTimeout(startListening, 500);

                } else {

                    processCommand(command);
                }

            } else {

                // Didn't hear Jarvis.
                setStatus("WAITING FOR JARVIS");

                setTimeout(startListening, 300);
            }

            return;
        }


        // ---------------------------------------------
        // JARVIS IS ALREADY AWAKE
        // ---------------------------------------------

        processCommand(text);
    };


    // =================================================
    // RECOGNITION ENDED
    // =================================================

    recognition.onend = function () {

        listening = false;

        if (!speaking) {

            setStatus(
                waitingForJarvis
                    ? "WAITING FOR JARVIS"
                    : "LISTENING"
            );

            setTimeout(startListening, 400);
        }
    };


    // =================================================
    // RECOGNITION ERROR
    // =================================================

    recognition.onerror = function (event) {

        listening = false;

        console.log(
            "Speech error:",
            event.error
        );

        if (event.error === "not-allowed") {

            setStatus("MICROPHONE BLOCKED");

            showJarvis(
                "Please allow microphone access, sir."
            );

            return;
        }

        if (!speaking) {

            setStatus("WAITING FOR JARVIS");

            setTimeout(startListening, 800);
        }
    };
}


// =====================================================
// PROCESS COMMAND
// =====================================================

function processCommand(command) {

    lastCommand = command;

    if (youDisplay) {

        youDisplay.textContent =
            "You: " + command;
    }

    setStatus("THINKING");

    respond(command);
}


// =====================================================
// JARVIS RESPONSE SYSTEM
// =====================================================

function respond(command) {

    command =
        command.toLowerCase().trim();

    let reply;


    // -------------------------------------------------
    // GREETINGS
    // -------------------------------------------------

    if (
        command === "hello" ||
        command === "hi" ||
        command === "hey" ||
        command.includes("hello jarvis")
    ) {

        reply =
            "Hello, sir. How can I assist you?";
    }


    // -------------------------------------------------
    // HOW ARE YOU
    // -------------------------------------------------

    else if (
        command.includes("how are you") ||
        command.includes("how are you doing")
    ) {

        reply =
            "I'm doing great, sir. All systems are operational.";
    }


    // -------------------------------------------------
    // WHAT ARE YOU DOING
    // -------------------------------------------------

    else if (
        command.includes("what are you doing")
    ) {

        reply =
            "I'm here and ready to help, sir.";
    }


    // -------------------------------------------------
    // WHO ARE YOU
    // -------------------------------------------------

    else if (
        command.includes("who are you") ||
        command.includes("what are you")
    ) {

        reply =
            "I am JARVIS, your personal voice assistant.";
    }


    // -------------------------------------------------
    // WHAT CAN YOU DO
    // -------------------------------------------------

    else if (
        command.includes("what can you do") ||
        command.includes("what do you do")
    ) {

        reply =
            "I can tell you the time and date, calculate numbers, check Twin Falls weather, run timers, use a stopwatch, convert units, tell jokes, play simple games, and have basic conversations.";
    }


    // -------------------------------------------------
    // THANK YOU
    // -------------------------------------------------

    else if (
        command.includes("thank you") ||
        command.includes("thanks")
    ) {

        reply =
            "You're welcome, sir.";
    }


    // -------------------------------------------------
    // ARE YOU THERE
    // -------------------------------------------------

    else if (
        command.includes("are you there") ||
        command.includes("you there")
    ) {

        reply =
            "Always, sir.";
    }


    // -------------------------------------------------
    // JOKE
    // -------------------------------------------------

    else if (
        command.includes("tell me a joke") ||
        command.includes("tell a joke") ||
        command === "joke"
    ) {

        reply =
            "Why did the computer go to the doctor? Because it had a virus.";
    }


    // -------------------------------------------------
    // ANOTHER JOKE
    // -------------------------------------------------

    else if (
        command.includes("another joke")
    ) {

        reply =
            "Why was the computer cold? It left its Windows open.";
    }


    // -------------------------------------------------
    // FACT
    // -------------------------------------------------

    else if (
        command.includes("tell me a fact") ||
        command.includes("tell me something interesting") ||
        command.includes("random fact")
    ) {

        reply =
            "Here's an interesting fact, sir. Octopuses have three hearts.";
    }


    // -------------------------------------------------
    // BORED
    // -------------------------------------------------

    else if (
        command.includes("i'm bored") ||
        command.includes("i am bored")
    ) {

        reply =
            "We can play a game, roll a die, flip a coin, or you can ask me something interesting, sir.";
    }


    // -------------------------------------------------
    // TIME
    // -------------------------------------------------

    else if (
        command.includes("what time is it") ||
        command.includes("what is the time") ||
        command === "time"
    ) {

        reply =
            "The time is " +
            new Date().toLocaleTimeString();
    }


    // -------------------------------------------------
    // DATE
    // -------------------------------------------------

    else if (
        command.includes("what day is it") ||
        command.includes("what date is it") ||
        command.includes("today's date")
    ) {

        reply =
            "Today is " +
            new Date().toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );
    }


    // -------------------------------------------------
    // CALCULATOR
    // -------------------------------------------------

    else if (
        command.startsWith("calculate ")
    ) {

        const result =
            calculate(command);

        if (result !== null) {

            reply =
                "The answer is " +
                result +
                ", sir.";

        } else {

            reply =
                "I couldn't calculate that, sir.";
        }
    }


    // -------------------------------------------------
    // TIMER
    // -------------------------------------------------

    else if (
        command.includes("set a timer") ||
        command.includes("set timer")
    ) {

        startTimer(command);

        return;
    }


    // -------------------------------------------------
    // STOPWATCH START
    // -------------------------------------------------

    else if (
        command.includes("start stopwatch") ||
        command.includes("start the stopwatch")
    ) {

        startStopwatch();

        return;
    }


    // -------------------------------------------------
    // STOPWATCH STOP
    // -------------------------------------------------

    else if (
        command.includes("stop stopwatch") ||
        command.includes("stop the stopwatch")
    ) {

        stopStopwatch();

        return;
    }


    // -------------------------------------------------
    // STOPWATCH RESET
    // -------------------------------------------------

    else if (
        command.includes("reset stopwatch") ||
        command.includes("reset the stopwatch")
    ) {

        resetStopwatch();

        return;
    }


    // -------------------------------------------------
    // COIN FLIP
    // -------------------------------------------------

    else if (
        command.includes("flip a coin") ||
        command.includes("flip coin")
    ) {

        reply =
            Math.random() < 0.5
                ? "Heads, sir."
                : "Tails, sir.";
    }


    // -------------------------------------------------
    // DICE
    // -------------------------------------------------

    else if (
        command.includes("roll a die") ||
        command.includes("roll a dice") ||
        command.includes("roll dice")
    ) {

        const number =
            Math.floor(Math.random() * 6) + 1;

        reply =
            "You rolled a " +
            number +
            ", sir.";
    }


    // -------------------------------------------------
    // ROCK PAPER SCISSORS
    // -------------------------------------------------

    else if (
        command.includes("rock paper scissors")
    ) {

        const choices =
            [
                "rock",
                "paper",
                "scissors"
            ];

        const choice =
            choices[
                Math.floor(
                    Math.random() * 3
                )
            ];

        reply =
            "I choose " +
            choice +
            ", sir.";
    }


    // -------------------------------------------------
    // CONVERSATION
    // -------------------------------------------------

    else if (
        command.includes("i'm bored") ||
        command.includes("i am bored")
    ) {

        reply =
            "Let's do something interesting, sir.";
    }


    // -------------------------------------------------
    // GOODBYE
    // -------------------------------------------------

    else if (
        command === "goodbye" ||
        command === "bye"
    ) {

        reply =
            "Goodbye, sir. Returning to standby.";
    }


    // -------------------------------------------------
    // UNKNOWN
    // -------------------------------------------------

    else {

        reply =
            "I heard you, sir, but I don't know how to answer that yet.";
    }


    speak(reply);
}


// =====================================================
// CALCULATOR
// =====================================================

function calculate(command) {

    let expression =
        command
            .replace(/^calculate\s*/i, "")
            .replace(/plus/g, "+")
            .replace(/minus/g, "-")
            .replace(/times/g, "*")
            .replace(/multiplied by/g, "*")
            .replace(/divided by/g, "/");

    // Only permit calculator characters.
    if (
        !/^[0-9+\-*/().%\s]+$/.test(expression)
    ) {

        return null;
    }

    try {

        const answer =
            Function(
                '"use strict"; return (' +
                expression +
                ')'
            )();

        if (
            typeof answer !== "number" ||
            !Number.isFinite(answer)
        ) {

            return null;
        }

        return answer;

    } catch (error) {

        console.log(error);

        return null;
    }
}


// =====================================================
// TIMER
// =====================================================

function startTimer(command) {

    const match =
        command.match(
            /(\d+)\s*(second|seconds|minute|minutes|hour|hours)/
        );

    if (!match) {

        speak(
            "Tell me how long you want the timer, sir."
        );

        return;
    }

    const amount =
        Number(match[1]);

    const unit =
        match[2];

    let milliseconds =
        amount * 1000;

    if (unit.includes("minute")) {

        milliseconds =
            amount * 60 * 1000;
    }

    if (unit.includes("hour")) {

        milliseconds =
            amount * 60 * 60 * 1000;
    }

    if (timerID) {

        clearTimeout(timerID);
    }

    timerID =
        setTimeout(function () {

            speak(
                "Sir, your timer is finished."
            );

        }, milliseconds);

    speak(
        "Timer set for " +
        amount +
        " " +
        unit +
        ", sir."
    );
}


// =====================================================
// STOPWATCH
// =====================================================

function startStopwatch() {

    if (stopwatchRunning) {

        speak(
            "The stopwatch is already running, sir."
        );

        return;
    }

    stopwatchRunning = true;

    stopwatchStart =
        Date.now() -
        stopwatchElapsed;

    stopwatchID =
        setInterval(
            updateStopwatch,
            100
        );

    speak(
        "Stopwatch started, sir."
    );
}


function stopStopwatch() {

    if (!stopwatchRunning) {

        speak(
            "The stopwatch isn't running, sir."
        );

        return;
    }

    stopwatchElapsed =
        Date.now() -
        stopwatchStart;

    stopwatchRunning = false;

    clearInterval(stopwatchID);

    speak(
        "Stopwatch stopped at " +
        formatStopwatch(stopwatchElapsed) +
        ", sir."
    );
}


function resetStopwatch() {

    stopwatchRunning = false;

    clearInterval(stopwatchID);

    stopwatchElapsed = 0;

    updateStopwatch();

    speak(
        "Stopwatch reset, sir."
    );
}


function updateStopwatch() {

    let elapsed =
        stopwatchElapsed;

    if (stopwatchRunning) {

        elapsed =
            Date.now() -
            stopwatchStart;
    }

    const text =
        formatStopwatch(elapsed);

    // Support either ID.
    const display =
        document.getElementById("stopwatch") ||
        document.getElementById("stopwatchDisplay");

    if (display) {

        display.textContent = text;
    }
}


function formatStopwatch(milliseconds) {

    const totalSeconds =
        Math.floor(
            milliseconds / 1000
        );

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const seconds =
        totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}


// =====================================================
// TWIN FALLS WEATHER
// =====================================================

async function getWeather() {

    setStatus("THINKING");

    try {

        const response =
            await fetch(
                "https://api.open-meteo.com/v1/forecast?latitude=42.56297&longitude=-114.46087&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FDenver"
            );

        if (!response.ok) {

            throw new Error(
                "Weather request failed"
            );
        }

        const data =
            await response.json();

        const current =
            data.current;

        const temperature =
            Math.round(
                current.temperature_2m
            );

        const wind =
            Math.round(
                current.wind_speed_10m
            );

        const condition =
            getWeatherDescription(
                current.weather_code
            );

        const reply =
            "In Twin Falls, Idaho, it is currently " +
            temperature +
            " degrees Fahrenheit with " +
            condition +
            ". Wind speed is around " +
            wind +
            " miles per hour, sir.";

        speak(reply);

    } catch (error) {

        console.log(
            "Weather error:",
            error
        );

        speak(
            "I couldn't get the Twin Falls weather right now, sir."
        );
    }
}


// =====================================================
// WEATHER COMMAND
// =====================================================

// This catches "weather" before the normal response system.
const originalRespond = respond;

respond = function(command) {

    if (
        command.includes("weather") ||
        command.includes("temperature outside")
    ) {

        getWeather();

        return;
    }

    originalRespond(command);
};


// =====================================================
// WEATHER DESCRIPTION
// =====================================================

function getWeatherDescription(code) {

    if (code === 0) {
        return "clear skies";
    }

    if (code === 1 || code === 2) {
        return "partly cloudy skies";
    }

    if (code === 3) {
        return "overcast skies";
    }

    if (code >= 51 && code <= 67) {
        return "rainy conditions";
    }

    if (code >= 71 && code <= 77) {
        return "snowy conditions";
    }

    if (code >= 80 && code <= 82) {
        return "rain showers";
    }

    if (code >= 95) {
        return "thunderstorms";
    }

    return "changing conditions";
}


// =====================================================
// SPEAK
// =====================================================

function speak(text) {

    speaking = true;

    setStatus("SPEAKING");

    showJarvis(text);

    // Stop recognition while speaking.
    if (recognition) {

        try {
            recognition.stop();
        } catch (error) {}
    }

    if (!window.speechSynthesis) {

        speaking = false;

        returnToWakeWord();

        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.rate = 0.95;
    speech.pitch = 0.9;
    speech.volume = 1;

    speech.onend = function() {

        speaking = false;

        returnToWakeWord();
    };

    window.speechSynthesis.speak(speech);
}


// =====================================================
// RETURN TO WAKE WORD
// =====================================================

function returnToWakeWord() {

    waitingForJarvis = true;

    setStatus("WAITING FOR JARVIS");

    setTimeout(function() {

        if (!speaking) {

            startListening();
        }

    }, 500);
}


// =====================================================
// DISPLAY HELPERS
// =====================================================

function setStatus(text) {

    if (statusDisplay) {

        statusDisplay.textContent = text;
    }
}


function showJarvis(text) {

    if (jarvisDisplay) {

        jarvisDisplay.textContent =
            text;
    }
}


// =====================================================
// START
// =====================================================

setStatus("PRESS MIC TO START");

showJarvis(
    'Press the microphone once, then say "Jarvis".'
);
