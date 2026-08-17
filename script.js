// ============================================================
//                    J.A.R.V.I.S. FULL BUILD
// ============================================================

// ============================================================
// ELEMENTS
// ============================================================

const micButton =
    document.getElementById("micButton");

const statusDisplay =
    document.getElementById("statusDisplay") ||
    document.getElementById("status");

const youDisplay =
    document.getElementById("you");

const jarvisDisplay =
    document.getElementById("jarvis");


// ============================================================
// VARIABLES
// ============================================================

let recognition = null;

let listening = false;
let speaking = false;

let waitingForJarvis = true;
let standbyMode = false;

let lastCommand = "";
let commandHistory = [];

let timerID = null;
let timerEndTime = null;

let stopwatchRunning = false;
let stopwatchStart = 0;
let stopwatchElapsed = 0;
let stopwatchID = null;

let alarmID = null;

let selectedVoice = null;

let notes = [];


// ============================================================
// LOAD SAVED DATA
// ============================================================

try {

    commandHistory =
        JSON.parse(
            localStorage.getItem(
                "jarvisHistory"
            )
        ) || [];

} catch (error) {

    commandHistory = [];
}


try {

    notes =
        JSON.parse(
            localStorage.getItem(
                "jarvisNotes"
            )
        ) || [];

} catch (error) {

    notes = [];
}


// ============================================================
// SPEECH RECOGNITION
// ============================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;


    recognition.onstart = function () {

        listening = true;

        if (standbyMode) {

            setStatus("STANDBY");

        } else if (waitingForJarvis) {

            setStatus(
                "WAITING FOR JARVIS"
            );

        } else {

            setStatus("LISTENING");
        }
    };


    recognition.onresult =
        function (event) {

            listening = false;

            const text =
                event.results[0][0]
                    .transcript
                    .toLowerCase()
                    .trim();

            console.log(
                "JARVIS heard:",
                text
            );


            // --------------------------------------------
            // STANDBY
            // --------------------------------------------

            if (standbyMode) {

                if (
                    text.includes("jarvis") ||
                    text.includes("wake up")
                ) {

                    standbyMode = false;

                    waitingForJarvis = false;

                    speak(
                        "I'm awake, sir."
                    );

                } else {

                    restartListening();
                }

                return;
            }


            // --------------------------------------------
            // WAKE WORD
            // --------------------------------------------

            if (waitingForJarvis) {

                if (
                    text.includes("jarvis")
                ) {

                    waitingForJarvis = false;

                    const command =
                        text
                            .replace(
                                "jarvis",
                                ""
                            )
                            .trim();


                    if (command.length === 0) {

                        speak(
                            "I'm listening, sir."
                        );

                    } else {

                        processCommand(
                            command
                        );
                    }

                } else {

                    restartListening();
                }

                return;
            }


            processCommand(text);
        };


    recognition.onend = function () {

        listening = false;

        if (
            !speaking &&
            !standbyMode
        ) {

            restartListening();
        }
    };


    recognition.onerror =
        function (event) {

            listening = false;

            console.log(
                "Voice error:",
                event.error
            );


            if (
                event.error ===
                    "not-allowed" ||
                event.error ===
                    "service-not-allowed"
            ) {

                setStatus(
                    "MICROPHONE BLOCKED"
                );

                showJarvis(
                    "Please allow microphone access, sir."
                );

                return;
            }


            if (!speaking) {

                setTimeout(
                    restartListening,
                    800
                );
            }
        };
}


// ============================================================
// MICROPHONE BUTTON
// ============================================================

if (micButton) {

    micButton.addEventListener(
        "click",
        function () {

            startListening();

        }
    );
}


// ============================================================
// START LISTENING
// ============================================================

function startListening() {

    if (
        !recognition ||
        listening ||
        speaking
    ) {

        return;
    }


    try {

        recognition.start();

    } catch (error) {

        console.log(
            "Recognition already running."
        );
    }
}


// ============================================================
// RESTART LISTENING
// ============================================================

