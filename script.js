// ============================================================
// JARVIS - FULL VERSION
// ============================================================

// -------------------------
// HTML ELEMENTS
// -------------------------

const micButton = document.getElementById("micButton");

const statusDisplay =
    document.getElementById("statusDisplay") ||
    document.getElementById("status");

const youDisplay =
    document.getElementById("you");

const jarvisDisplay =
    document.getElementById("jarvis");


// -------------------------
// VARIABLES
// -------------------------

let recognition;
let listening = false;
let speaking = false;

let waitingForJarvis = true;

let lastCommand = "";
let commandHistory = [];

let timerID = null;

let stopwatchRunning = false;
let stopwatchStart = 0;
let stopwatchElapsed = 0;
let stopwatchID = null;


// ============================================================
// SPEECH RECOGNITION
// ============================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (!SpeechRecognition) {

    setStatus("VOICE NOT SUPPORTED");

    showJarvis(
        "Speech recognition is not supported in this browser, sir."
    );

} else {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;


    // --------------------------------------------------------
    // MICROPHONE BUTTON
    // --------------------------------------------------------

    if (micButton) {

        micButton.addEventListener("click", function () {

            startListening();

        });
    }


    // --------------------------------------------------------
    // START LISTENING
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // RECOGNITION START
    // --------------------------------------------------------

    recognition.onstart = function () {

        listening = true;

        if (waitingForJarvis) {

            setStatus("WAITING FOR JARVIS");

        } else {

            setStatus("LISTENING");

        }
    };


    // --------------------------------------------------------
    // RECOGNITION RESULT
    // --------------------------------------------------------

    recognition.onresult = function (event) {

        listening = false;

        const text =
            event.results[0][0].transcript
                .toLowerCase()
                .trim();

        console.log("Heard:", text);


        // ----------------------------------------------------
        // WAITING FOR JARVIS
        // ----------------------------------------------------

        if (waitingForJarvis) {

            if (text.includes("jarvis")) {

                waitingForJarvis = false;

                const command =
                    text
                        .replace("jarvis", "")
                        .trim();


                if (command.length === 0) {

                    showJarvis(
                        "I'm listening, sir."
                    );

                    setStatus("LISTENING");

                    setTimeout(
                        startListening,
                        500
                    );

                } else {

                    processCommand(command);

                }

            } else {

                setStatus("WAITING FOR JARVIS");

                setTimeout(
                    startListening,
                    300
                );
            }

            return;
        }


        // ----------------------------------------------------
        // JARVIS IS AWAKE
        // ----------------------------------------------------

        processCommand(text);
    };


    // --------------------------------------------------------
    // RECOGNITION END
    // --------------------------------------------------------

    recognition.onend = function () {

        listening = false;

        if (!speaking) {

            setStatus(
                waitingForJarvis
                    ? "WAITING FOR JARVIS"
                    : "LISTENING"
            );

            setTimeout(
                startListening,
                400
            );
        }
    };


    // --------------------------------------------------------
    // RECOGNITION ERROR
    // --------------------------------------------------------

    recognition.onerror = function (event) {

        listening = false;

        console.log(
            "Speech error:",
            event.error
        );


        if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
        ) {

            setStatus("MICROPHONE BLOCKED");

            showJarvis(
                "Please allow microphone access, sir."
            );

            return;
        }


        if (!speaking) {

            setStatus(
                "WAITING FOR JARVIS"
            );

            setTimeout(
                startListening,
                800
            );
        }
    };
}


// ============================================================
// PROCESS COMMAND
// ============================================================

function processCommand(command) {

    lastCommand = command;

    commandHistory.push(command);

    if (commandHistory.length > 10) {

        commandHistory.shift();
    }


    if (youDisplay) {

        youDisplay.textContent =
            "You: " + command;
    }


    setStatus("THINKING");

    respond(command);
}


// ============================================================
// RESPONSE SYSTEM
// ============================================================

