// ============================================================
// JARVIS V2
// ============================================================

// -------------------------
// HTML ELEMENTS
// -------------------------

const micButton = document.getElementById("micButton");
const statusDisplay = document.getElementById("statusDisplay");
const youDisplay = document.getElementById("you");
const jarvisDisplay = document.getElementById("jarvis");

// Optional displays.
// These won't cause errors if your HTML doesn't have them yet.
const clockDisplay = document.getElementById("clock");
const weatherDisplay =
    document.getElementById("weather") ||
    document.getElementById("weatherDisplay");
const timerDisplay = document.getElementById("timer");
const stopwatchDisplay = document.getElementById("stopwatch");

// -------------------------
// VARIABLES
// -------------------------

let lastCommand = "";
let timerTimeout = null;

let stopwatchRunning = false;
let stopwatchStart = 0;
let stopwatchElapsed = 0;
let stopwatchInterval = null;

let waitingForWakeWord = true;
let jarvisAwake = false;
let isSpeaking = false;

// ============================================================
// SPEECH RECOGNITION
// ============================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

if (!SpeechRecognition) {

    if (statusDisplay) {
        statusDisplay.textContent = "VOICE NOT SUPPORTED";
    }

    if (jarvisDisplay) {
        jarvisDisplay.textContent =
            "Speech recognition isn't supported in this browser, sir.";
    }

} else {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    // -------------------------
    // START LISTENING
    // -------------------------

    function startListening() {

        if (!recognition || isSpeaking) {
            return;
        }

        try {
            recognition.start();
        } catch (error) {
            // Already listening.
        }
    }

    // -------------------------
    // MICROPHONE BUTTON
    // -------------------------

    if (micButton) {

        micButton.addEventListener("click", function () {

            waitingForWakeWord = true;
            jarvisAwake = false;

            setStatus("WAITING FOR JARVIS");

            startListening();
        });
    }

    // -------------------------
    // RECOGNITION START
    // -------------------------

    recognition.onstart = function () {

        if (!isSpeaking) {

            if (waitingForWakeWord) {
                setStatus("WAITING FOR JARVIS");
            } else {
                setStatus("LISTENING");
            }
        }
    };

    // -------------------------
    // RECOGNITION RESULT
    // -------------------------

    recognition.onresult = function (event) {

        if (isSpeaking) {
            return;
        }

        let finalText = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const transcript =
                event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalText += transcript;
            }
        }

        if (!finalText) {
            return;
        }

        const text =
            finalText.toLowerCase().trim();

        console.log("Heard:", text);

        // -------------------------
        // WAITING FOR "JARVIS"
        // -------------------------

        if (waitingForWakeWord) {

            if (
                text.includes("jarvis") ||
                text.includes("jarvis.")
            ) {

                waitingForWakeWord = false;
                jarvisAwake = true;

                setStatus("LISTENING");

                // Remove the wake word.
                const command =
                    text
                        .replace(/jarvis/g, "")
                        .trim();

                if (command.length > 0) {

                    processCommand(command);

                } else {

                    if (jarvisDisplay) {
                        jarvisDisplay.textContent =
                            "I'm listening, sir.";
                    }
                }
            }

            return;
        }

        // -------------------------
        // JARVIS IS AWAKE
        // -------------------------

        processCommand(text);
    };

    // -------------------------
    // RECOGNITION END
    // -------------------------

    recognition.onend = function () {

        if (!isSpeaking) {

            // Automatically restart so JARVIS keeps waiting.
            setTimeout(function () {
                startListening();
            }, 300);
        }
    };

    // -------------------------
    // RECOGNITION ERROR
    // -------------------------

    recognition.onerror = function (event) {

        console.log(
            "Recognition error:",
            event.error
        );

        if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
        ) {

            setStatus("MICROPHONE BLOCKED");

            if (jarvisDisplay) {
                jarvisDisplay.textContent =
                    "Microphone permission is blocked, sir.";
            }

            return;
        }

        if (!isSpeaking) {
            setStatus("WAITING FOR JARVIS");
        }
    };
}


// ============================================================
// COMMAND PROCESSOR
// ============================================================

function processCommand(command) {

    lastCommand = command;

    if (youDisplay) {
        youDisplay.textContent =
            "You: " + command;
    }

    setStatus("THINKING");

    respond(command);
}


// ============================================================
// MAIN RESPONSE SYSTEM
// ============================================================