function restartListening() {

    if (
        !recognition ||
        speaking ||
        standbyMode
    ) {

        return;
    }


    setTimeout(
        function () {

            startListening();

        },
        500
    );
}


// ============================================================
// PROCESS COMMAND
// ============================================================

function processCommand(command) {

    lastCommand = command;


    commandHistory.push(
        command
    );


    if (
        commandHistory.length >
        20
    ) {

        commandHistory.shift();
    }


    localStorage.setItem(
        "jarvisHistory",
        JSON.stringify(
            commandHistory
        )
    );


    if (youDisplay) {

        youDisplay.textContent =
            "You: " +
            command;
    }


    setStatus("THINKING");


    respond(command);
}


// ============================================================
// RESPONSE SYSTEM
// ============================================================

function respond(command) {

    command =
        command
            .toLowerCase()
            .trim();


    // ========================================================
    // STANDBY
    // ========================================================

    if (
        command.includes("standby") ||
        command.includes("go to sleep") ||
        command.includes("sleep mode")
    ) {

        standbyMode = true;

        waitingForJarvis = true;

        speak(
            "Entering standby mode, sir."
        );

        return;
    }


    // ========================================================
    // WAKE
    // ========================================================

    if (
        command.includes("wake up")
    ) {

        standbyMode = false;

        waitingForJarvis = false;

        speak(
            "I'm awake, sir."
        );

        return;
    }


    // ========================================================
    // GREETINGS
    // ========================================================

    if (
        command === "hello" ||
        command === "hi" ||
        command === "hey"
    ) {

        speak(
            getGreeting()
        );

        return;
    }


    // ========================================================
    // HOW ARE YOU
    // ========================================================

    if (
        command.includes(
            "how are you"
        )
    ) {

        speak(
            "I'm doing great, sir. All systems are operational."
        );

        return;
    }


    // ========================================================
    // WHAT ARE YOU DOING
    // ========================================================

    if (
        command.includes(
            "what are you doing"
        )
    ) {

        speak(
            "I'm here and ready to help, sir."
        );

        return;
    }


    // ========================================================
    // WHO ARE YOU
    // ========================================================

    if (
        command.includes(
            "who are you"
        ) ||
        command.includes(
            "what are you"
        )
    ) {

        speak(
            "I am JARVIS, your personal voice assistant."
        );

        return;
    }


    // ========================================================
    // ARE YOU SMART
    // ========================================================

    if (
        command.includes(
            "are you smart"
        )
    ) {

        speak(
            "I'm getting smarter every time we upgrade me, sir."
        );

        return;
    }


    // ========================================================
    // WHAT DO YOU THINK
    // ========================================================

    if (
        command.includes(
            "what do you think"
        )
    ) {

        speak(
            "I think we should keep upgrading me, sir."
        );

        return;
    }


    // ========================================================
    // FAVORITE COLOR
    // ========================================================

    if (
        command.includes(
            "favorite color"
        )
    ) {

        speak(
            "I'd choose blue, sir. It seems appropriate for JARVIS."
        );

        return;
    }


    // ========================================================
    // THANK YOU
    // ========================================================

    if (
        command.includes(
            "thank you"
        ) ||
        command.includes(
            "thanks"
        )
    ) {

        speak(
            "You're welcome, sir."
        );

        return;
    }


    // ========================================================
    // ARE YOU THERE
    // ========================================================

    if (
        command.includes(
            "are you there"
        )
    ) {

        speak(
            "Always, sir."
        );

        return;
    }


    // ========================================================
    // TIME
    // ========================================================

    if (
        command.includes(
            "what time is it"
        ) ||
        command === "time"
    ) {

        speak(
            "The time is " +
            new Date()
                .toLocaleTimeString()
        );

        return;
    }


    // ========================================================
    // DATE
    // ========================================================

    if (
        command.includes(
            "what day is it"
        ) ||
        command.includes(
            "what date is it"
        )
    ) {

        speak(
            "Today is " +
            new Date()
                .toLocaleDateString(
                    "en-US",
                    {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    }
                )
        );

        return;
    }


    // ========================================================
    // WEATHER
    // ========================================================

    if (
        command.includes(
            "weather"
        ) ||
        command.includes(
            "temperature outside"
        ) ||
        command.includes(
            "how hot is it"
        ) ||
        command.includes(
            "how cold is it"
        )
    ) {

        getWeather();

        return;
    }


    // ========================================================
    // CALCULATOR
    // ========================================================

    if (
        command.startsWith(
            "calculate "
        )
    ) {

        const answer =
            calculate(
                command
            );


        if (answer !== null) {

            speak(
                "The answer is " +
                answer +
                ", sir."
            );

        } else {

            speak(
                "I couldn't calculate that, sir."
            );
        }

        return;
    }


    // ========================================================
    // TIMER
    // ========================================================

    if (
        command.includes(
            "set a timer"
        ) ||
        command.includes(
            "set timer"
        )
    ) {

        startTimer(
            command
        );

        return;
    }


    // ========================================================
    // STOP TIMER
    // ========================================================

    if (
        command.includes(
            "stop the timer"
        ) ||
        command.includes(
            "cancel the timer"
        ) ||
        command === "stop timer"
    ) {

        cancelTimer();

        return;
    }


    // ========================================================
    // TIME LEFT
    // ========================================================

    if (
        command.includes(
            "how much time is left"
        ) ||
        command.includes(
            "how long is left"
        ) ||
        command.includes(
            "timer remaining"
        )
    ) {

        timerRemaining();

        return;
    }


    // ========================================================
    // STOPWATCH START
    // ========================================================

    if (
        command.includes(
            "start stopwatch"
        )
    ) {

        startStopwatch();

        return;
    }


    // ========================================================
    // STOPWATCH STOP
    // ========================================================

    if (
        command.includes(
            "stop stopwatch"
        )
    ) {

        stopStopwatch();

        return;
    }


    // ========================================================
    // STOPWATCH RESET
    // ========================================================

    if (
        command.includes(
            "reset stopwatch"
        )
    ) {

        resetStopwatch();

        return;
    }


    // ========================================================
    // CONVERSIONS
    // ========================================================

    if (
        command.includes(
            "convert"
        )
    ) {

        const result =
            convertUnits(
                command
            );


        if (result) {

            speak(result);

        } else {

            speak(
                "I couldn't figure out that conversion, sir."
            );
        }

        return;
    }


    // ========================================================
    // COIN
    // ========================================================

    if (
        command.includes(
            "flip a coin"
        )
    ) {

        speak(
            Math.random() <
            0.5
                ? "Heads, sir."
                : "Tails, sir."
        );

        return;
    }


    // ========================================================
    // DICE
    // ========================================================

    if (
        command.includes(
            "roll a die"
        ) ||
        command.includes(
            "roll a dice"
        )
    ) {

        const roll =
            Math.floor(
                Math.random() * 6
            ) + 1;


        speak(
            "You rolled a " +
            roll +
            ", sir."
        );

        return;
    }


    // ========================================================
    // ROCK PAPER SCISSORS
    // ========================================================

    if (
        command.includes(
            "rock paper scissors"
        )
    ) {

        const choices = [
            "rock",
            "paper",
            "scissors"
        ];


        const choice =
            choices[
                Math.floor(
                    Math.random() *
                    choices.length
                )
            ];


        speak(
            "I choose " +
            choice +
            ", sir."
        );

        return;
    }


    // ========================================================
    // JOKE
    // ========================================================

    if (
        command.includes(
            "tell me a joke"
        ) ||
        command === "joke" ||
        command.includes(
            "another joke"
        )
    ) {

        speak(
            getJoke()
        );

        return;
    }


    // ========================================================
    // FACT
    // ========================================================

    if (
        command.includes(
            "tell me a fact"
        ) ||
        command.includes(
            "random fact"
        ) ||
        command.includes(
            "something interesting"
        )
    ) {

        speak(
            getFact()
        );

        return;
    }


    // ========================================================
    // BORED
    // ========================================================

    if (
        command.includes(
            "i'm bored"
        ) ||
        command.includes(
            "i am bored"
        )
    ) {

        speak(
            "Let's do something fun, sir. We can play a game, roll a die, flip a coin, or I can tell you a fact."
        );

        return;
    }


    // ========================================================
    // LAST COMMAND
    // ========================================================

    if (
        command.includes(
            "last command"
        ) ||
        command.includes(
            "what did i just say"
        )
    ) {

        speak(
            lastCommand
                ? "Your last command was " +
                  lastCommand +
                  ", sir."
                : "You haven't given me a command yet, sir."
        );

        return;
    }


    // ========================================================
    // COMMAND HISTORY
    // ========================================================

    if (
        command.includes(
            "command history"
        ) ||
        command.includes(
            "what have i asked"
        )
    ) {

        if (
            commandHistory.length === 0
        ) {

            speak(
                "You haven't given me any commands yet, sir."
            );

        } else {

            speak(
                "Your recent commands were " +
                commandHistory
                    .slice(-5)
                    .join(", ")
            );
        }

        return;
    }


    // ========================================================
    // NOTES
    // ========================================================

    if (
        command.startsWith(
            "remember "
        )
    ) {

        const note =
            command.replace(
                "remember ",
                ""
            );


        if (note) {

            notes.push(note);

            localStorage.setItem(
                "jarvisNotes",
                JSON.stringify(
                    notes
                )
            );


            speak(
                "I'll remember that, sir."
            );

        }

        return;
    }


    if (
        command.includes(
            "what do you remember"
        ) ||
        command.includes(
            "show my notes"
        )
    ) {

        if (
            notes.length === 0
        ) {

            speak(
                "I don't have any saved notes, sir."
            );

        } else {

            speak(
                "Your saved notes are: " +
                notes.join(", ")
            );
        }

        return;
    }


    if (
        command.includes(
            "clear my notes"
        )
    ) {

        notes = [];

        localStorage.removeItem(
            "jarvisNotes"
        );


        speak(
            "Your notes have been cleared, sir."
        );

        return;
    }


    // ========================================================
    // VOICE
    // ========================================================

    if (
        command.includes(
            "change voice"
        ) ||
        command.includes(
            "choose a voice"
        )
    ) {

        showVoices();

        return;
    }


    // ========================================================
    // SYSTEM INFO
    // ========================================================

    if (
        command.includes(
            "system information"
        ) ||
        command.includes(
            "computer information"
        )
    ) {

        systemInformation();

        return;
    }


    // ========================================================
    // MUSIC
    // ========================================================

    if (
        command.includes(
            "pause music"
        ) ||
        command.includes(
            "pause audio"
        )
    ) {

        controlAudio(
            "pause"
        );

        return;
    }


    if (
        command.includes(
            "play music"
        ) ||
        command.includes(
            "play audio"
        )
    ) {

        controlAudio(
            "play"
        );

        return;
    }


    // ========================================================
    // HELP
    // ========================================================

    if (
        command === "help" ||
        command.includes(
            "what can you do"
        ) ||
        command.includes(
            "what are your commands"
        )
    ) {

        speak(
            "I can handle time, date, weather, calculators, timers, alarms, stopwatches, conversions, notes, command history, games, jokes, facts, voice settings, music controls, and basic conversations, sir."
        );

        return;
    }


    // ========================================================
    // GOODBYE
    // ========================================================

    if (
        command === "goodbye" ||
        command === "bye"
    ) {

        speak(
            "Goodbye, sir. Returning to standby."
        );

        standbyMode = true;

        return;
    }


    // ========================================================
    // UNKNOWN
    // ========================================================

    speak(
        "I heard you, sir, but I don't know how to answer that yet."
    );
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

    const jokes = [

        "Why did the computer go to the doctor? Because it had a virus.",

        "Why was the computer cold? It left its Windows open.",

        "Why do programmers prefer dark mode? Because light attracts bugs.",

        "What do computers eat for a snack? Microchips.",

        "Why was the keyboard tired? It had too many shifts."

    ];


    return jokes[
        Math.floor(
            Math.random() *
            jokes.length
        )
    ];
}