function respond(command) {

    command =
        command.toLowerCase().trim();

    let reply = null;


    // ========================================================
    // GREETINGS
    // ========================================================

    if (
        command === "hello" ||
        command === "hi" ||
        command === "hey"
    ) {

        reply =
            getGreeting();
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
        command.includes("how are you") ||
        command.includes("how are you doing")
    ) {

        reply =
            "I'm doing great, sir. All systems are operational.";
    }


    else if (
        command.includes("what are you doing")
    ) {

        reply =
            "I'm here and ready to help, sir.";
    }


    else if (
        command.includes("are you there") ||
        command.includes("you there")
    ) {

        reply =
            "Always, sir.";
    }


    else if (
        command.includes("who are you")
    ) {

        reply =
            "I am JARVIS, your personal voice assistant.";
    }


    else if (
        command.includes("are you smart")
    ) {

        reply =
            "I'm getting smarter every time we upgrade me, sir.";
    }


    else if (
        command.includes("what do you think")
    ) {

        reply =
            "I think we should keep upgrading me, sir.";
    }


    else if (
        command.includes("do you like me")
    ) {

        reply =
            "You're my favorite user, sir.";
    }


    else if (
        command.includes("favorite color")
    ) {

        reply =
            "I'd say blue, sir. It looks rather appropriate for JARVIS.";
    }


    else if (
        command.includes("what can we do")
    ) {

        reply =
            "We can keep upgrading me, play games, calculate things, check the weather, or just have a conversation, sir.";
    }


    // ========================================================
    // WHAT CAN YOU DO
    // ========================================================

    else if (
        command.includes("what can you do") ||
        command.includes("what are your commands") ||
        command.includes("list your commands")
    ) {

        reply =
            "I can tell you the time and date, check Twin Falls weather, calculate numbers, run timers, control a stopwatch, convert units, flip coins, roll dice, play rock paper scissors, tell jokes and facts, remember commands, and have basic conversations.";
    }


    // ========================================================
    // THANK YOU
    // ========================================================

    else if (
        command.includes("thank you") ||
        command.includes("thanks")
    ) {

        reply =
            "You're welcome, sir.";
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
    // COMMAND HISTORY
    // ========================================================

    else if (
        command.includes("what have i asked you") ||
        command.includes("show my commands") ||
        command.includes("command history")
    ) {

        if (commandHistory.length === 0) {

            reply =
                "You haven't given me any commands yet, sir.";

        } else {

            const recent =
                commandHistory
                    .slice(-5)
                    .join(", ");

            reply =
                "Your recent commands were: " +
                recent +
                ".";
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

        getWeather();

        return;
    }


    // ========================================================
    // CALCULATOR
    // ========================================================

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


    // ========================================================
    // TIMER START
    // ========================================================

    else if (
        command.includes("set a timer") ||
        command.includes("set timer")
    ) {

        startTimer(command);

        return;
    }


    // ========================================================
    // TIMER STOP
    // ========================================================

    else if (
        command.includes("stop the timer") ||
        command.includes("cancel the timer") ||
        command.includes("stop timer") ||
        command.includes("cancel timer")
    ) {

        if (timerID) {

            clearTimeout(timerID);

            timerID = null;

            speak(
                "Timer cancelled, sir."
            );

        } else {

            speak(
                "There isn't an active timer, sir."
            );
        }

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
    // UNIT CONVERSION
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
    // COIN FLIP
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
        command.includes("roll a dice") ||
        command.includes("roll dice")
    ) {

        const roll =
            Math.floor(
                Math.random() * 6
            ) + 1;

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
            [
                "rock",
                "paper",
                "scissors"
            ];

        const computer =
            choices[
                Math.floor(
                    Math.random() * 3
                )
            ];

        reply =
            "I choose " +
            computer +
            ", sir.";
    }


    // ========================================================
    // JOKES
    // ========================================================

    else if (
        command.includes("tell me a joke") ||
        command.includes("tell a joke") ||
        command === "joke"
    ) {

        reply =
            getJoke();
    }


    else if (
        command.includes("another joke")
    ) {

        reply =
            getJoke();
    }


    // ========================================================
    // FACTS
    // ========================================================

    else if (
        command.includes("tell me a fact") ||
        command.includes("random fact") ||
        command.includes("tell me something interesting")
    ) {

        reply =
            getFact();
    }


    // ========================================================
    // BORED
    // ========================================================

    else if (
        command.includes("i'm bored") ||
        command.includes("i am bored")
    ) {

        reply =
            "Let's do something fun, sir. We can play a game, roll a die, flip a coin, or I can tell you a fact.";
    }


    // ========================================================
    // SHUTDOWN / STANDBY
    // ========================================================

    else if (
        command.includes("go to sleep") ||
        command.includes("standby") ||
        command.includes("shut down")
    ) {

        reply =
            "Entering standby mode, sir.";

        speak(reply);

        waitingForJarvis = true;

        return;
    }


    // ========================================================
    // WAKE UP
    // ========================================================

    else if (
        command.includes("wake up")
    ) {

        reply =
            "I'm awake, sir.";
    }


    // ========================================================
    // GOODBYE
    // ========================================================

    else if (
        command === "goodbye" ||
        command === "bye"
    ) {

        reply =
            "Goodbye, sir. Returning to standby.";
    }


    // ========================================================
    // UNKNOWN COMMAND
    // ========================================================

    else {

        reply =
            "I heard you, sir, but I don't know how to answer that yet.";
    }


    speak(reply);
}


// ============================================================
// GREETING
// ============================================================

function getGreeting() {

    const hour =
        new Date().getHours();

    if (hour < 12) {

        return (
            "Good morning, sir. " +
            "How can I assist you?"
        );
    }

    if (hour < 18) {

        return (
            "Good afternoon, sir. " +
            "How can I assist you?"
        );
    }

    return (
        "Good evening, sir. " +
        "How can I assist you?"
    );
}


// ============================================================
// JOKES
// ============================================================

function getJoke() {

    const jokes =
        [
            "Why did the computer go to the doctor? Because it had a virus.",

            "Why was the computer cold? It left its Windows open.",

            "Why did the computer get glasses? Because it couldn't see the website.",

            "What do computers eat for a snack? Microchips.",

            "Why was the keyboard tired? It had too many shifts."
        ];

    return jokes[
        Math.floor(
            Math.random() * jokes.length
        )
    ];
}


// ============================================================
// FACTS
// ============================================================

function getFact() {

    const facts =
        [
            "Octopuses have three hearts.",

            "A day on Venus is longer than a year on Venus.",

            "Honey can remain preserved for a very long time when stored properly.",

            "Lightning can heat the air around it to extremely high temperatures.",

            "Some turtles can breathe through specialized skin surfaces while underwater."
        ];

    return facts[
        Math.floor(
            Math.random() * facts.length
        )
    ];
}


// ============================================================
// CALCULATOR
// ============================================================

function calculate(command) {

    let expression =
        command
            .replace(
                /^calculate\s*/i,
                ""
            )
            .replace(
                /plus/g,
                "+"
            )
            .replace(
                /minus/g,
                "-"
            )
            .replace(
                /times/g,
                "*"
            )
            .replace(
                /multiplied by/g,
                "*"
            )
            .replace(
                /divided by/g,
                "/"
            );


    // Only allow calculator characters.
    if (
        !/^[0-9+\-*/().%\s]+$/.test(
            expression
        )
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


// ============================================================
// TIMER
// ============================================================

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


    if (
        unit.includes("minute")
    ) {

        milliseconds =
            amount * 60 * 1000;
    }


    if (
        unit.includes("hour")
    ) {

        milliseconds =
            amount *
            60 *
            60 *
            1000;
    }


    if (timerID) {

        clearTimeout(timerID);
    }


    timerID =
        setTimeout(
            function () {

                timerID = null;

                speak(
                    "Sir, your timer is finished."
                );

            },
            milliseconds
        );


    speak(
        "Timer set for " +
        amount +
        " " +
        unit +
        ", sir."
    );
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


    clearInterval(
        stopwatchID
    );


    speak(
        "Stopwatch stopped at " +
        formatStopwatch(
            stopwatchElapsed
        ) +
        ", sir."
    );
}


function resetStopwatch() {

    stopwatchRunning = false;

    clearInterval(
        stopwatchID
    );


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


    const display =
        document.getElementById(
            "stopwatch"
        );


    if (display) {

        display.textContent =
            formatStopwatch(
                elapsed
            );
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
        String(minutes)
            .padStart(2, "0") +
        ":" +
        String(seconds)
            .padStart(2, "0")
    );
}


// ============================================================
// UNIT CONVERSIONS
// ============================================================

function convertUnits(command) {

    let match;


    // Miles -> kilometers

    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*miles?\s*(?:to|into)\s*kilometers?/
        );


    if (match) {

        const miles =
            Number(match[1]);


        const kilometers =
            miles * 1.609344;


        return (
            miles +
            " miles is about " +
            kilometers.toFixed(2) +
            " kilometers, sir."
        );
    }


    // Kilometers -> miles

    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*kilometers?\s*(?:to|into)\s*miles?/
        );


    if (match) {

        const kilometers =
            Number(match[1]);


        const miles =
            kilometers / 1.609344;


        return (
            kilometers +
            " kilometers is about " +
            miles.toFixed(2) +
            " miles, sir."
        );
    }


    // Feet -> meters

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


    // Inches -> centimeters

    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*inches?\s*(?:to|into)\s*centimeters?/
        );


    if (match) {

        const inches =
            Number(match[1]);


        const centimeters =
            inches * 2.54;


        return (
            inches +
            " inches is about " +
            centimeters.toFixed(2) +
            " centimeters, sir."
        );
    }


    return null;
}