function respond(command) {

    command =
        command.toLowerCase().trim();

    let reply = "";

    // ========================================================
    // GREETINGS
    // ========================================================

    if (
        command === "hello" ||
        command === "hi" ||
        command === "hey"
    ) {

        reply =
            "Hello, sir. How can I assist you?";
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
            "Good night, sir. I'll be here when you need me.";
    }

    // ========================================================
    // BASIC CONVERSATION
    // ========================================================

    else if (
        command.includes("how are you")
    ) {

        reply =
            "I'm doing very well, sir. All systems are operational.";
    }

    else if (
        command.includes("what are you doing")
    ) {

        reply =
            "I'm right here, sir, waiting for your next command.";
    }

    else if (
        command.includes("are you there")
    ) {

        reply =
            "Always, sir.";
    }

    else if (
        command.includes("who are you") ||
        command.includes("what are you")
    ) {

        reply =
            "I am JARVIS, your personal voice assistant.";
    }

    else if (
        command.includes("thank you") ||
        command.includes("thanks")
    ) {

        reply =
            "You're welcome, sir.";
    }

    else if (
        command.includes("i'm bored") ||
        command.includes("i am bored")
    ) {

        reply =
            "I have several things we can do, sir. You could ask me for a joke, trivia, a game, or something interesting.";
    }

    else if (
        command.includes("tell me something interesting") ||
        command.includes("tell me a fact") ||
        command.includes("random fact") ||
        command.includes("trivia")
    ) {

        reply =
            "Octopuses have three hearts, sir.";
    }

    // ========================================================
    // WHAT CAN YOU DO
    // ========================================================

    else if (
        command.includes("what can you do") ||
        command.includes("what are your capabilities")
    ) {

        reply =
            "I can tell you the time and date, check Twin Falls weather, calculate numbers, run timers and a stopwatch, convert units, play simple games, tell jokes and facts, remember your last command, and have basic conversations.";
    }

    // ========================================================
    // LAST COMMAND
    // ========================================================

    else if (
        command.includes("what was my last command") ||
        command.includes("what did i just say")
    ) {

        if (lastCommand) {

            reply =
                "Your last command was: " +
                lastCommand +
                ", sir.";

        } else {

            reply =
                "You haven't given me a command yet, sir.";
        }
    }

    // ========================================================
    // TIME
    // ========================================================

    else if (
        command.includes("what time is it") ||
        command.includes("what is the time") ||
        command === "time"
    ) {

        reply =
            "The time is " +
            new Date().toLocaleTimeString();
    }

    // ========================================================
    // DATE
    // ========================================================

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

    // ========================================================
    // WEATHER
    // ========================================================

    else if (
        command.includes("weather") ||
        command.includes("temperature outside") ||
        command.includes("how hot is it") ||
        command.includes("how cold is it")
    ) {

        getTwinFallsWeather();

        return;
    }

    // ========================================================
    // CALCULATOR
    // ========================================================

    else if (
        command.startsWith("calculate") ||
        command.startsWith("what is")
    ) {

        const result =
            calculateExpression(command);

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

    // ========================================================
    // TIMER
    // ========================================================

    else if (
        command.includes("set a timer") ||
        command.includes("set timer") ||
        command.includes("timer for")
    ) {

        startTimer(command);

        return;
    }

    // ========================================================
    // STOPWATCH START
    // ========================================================

    else if (
        command.includes("start stopwatch") ||
        command.includes("start the stopwatch")
    ) {

        startStopwatch();

        return;
    }

    // ========================================================
    // STOPWATCH STOP
    // ========================================================

    else if (
        command.includes("stop stopwatch") ||
        command.includes("stop the stopwatch")
    ) {

        stopStopwatch();

        return;
    }

    // ========================================================
    // STOPWATCH RESET
    // ========================================================

    else if (
        command.includes("reset stopwatch") ||
        command.includes("reset the stopwatch")
    ) {

        resetStopwatch();

        return;
    }

    // ========================================================
    // CONVERSIONS
    // ========================================================

    else if (
        command.includes("convert")
    ) {

        const conversion =
            convertUnits(command);

        if (conversion) {

            reply =
                conversion;

        } else {

            reply =
                "I couldn't figure out that conversion, sir.";
        }
    }

    // ========================================================
    // COIN
    // ========================================================

    else if (
        command.includes("flip a coin") ||
        command.includes("flip coin")
    ) {

        reply =
            Math.random() < 0.5
                ? "Heads, sir."
                : "Tails, sir.";
    }

    // ========================================================
    // DICE
    // ========================================================

    else if (
        command.includes("roll a die") ||
        command.includes("roll dice") ||
        command.includes("roll a dice")
    ) {

        const roll =
            Math.floor(Math.random() * 6) + 1;

        reply =
            "You rolled a " +
            roll +
            ", sir.";
    }

    // ========================================================
    // ROCK PAPER SCISSORS
    // ========================================================

    else if (
        command.includes("rock paper scissors")
    ) {

        const choices =
            ["rock", "paper", "scissors"];

        const choice =
            choices[
                Math.floor(
                    Math.random() * choices.length
                )
            ];

        reply =
            "I choose " +
            choice +
            ", sir.";
    }

    // ========================================================
    // JOKE
    // ========================================================

    else if (
        command.includes("tell me a joke") ||
        command.includes("tell a joke") ||
        command === "joke"
    ) {

        reply =
            "Why did the computer go to the doctor? Because it had a virus.";
    }

    // ========================================================
    // GOODBYE
    // ========================================================

    else if (
        command === "goodbye" ||
        command === "bye"
    ) {

        reply =
            "Goodbye, sir. I'll return to standby.";
    }

    // ========================================================
    // UNKNOWN
    // ========================================================

    else {

        reply =
            "I heard you, sir. I'm still learning how to respond to that.";
    }

    speak(reply);
}


// ============================================================
// SPEAK
// ============================================================

function speak(text) {

    isSpeaking = true;

    if (recognition) {

        try {
            recognition.stop();
        } catch (error) {}
    }

    setStatus("SPEAKING");

    if (jarvisDisplay) {
        jarvisDisplay.textContent =
            "JARVIS: " + text;
    }

    if (!window.speechSynthesis) {

        isSpeaking = false;
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    const voices =
        window.speechSynthesis.getVoices();

    const preferredVoice =
        voices.find(
            voice =>
                voice.name.includes("Google US English")
        ) ||
        voices.find(
            voice =>
                voice.lang === "en-US"
        );

    if (preferredVoice) {
        speech.voice = preferredVoice;
    }

    speech.rate = 0.95;
    speech.pitch = 0.9;
    speech.volume = 1;

    speech.onend = function () {

        isSpeaking = false;
        jarvisAwake = false;
        waitingForWakeWord = true;

        setStatus("WAITING FOR JARVIS");

        // Start listening again.
        setTimeout(function () {

            if (recognition) {

                try {
                    recognition.start();
                } catch (error) {}
            }

        }, 400);
    };

    window.speechSynthesis.speak(speech);
}


// ============================================================
// STATUS
// ============================================================

function setStatus(text) {

    if (statusDisplay) {
        statusDisplay.textContent = text;
    }
}


// ============================================================
// CLOCK
// ============================================================

function updateClock() {

    if (clockDisplay) {

        clockDisplay.textContent =
            new Date().toLocaleTimeString();
    }
}

setInterval(updateClock, 1000);
updateClock();


// ============================================================
// CALCULATOR
// ============================================================

function calculateExpression(command) {

    let expression =
        command
            .replace(/^calculate/, "")
            .replace(/^what is/, "")
            .trim();

    expression =
        expression
            .replace(/plus/g, "+")
            .replace(/minus/g, "-")
            .replace(/times/g, "*")
            .replace(/multiplied by/g, "*")
            .replace(/divided by/g, "/")
            .replace(/over/g, "/")
            .replace(/x/g, "*");

    // Only allow calculator characters.
    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
        return null;
    }

    try {

        const result =
            Function(
                '"use strict"; return (' +
                expression +
                ')'
            )();

        if (
            typeof result !== "number" ||
            !Number.isFinite(result)
        ) {
            return null;
        }

        return result;

    } catch {

        return null;
    }
}


// ============================================================
// TIMER
// ============================================================

function startTimer(command) {

    const match =
        command.match(
            /(\d+(?:\.\d+)?)\s*(second|seconds|minute|minutes|hour|hours)/
        );

    if (!match) {

        speak(
            "Tell me the amount of time for the timer, sir."
        );

        return;
    }

    const amount =
        Number(match[1]);

    const unit =
        match[2];

    let milliseconds = amount * 1000;

    if (unit.includes("minute")) {
        milliseconds = amount * 60 * 1000;
    }

    if (unit.includes("hour")) {
        milliseconds = amount * 60 * 60 * 1000;
    }

    if (timerTimeout) {
        clearTimeout(timerTimeout);
    }

    speak(
        "Timer set for " +
        amount +
        " " +
        unit +
        ", sir."
    );

    timerTimeout =
        setTimeout(function () {

            speak(
                "Sir, your timer is finished."
            );

        }, milliseconds);
}


// ============================================================
// STOPWATCH
// ============================================================

function startStopwatch() {

    if (stopwatchRunning) {

        speak(
            "The stopwatch is already running, sir."
        );

        return;
    }

    stopwatchRunning = true;
    stopwatchStart =
        Date.now() - stopwatchElapsed;

    stopwatchInterval =
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

    stopwatchRunning = false;

    stopwatchElapsed =
        Date.now() - stopwatchStart;

    clearInterval(stopwatchInterval);

    speak(
        "Stopwatch stopped at " +
        formatTime(stopwatchElapsed) +
        ", sir."
    );
}


function resetStopwatch() {

    stopwatchRunning = false;

    clearInterval(stopwatchInterval);

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
            Date.now() - stopwatchStart;
    }

    const formatted =
        formatTime(elapsed);

    if (stopwatchDisplay) {

        stopwatchDisplay.textContent =
            formatted;
    }
}