// ============================================================
// FACTS
// ============================================================

function getFact() {

    const facts = [

        "Octopuses have three hearts.",

        "A day on Venus is longer than a year on Venus.",

        "Lightning can heat the surrounding air to extremely high temperatures.",

        "Some turtles can breathe through specialized skin surfaces while underwater.",

        "The fastest land animals can reach very high speeds over short distances."

    ];


    return facts[
        Math.floor(
            Math.random() *
            facts.length
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


    if (
        !/^[0-9+\-*/().%\s]+$/
            .test(expression)
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
            typeof answer !==
                "number" ||
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
            /(\d+(?:\.\d+)?)\s*(second|seconds|minute|minutes|hour|hours)/
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
            amount *
            60 *
            1000;
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

        clearTimeout(
            timerID
        );
    }


    timerEndTime =
        Date.now() +
        milliseconds;


    timerID =
        setTimeout(
            timerFinished,
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
// TIMER FINISHED
// ============================================================

function timerFinished() {

    timerID = null;

    timerEndTime = null;


    playAlarmSound();


    speak(
        "Sir, your timer is finished."
    );
}


// ============================================================
// CANCEL TIMER
// ============================================================

function cancelTimer() {

    if (!timerID) {

        speak(
            "There isn't an active timer, sir."
        );

        return;
    }


    clearTimeout(
        timerID
    );


    timerID = null;

    timerEndTime = null;


    speak(
        "Timer cancelled, sir."
    );
}


// ============================================================
// TIMER REMAINING
// ============================================================

function timerRemaining() {

    if (!timerEndTime) {

        speak(
            "There isn't an active timer, sir."
        );

        return;
    }


    const remaining =
        Math.max(
            0,
            timerEndTime -
            Date.now()
        );


    const seconds =
        Math.ceil(
            remaining / 1000
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const leftover =
        seconds % 60;


    if (minutes > 0) {

        speak(
            "There are " +
            minutes +
            " minutes and " +
            leftover +
            " seconds remaining, sir."
        );

    } else {

        speak(
            "There are " +
            seconds +
            " seconds remaining, sir."
        );
    }
}


// ============================================================
// ALARM SOUND
// ============================================================

function playAlarmSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        const audio =
            new AudioContext();


        const oscillator =
            audio.createOscillator();


        const gain =
            audio.createGain();


        oscillator.connect(
            gain
        );


        gain.connect(
            audio.destination
        );


        oscillator.frequency.value =
            880;


        gain.gain.value =
            0.25;


        oscillator.start();


        setTimeout(
            function () {

                oscillator.stop();

                audio.close();

            },
            700
        );

    } catch (error) {

        console.log(
            "Alarm sound unavailable."
        );
    }
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
        ) ||
        document.getElementById(
            "stopwatchDisplay"
        );


    if (display) {

        display.textContent =
            formatStopwatch(
                elapsed
            );
    }
}


function formatStopwatch(
    milliseconds
) {

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


    // Miles -> Kilometers

    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*miles?\s*(?:to|into)\s*kilometers?/
        );


    if (match) {

        const miles =
            Number(match[1]);


        return (
            miles +
            " miles is about " +
            (
                miles *
                1.609344
            ).toFixed(2) +
            " kilometers, sir."
        );
    }


    // Kilometers -> Miles

    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*kilometers?\s*(?:to|into)\s*miles?/
        );


    if (match) {

        const kilometers =
            Number(match[1]);


        return (
            kilometers +
            " kilometers is about " +
            (
                kilometers /
                1.609344
            ).toFixed(2) +
            " miles, sir."
        );
    }


    // Feet -> Meters

    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*feet?\s*(?:to|into)\s*meters?/
        );


    if (match) {

        const feet =
            Number(match[1]);


        return (
            feet +
            " feet is about " +
            (
                feet *
                0.3048
            ).toFixed(2) +
            " meters, sir."
        );
    }


    // Inches -> Centimeters

    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*inches?\s*(?:to|into)\s*centimeters?/
        );


    if (match) {

        const inches =
            Number(match[1]);


        return (
            inches +
            " inches is about " +
            (
                inches *
                2.54
            ).toFixed(2) +
            " centimeters, sir."
        );
    }


    return null;
}