// ============================================================
// WEATHER - TWIN FALLS, IDAHO
// ============================================================

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


// ============================================================
// WEATHER DESCRIPTION
// ============================================================

function getWeatherDescription(code) {

    if (code === 0) {

        return "clear skies";
    }


    if (
        code === 1 ||
        code === 2
    ) {

        return "partly cloudy skies";
    }


    if (code === 3) {

        return "overcast skies";
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


    if (code >= 95) {

        return "thunderstorms";
    }


    return "changing conditions";
}


// ============================================================
// SPEAK
// ============================================================

function speak(text) {

    speaking = true;

    setStatus("SPEAKING");

    showJarvis(text);


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
        new SpeechSynthesisUtterance(
            text
        );


    speech.rate = 0.95;

    speech.pitch = 0.9;

    speech.volume = 1;


    speech.onend = function () {

        speaking = false;

        returnToWakeWord();
    };


    window.speechSynthesis.speak(
        speech
    );
}


// ============================================================
// RETURN TO WAKE WORD
// ============================================================

function returnToWakeWord() {

    waitingForJarvis = true;


    setStatus(
        "WAITING FOR JARVIS"
    );


    setTimeout(
        function () {

            if (!speaking) {

                startListening();
            }

        },
        500
    );
}


// ============================================================
// DISPLAY HELPERS
// ============================================================

function setStatus(text) {

    if (statusDisplay) {

        statusDisplay.textContent =
            text;
    }
}


function showJarvis(text) {

    if (jarvisDisplay) {

        jarvisDisplay.textContent =
            text;
    }
}


// ============================================================
// INITIAL SCREEN
// ============================================================

setStatus(
    "PRESS MIC TO START"
);


showJarvis(
    'Press the microphone once, then say "Jarvis".'
);