function formatTime(milliseconds) {

    const totalSeconds =
        Math.floor(milliseconds / 1000);

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}


// ============================================================
// UNIT CONVERSIONS
// ============================================================

function convertUnits(command) {

    let match;

    // Miles → kilometers
    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*miles?\s*(?:to|into)\s*kilometers?/
        );

    if (match) {

        const miles =
            Number(match[1]);

        const km =
            miles * 1.609344;

        return (
            miles +
            " miles is about " +
            km.toFixed(2) +
            " kilometers, sir."
        );
    }

    // Kilometers → miles
    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*kilometers?\s*(?:to|into)\s*miles?/
        );

    if (match) {

        const km =
            Number(match[1]);

        const miles =
            km / 1.609344;

        return (
            km +
            " kilometers is about " +
            miles.toFixed(2) +
            " miles, sir."
        );
    }

    // Feet → meters
    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*feet?\s*(?:to|into)\s*meters?/
        );

    if (match) {

        const feet =
            Number(match[1]);

        const meters =
            feet * 0.3048;

        return (
            feet +
            " feet is about " +
            meters.toFixed(2) +
            " meters, sir."
        );
    }

    // Inches → centimeters
    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*inches?\s*(?:to|into)\s*centimeters?/
        );

    if (match) {

        const inches =
            Number(match[1]);

        const cm =
            inches * 2.54;

        return (
            inches +
            " inches is about " +
            cm.toFixed(2) +
            " centimeters, sir."
        );
    }

    return null;
}