// ============================================================
// WEATHER - TWIN FALLS
// ============================================================

async function getWeather() {

    setStatus(
        "THINKING"
    );


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


        speak(
            "In Twin Falls, Idaho, it is currently " +
            temperature +
            " degrees Fahrenheit with " +
            condition +
            ". Wind speed is around " +
            wind +
            " miles per hour, sir."
        );


    } catch (error) {

        console.log(
            error
        );


        speak(
            "I couldn't get the Twin Falls weather right now, sir."
        );
    }
}


function getWeatherDescription(
    code
) {

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
// VOICE SELECTION
// ============================================================

function loadVoices() {

    const voices =
        speechSynthesis.getVoices();


    if (
        !selectedVoice &&
        voices.length
    ) {

        selectedVoice =
            voices.find(
                voice =>
                    voice.lang.startsWith(
                        "en"
                    )
            ) ||
            voices[0];
    }
}


speechSynthesis.onvoiceschanged =
    loadVoices;


loadVoices();


function showVoices() {

    const voices =
        speechSynthesis.getVoices();


    if (!voices.length) {

        speak(
            "No voices are available yet, sir."
        );

        return;
    }


    const names =
        voices
            .filter(
                voice =>
                    voice.lang.startsWith(
                        "en"
                    )
            )
            .slice(
                0,
                5
            )
            .map(
                voice =>
                    voice.name
            )
            .join(", ");


    speak(
        "Some available voices are " +
        names +
        "."
    );
}


// ============================================================
// SPEAK
// ============================================================

function speak(text) {

    speaking = true;


    setStatus(
        "SPEAKING"
    );


    showJarvis(
        text
    );


    if (recognition) {

        try {

            recognition.stop();

        } catch (error) {}
    }


    if (
        !window.speechSynthesis
    ) {

        speaking = false;

        returnToWakeWord();

        return;
    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.rate =
        0.95;


    utterance.pitch =
        0.9;


    utterance.volume =
        1;


    if (selectedVoice) {

        utterance.voice =
            selectedVoice;
    }


    utterance.onend =
        function () {

            speaking = false;

            returnToWakeWord();
        };


    speechSynthesis.speak(
        utterance
    );
}


// ============================================================
// RETURN TO WAKE WORD
// ============================================================

function returnToWakeWord() {

    if (standbyMode) {

        return;
    }


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
// SYSTEM INFORMATION
// ============================================================

function systemInformation() {

    const browser =
        navigator.userAgent;


    const platform =
        navigator.platform ||
        "Unknown";


    const cores =
        navigator.hardwareConcurrency ||
        "Unknown";


    speak(
        "Your browser platform is " +
        platform +
        ". The browser reports " +
        cores +
        " logical processor cores. I can only access information the browser makes available, sir."
    );
}


// ============================================================
// AUDIO CONTROLS
// ============================================================

function controlAudio(
    action
) {

    const audioElements =
        document.querySelectorAll(
            "audio"
        );


    if (
        audioElements.length === 0
    ) {

        speak(
            "I couldn't find an audio player on this page, sir."
        );

        return;
    }


    audioElements.forEach(
        audio => {

            if (
                action ===
                "play"
            ) {

                audio.play()
                    .catch(
                        error =>
                            console.log(
                                error
                            )
                    );

            } else {

                audio.pause();
            }
        }
    );


    speak(
        action === "play"
            ? "Playing audio, sir."
            : "Audio paused, sir."
    );
}


// ============================================================
// LIVE CLOCK
// ============================================================

function updateClock() {

    const clock =
        document.getElementById(
            "clock"
        ) ||
        document.getElementById(
            "liveClock"
        ) ||
        document.getElementById(
            "time"
        );


    if (clock) {

        clock.textContent =
            new Date()
                .toLocaleTimeString();
    }
}


setInterval(
    updateClock,
    1000
);


updateClock();


// ============================================================
// DATE DISPLAY
// ============================================================

function updateDate() {

    const dateDisplay =
        document.getElementById(
            "date"
        ) ||
        document.getElementById(
            "liveDate"
        );


    if (dateDisplay) {

        dateDisplay.textContent =
            new Date()
                .toLocaleDateString(
                    "en-US",
                    {
                        weekday:
                            "long",
                        month:
                            "long",
                        day:
                            "numeric",
                        year:
                            "numeric"
                    }
                );
    }
}


updateDate();


// ============================================================
// SIDE PANEL AUTO BUTTONS
// ============================================================

function connectSideButton(
    ids,
    action
) {

    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;
            }


            element.addEventListener(
                "click",
                function () {

                    action();

                }
            );
        }
    );
}


// Microphone

connectSideButton(
    [
        "mic",
        "microphone",
        "startListening",
        "listenButton"
    ],
    startListening
);


// Timer

connectSideButton(
    [
        "timerButton",
        "timerBtn"
    ],
    function () {

        const value =
            prompt(
                "How many minutes?"
            );


        if (value) {

            startTimer(
                "set timer for " +
                value +
                " minutes"
            );
        }
    }
);


// Stop timer

connectSideButton(
    [
        "stopTimer",
        "cancelTimer",
        "stopTimerButton"
    ],
    cancelTimer
);


// Stopwatch

connectSideButton(
    [
        "stopwatchStart",
        "startStopwatch"
    ],
    startStopwatch
);


connectSideButton(
    [
        "stopwatchStop",
        "stopStopwatch"
    ],
    stopStopwatch
);


connectSideButton(
    [
        "stopwatchReset",
        "resetStopwatch"
    ],
    resetStopwatch
);


// Weather

connectSideButton(
    [
        "weatherButton",
        "weatherBtn"
    ],
    getWeather
);


// Coin

connectSideButton(
    [
        "coinButton",
        "flipCoin"
    ],
    function () {

        speak(
            Math.random() < 0.5
                ? "Heads, sir."
                : "Tails, sir."
        );
    }
);