// ============================================================
// TWIN FALLS WEATHER
// ============================================================

async function getTwinFallsWeather() {

    setStatus("THINKING");

    const latitude = 42.56297;
    const longitude = -114.46087;

    try {

        const url =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + latitude +
            "&longitude=" + longitude +
            "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
            "&temperature_unit=fahrenheit" +
            "&wind_speed_unit=mph" +
            "&timezone=America%2FDenver";

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data =
            await response.json();

        const current =
            data.current;

        const temperature =
            Math.round(
                current.temperature_2m
            );

        const humidity =
            Math.round(
                current.relative_humidity_2m
            );

        const wind =
            Math.round(
                current.wind_speed_10m
            );

        const condition =
            weatherDescription(
                current.weather_code
            );

        const weatherText =
            "Twin Falls, Idaho is currently " +
            temperature +
            " degrees Fahrenheit with " +
            condition +
            ". Humidity is " +
            humidity +
            " percent and winds are around " +
            wind +
            " miles per hour, sir.";

        if (weatherDisplay) {

            weatherDisplay.textContent =
                temperature +
                "°F • " +
                condition;
        }

        speak(weatherText);

    } catch (error) {

        console.log(error);

        speak(
            "I couldn't retrieve the Twin Falls weather right now, sir."
        );
    }
}


// ============================================================
// WEATHER DESCRIPTION
// ============================================================

function weatherDescription(code) {

    if (code === 0) {
        return "clear skies";
    }

    if (code === 1 || code === 2) {
        return "partly cloudy skies";
    }

    if (code === 3) {
        return "overcast skies";
    }

    if (
        code === 45 ||
        code === 48
    ) {
        return "foggy conditions";
    }

    if (
        code >= 51 &&
        code <= 67
    ) {
        return "rainy conditions";
    }

    if (
        code >= 71 &&
        code <= 77
    ) {
        return "snowy conditions";
    }

    if (
        code >= 80 &&
        code <= 82
    ) {
        return "rain showers";
    }

    if (
        code >= 95
    ) {
        return "thunderstorms";
    }

    return "changing conditions";
}


// ============================================================
// START JARVIS
// ============================================================

setStatus("WAITING FOR JARVIS");

if (jarvisDisplay) {

    jarvisDisplay.textContent =
        "Say \"Jarvis\" when you're ready, sir.";
}

// Start waiting automatically.
if (recognition) {

    setTimeout(function () {

        try {
            recognition.start();
        } catch (error) {}

    }, 1000);
}