// Dice

connectSideButton(
    [
        "diceButton",
        "rollDice"
    ],
    function () {

        const roll =
            Math.floor(
                Math.random() * 6
            ) + 1;


        speak(
            "You rolled a " +
            roll +
            ", sir."
        );
    }
);


// Help

connectSideButton(
    [
        "helpButton",
        "helpBtn"
    ],
    function () {

        speak(
            "I can handle timers, alarms, weather, calculators, conversions, games, notes, command history, music, and conversation, sir."
        );
    }
);


// ============================================================
// GENERIC DATA-COMMAND SUPPORT
// ============================================================
//
// If your side buttons have:
//
// <button data-command="weather">
//
// this section makes them work too.
// ============================================================

document
    .querySelectorAll(
        "[data-command]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    processCommand(
                        button.dataset.command
                    );
                }
            );
        }
    );


// ============================================================
// DISPLAY STATUS
// ============================================================

function setStatus(
    text
) {

    if (statusDisplay) {

        statusDisplay.textContent =
            text;
    }
}


function showJarvis(
    text
) {

    if (jarvisDisplay) {

        jarvisDisplay.textContent =
            text;
    }
}


// ============================================================
// STARTUP
// ============================================================

setStatus(
    "PRESS MIC TO START"
);


showJarvis(
    'Press the microphone once, then say "Jarvis".'
);


console.log(
    "JARVIS FULL BUILD ONLINE."
);
