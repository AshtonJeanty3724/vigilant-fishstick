// ============================================================
//                    J.A.R.V.I.S.
//              SMART AI ULTIMATE BUILD
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

const voiceSelect =
    document.getElementById("voiceSelect");

const aiStatus =
    document.getElementById("aiStatus");


// ============================================================
// MAIN VARIABLES
// ============================================================

let recognition = null;

let listening = false;

let speaking = false;

let waitingForJarvis = true;

let standbyMode = false;

let secureMode = false;

let lastCommand = "";

let commandHistory = [];

let notes = [];

let todos = [];

let reminders = [];

let sessionMemory = {};

let selectedVoice = null;


// ============================================================
// AI SETTINGS
// ============================================================

// IMPORTANT:
//
// Do NOT put an OpenAI API key directly in this file.
//
// Instead, this JavaScript talks to your own backend:
//
// POST /api/jarvis
//
// Your backend can then safely talk to the AI model.

const AI_ENDPOINT =
    "/api/jarvis";

let aiConversation = [];


// ============================================================
// TIMERS
// ============================================================

let timers = [];

let timerCounter = 0;


// ============================================================
// ALARMS
// ============================================================

let alarms = [];


// ============================================================
// STOPWATCH
// ============================================================

let stopwatchRunning = false;

let stopwatchStart = 0;

let stopwatchElapsed = 0;

let stopwatchID = null;


// ============================================================
// STORAGE
// ============================================================

function loadStorage() {

    try {

        commandHistory =
            JSON.parse(
                localStorage.getItem(
                    "jarvisHistory"
                )
            ) || [];

    } catch {

        commandHistory = [];

    }


    try {

        notes =
            JSON.parse(
                localStorage.getItem(
                    "jarvisNotes"
                )
            ) || [];

    } catch {

        notes = [];

    }


    try {

        todos =
            JSON.parse(
                localStorage.getItem(
                    "jarvisTodos"
                )
            ) || [];

    } catch {

        todos = [];

    }


    try {

        reminders =
            JSON.parse(
                localStorage.getItem(
                    "jarvisReminders"
                )
            ) || [];

    } catch {

        reminders = [];

    }


    try {

        alarms =
            JSON.parse(
                localStorage.getItem(
                    "jarvisAlarms"
                )
            ) || [];

    } catch {

        alarms = [];

    }

}


function saveStorage() {

    localStorage.setItem(
        "jarvisHistory",
        JSON.stringify(commandHistory)
    );

    localStorage.setItem(
        "jarvisNotes",
        JSON.stringify(notes)
    );

    localStorage.setItem(
        "jarvisTodos",
        JSON.stringify(todos)
    );

    localStorage.setItem(
        "jarvisReminders",
        JSON.stringify(reminders)
    );

    localStorage.setItem(
        "jarvisAlarms",
        JSON.stringify(alarms)
    );

}


loadStorage();


// ============================================================
// SPEECH RECOGNITION
// ============================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.lang =
        "en-US";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;


    recognition.onstart =
        function () {

            listening = true;

            setStatus(
                waitingForJarvis
                    ? "WAITING FOR JARVIS"
                    : "LISTENING"
            );

        };


    recognition.onresult =
        function (event) {

            listening = false;

            const text =
                event.results[0][0]
                    .transcript
                    .toLowerCase()
                    .trim();


            if (youDisplay) {

                youDisplay.textContent =
                    "You: " + text;

            }


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


                    if (command) {

                        processCommand(
                            command
                        );

                    } else {

                        speak(
                            "I'm listening, sir."
                        );

                    }

                } else {

                    restartListening();

                }

                return;

            }


            processCommand(text);

        };


    recognition.onend =
        function () {

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
// MICROPHONE
// ============================================================

if (micButton) {

    micButton.addEventListener(
        "click",
        startListening
    );

}


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

    } catch {

        console.log(
            "Recognition already running."
        );

    }

}


function restartListening() {

    if (
        !recognition ||
        speaking ||
        standbyMode
    ) {

        return;

    }


    setTimeout(
        startListening,
        600
    );

}


// ============================================================
// PROCESS COMMAND
// ============================================================

function processCommand(
    command
) {

    lastCommand =
        command;


    commandHistory.push(
        command
    );


    if (
        commandHistory.length > 30
    ) {

        commandHistory.shift();

    }


    saveStorage();


    if (youDisplay) {

        youDisplay.textContent =
            "You: " + command;

    }


    setStatus(
        "THINKING"
    );


    respond(command);

}


// ============================================================
// RESPONSE SYSTEM
// ============================================================

async function respond(
    command
) {

    command =
        command
            .toLowerCase()
            .trim();


    // --------------------------------------------------------
    // STOP SPEAKING
    // --------------------------------------------------------

    if (
        command === "stop" ||
        command.includes("stop talking") ||
        command.includes("be quiet")
    ) {

        stopSpeaking();

        return;

    }


    // --------------------------------------------------------
    // TIME
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // GREETING
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // WHO ARE YOU
    // --------------------------------------------------------

    if (
        command.includes("who are you") ||
        command.includes("what are you")
    ) {

        speak(
            "I am JARVIS, your personal voice assistant."
        );

        return;

    }


    // --------------------------------------------------------
    // WEATHER
    // --------------------------------------------------------

    if (
        command.includes("weather") ||
        command.includes("temperature") ||
        command.includes("how hot is it") ||
        command.includes("how cold is it")
    ) {

        getWeather();

        return;

    }


    // --------------------------------------------------------
    // FORECAST
    // --------------------------------------------------------

    if (
        command.includes("forecast") ||
        command.includes("weather tomorrow")
    ) {

        getForecast();

        return;

    }


    // --------------------------------------------------------
    // CALCULATOR
    // --------------------------------------------------------

    if (
        command.startsWith("calculate ")
    ) {

        const answer =
            calculate(command);


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


    // --------------------------------------------------------
    // TIMER
    // --------------------------------------------------------

    if (
        command.includes("set a timer") ||
        command.includes("set timer")
    ) {

        startTimer(command);

        return;

    }


    if (
        command.includes("stop the timer") ||
        command.includes("cancel the timer") ||
        command === "stop timer"
    ) {

        stopLatestTimer();

        return;

    }


    // --------------------------------------------------------
    // STOPWATCH
    // --------------------------------------------------------

    if (
        command.includes("start stopwatch")
    ) {

        startStopwatch();

        return;

    }


    if (
        command.includes("stop stopwatch")
    ) {

        stopStopwatch();

        return;

    }


    if (
        command.includes("reset stopwatch")
    ) {

        resetStopwatch();

        return;

    }


    // --------------------------------------------------------
    // CONVERSIONS
    // --------------------------------------------------------

    if (
        command.includes("convert")
    ) {

        const result =
            convertUnits(command);


        if (result) {

            speak(result);

        } else {

            await askAI(command);

        }

        return;

    }


    // --------------------------------------------------------
    // NOTES
    // --------------------------------------------------------

    if (
        command.startsWith("remember ")
    ) {

        saveNote(
            command.replace(
                "remember ",
                ""
            )
        );

        return;

    }


    if (
        command.includes("what do you remember") ||
        command.includes("show my notes")
    ) {

        showNotes();

        return;

    }


    // --------------------------------------------------------
    // TO-DO LIST
    // --------------------------------------------------------

    if (
        command.startsWith(
            "add to my to do list"
        )
    ) {

        addTodo(
            command.replace(
                "add to my to do list",
                ""
            ).trim()
        );

        return;

    }


    if (
        command.startsWith(
            "add to my todo list"
        )
    ) {

        addTodo(
            command.replace(
                "add to my todo list",
                ""
            ).trim()
        );

        return;

    }


    if (
        command.includes(
            "show my to do list"
        ) ||
        command.includes(
            "show my todo list"
        )
    ) {

        showTodos();

        return;

    }


    // --------------------------------------------------------
    // SESSION MEMORY
    // --------------------------------------------------------

    if (
        command.startsWith(
            "remember that"
        )
    ) {

        const memory =
            command
                .replace(
                    "remember that",
                    ""
                )
                .trim();


        sessionMemory[
            "memory" + Date.now()
        ] = memory;


        speak(
            "I'll remember that during this session, sir."
        );

        return;

    }


    // --------------------------------------------------------
    // MUSIC
    // --------------------------------------------------------

    if (
        command.includes("play music") ||
        command.includes("play my music")
    ) {

        controlAudio("play");

        return;

    }


    if (
        command.includes("pause music") ||
        command.includes("pause audio")
    ) {

        controlAudio("pause");

        return;

    }


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (
        command.startsWith("search for ")
    ) {

        const query =
            command.replace(
                "search for ",
                ""
            );


        openSearch(query);


        speak(
            "Searching for " +
            query +
            ", sir."
        );

        return;

    }


    // --------------------------------------------------------
    // NEWS
    // --------------------------------------------------------

    if (
        command.includes("news")
    ) {

        openSearch(
            "latest news"
        );


        speak(
            "Opening the latest news, sir."
        );

        return;

    }


    // --------------------------------------------------------
    // MAPS
    // --------------------------------------------------------

    if (
        command.startsWith(
            "directions to "
        )
    ) {

        const destination =
            command.replace(
                "directions to ",
                ""
            );


        openMaps(destination);


        speak(
            "Opening directions to " +
            destination +
            ", sir."
        );

        return;

    }


    // --------------------------------------------------------
    // JOKE
    // --------------------------------------------------------

    if (
        command.includes("tell me a joke") ||
        command === "joke"
    ) {

        speak(getJoke());

        return;

    }


    // --------------------------------------------------------
    // FACT
    // --------------------------------------------------------

    if (
        command.includes("tell me a fact") ||
        command.includes("random fact")
    ) {

        speak(getFact());

        return;

    }


    // --------------------------------------------------------
    // COIN
    // --------------------------------------------------------

    if (
        command.includes("flip a coin")
    ) {

        speak(
            Math.random() < 0.5
                ? "Heads, sir."
                : "Tails, sir."
        );

        return;

    }


    // --------------------------------------------------------
    // DICE
    // --------------------------------------------------------

    if (
        command.includes("roll a die") ||
        command.includes("roll a dice")
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


    // --------------------------------------------------------
    // HELP
    // --------------------------------------------------------

    if (
        command === "help" ||
        command.includes("what can you do")
    ) {

        speak(
            "I can handle conversation, timers, alarms, weather, forecasts, calculators, conversions, notes, to-do lists, memory, searches, maps, music controls, games, system information, voice settings, and AI-powered questions, sir."
        );

        return;

    }


    // ========================================================
    // AI FALLBACK
    // ========================================================

    // THIS IS THE BIG NEW PART.
    //
    // If JARVIS doesn't understand a command,
    // he asks the AI instead of saying:
    //
    // "I don't know how to do that yet."

    await askAI(command);

}


// ============================================================
// AI BRAIN
// ============================================================

async function askAI(
    userMessage
) {

    setStatus(
        "AI THINKING"
    );


    if (aiStatus) {

        aiStatus.textContent =
            "AI: THINKING";

    }


    try {

        aiConversation.push({
            role: "user",
            content: userMessage
        });


        // Keep conversation from becoming enormous.

        if (
            aiConversation.length > 20
        ) {

            aiConversation =
                aiConversation.slice(-20);

        }


        const response =
            await fetch(
                AI_ENDPOINT,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        messages:
                            aiConversation

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "AI request failed"
            );

        }


        const data =
            await response.json();


        const answer =
            data.answer ||
            data.response ||
            data.message;


        if (!answer) {

            throw new Error(
                "AI returned no answer"
            );

        }


        aiConversation.push({

            role: "assistant",

            content: answer

        });


        if (aiStatus) {

            aiStatus.textContent =
                "AI: READY";

        }


        speak(
            answer
        );

    } catch (error) {

        console.error(
            "AI error:",
            error
        );


        if (aiStatus) {

            aiStatus.textContent =
                "AI: OFFLINE";
        }


        speak(
            "I couldn't reach my AI brain right now, sir."
        );

    }

}


// ============================================================
// VOICE SYSTEM
// ============================================================

function loadVoices() {

    const voices =
        speechSynthesis.getVoices();


    if (!voices.length) {

        return;

    }


    const englishVoices =
        voices.filter(
            voice =>
                voice.lang
                    .toLowerCase()
                    .startsWith("en")
        );


    if (
        voiceSelect
    ) {

        voiceSelect.innerHTML = "";


        englishVoices.forEach(
            (voice, index) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    index;


                option.textContent =
                    voice.name +
                    " (" +
                    voice.lang +
                    ")";


                voiceSelect.appendChild(
                    option
                );

            }
        );


        voiceSelect.onchange =
            function () {

                const available =
                    speechSynthesis
                        .getVoices()
                        .filter(
                            voice =>
                                voice.lang
                                    .toLowerCase()
                                    .startsWith("en")
                        );


                selectedVoice =
                    available[
                        Number(
                            this.value
                        )
                    ];


                speak(
                    "Voice selected, sir."
                );

            };

    }


    if (!selectedVoice) {

        selectedVoice =
            englishVoices.find(
                voice =>
                    /david|mark|alex|daniel/i
                        .test(
                            voice.name
                        )
            ) ||
            englishVoices[0] ||
            voices[0];

    }

}


speechSynthesis.onvoiceschanged =
    loadVoices;

loadVoices();


// ============================================================
// SPEAK
// ============================================================

function speak(
    text
) {

    speaking = true;

    setStatus(
        "SPEAKING"
    );


    showJarvis(text);


    if (recognition) {

        try {

            recognition.stop();

        } catch {}

    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.rate =
        0.92;

    utterance.pitch =
        0.85;

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
// STOP SPEAKING
// ============================================================

function stopSpeaking() {

    speechSynthesis.cancel();

    speaking = false;

    waitingForJarvis = true;

    setStatus(
        "WAITING FOR JARVIS"
    );

    showJarvis(
        "Speech stopped."
    );

    restartListening();

}


// ============================================================
// WAKE WORD
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
        600
    );

}


// ============================================================
// TIMER
// ============================================================

function startTimer(
    command
) {

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
            amount * 60 * 1000;

    }


    if (
        unit.includes("hour")
    ) {

        milliseconds =
            amount * 60 * 60 * 1000;

    }


    const id =
        ++timerCounter;


    const end =
        Date.now() + milliseconds;


    const timeout =
        setTimeout(
            function () {

                timers =
                    timers.filter(
                        timer =>
                            timer.id !== id
                    );


                playAlarmSound();


                speak(
                    "Sir, timer " +
                    id +
                    " is finished."
                );

            },
            milliseconds
        );


    timers.push({

        id: id,

        end: end,

        timeout: timeout

    });


    speak(
        "Timer " +
        id +
        " set for " +
        amount +
        " " +
        unit +
        ", sir."
    );

}


function stopLatestTimer() {

    if (!timers.length) {

        speak(
            "There are no active timers, sir."
        );

        return;

    }


    const timer =
        timers.pop();


    clearTimeout(
        timer.timeout
    );


    speak(
        "Timer " +
        timer.id +
        " cancelled, sir."
    );

}


// ============================================================
// TIMER SOUND
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


        oscillator.connect(gain);

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
            800
        );

    } catch {

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
// CALCULATOR
// ============================================================

function calculate(
    command
) {

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
            typeof answer !== "number" ||
            !Number.isFinite(answer)
        ) {

            return null;

        }


        return answer;

    } catch {

        return null;

    }

}


// ============================================================
// CONVERSIONS
// ============================================================

function convertUnits(
    command
) {

    let match =
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
                miles * 1.609344
            ).toFixed(2) +
            " kilometers, sir."
        );

    }


    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*kilometers?\s*(?:to|into)\s*miles?/
        );


    if (match) {

        const km =
            Number(match[1]);


        return (
            km +
            " kilometers is about " +
            (
                km / 1.609344
            ).toFixed(2) +
            " miles, sir."
        );

    }


    return null;

}


// ============================================================
// WEATHER
// ============================================================

async function getWeather() {

    try {

        const response =
            await fetch(
                "https://api.open-meteo.com/v1/forecast?latitude=42.56297&longitude=-114.46087&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FDenver"
            );


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


        speak(
            "In Twin Falls, Idaho, it is currently " +
            temperature +
            " degrees Fahrenheit. Wind speed is around " +
            wind +
            " miles per hour, sir."
        );

    } catch {

        speak(
            "I couldn't get the Twin Falls weather right now, sir."
        );

    }

}


async function getForecast() {

    try {

        const response =
            await fetch(
                "https://api.open-meteo.com/v1/forecast?latitude=42.56297&longitude=-114.46087&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&timezone=America%2FDenver"
            );


        const data =
            await response.json();


        const max =
            Math.round(
                data.daily
                    .temperature_2m_max[1]
            );


        const min =
            Math.round(
                data.daily
                    .temperature_2m_min[1]
            );


        speak(
            "Tomorrow in Twin Falls, the high will be " +
            max +
            " and the low will be " +
            min +
            " degrees Fahrenheit, sir."
        );

    } catch {

        speak(
            "I couldn't retrieve tomorrow's forecast, sir."
        );

    }

}


// ============================================================
// NOTES
// ============================================================

function saveNote(note) {

    if (!note) {

        speak(
            "What would you like me to remember, sir?"
        );

        return;

    }


    notes.push(note);

    saveStorage();


    speak(
        "I'll remember that, sir."
    );

}


function showNotes() {

    if (!notes.length) {

        speak(
            "I don't have any saved notes, sir."
        );

        return;

    }


    speak(
        "Your notes are: " +
        notes.join(", ")
    );

}


// ============================================================
// TO-DO
// ============================================================

function addTodo(todo) {

    if (!todo) {

        speak(
            "What should I add to your to-do list, sir?"
        );

        return;

    }


    todos.push({

        text: todo,

        completed: false

    });


    saveStorage();


    speak(
        "Added " +
        todo +
        " to your to-do list, sir."
    );

}


function showTodos() {

    if (!todos.length) {

        speak(
            "Your to-do list is empty, sir."
        );

        return;

    }


    const text =
        todos
            .map(
                (todo, index) =>
                    (
                        index + 1
                    ) +
                    ". " +
                    todo.text
            )
            .join(", ");


    speak(
        "Your to-do list is: " +
        text
    );

}


// ============================================================
// MUSIC
// ============================================================

function controlAudio(
    action
) {

    const audioElements =
        document.querySelectorAll(
            "audio"
        );


    if (!audioElements.length) {

        speak(
            "I couldn't find music loaded on this page, sir."
        );

        return;

    }


    audioElements.forEach(
        audio => {

            if (
                action === "play"
            ) {

                audio.play()
                    .catch(
                        error =>
                            console.log(error)
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
// SEARCH
// ============================================================

function openSearch(
    query
) {

    window.open(
        "https://www.google.com/search?q=" +
        encodeURIComponent(query),
        "_blank"
    );

}


function openMaps(
    destination
) {

    window.open(
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(destination),
        "_blank"
    );

}


// ============================================================
// JOKES / FACTS
// ============================================================

function getJoke() {

    const jokes = [

        "Why was the computer cold? It left its Windows open.",

        "Why do programmers prefer dark mode? Because light attracts bugs.",

        "What do computers eat for a snack? Microchips."

    ];


    return jokes[
        Math.floor(
            Math.random() *
            jokes.length
        )
    ];

}


function getFact() {

    const facts = [

        "Octopuses have three hearts.",

        "A day on Venus is longer than a year on Venus.",

        "Some turtles can breathe through specialized skin surfaces while underwater."

    ];


    return facts[
        Math.floor(
            Math.random() *
            facts.length
        )
    ];

}


// ============================================================
// CLOCK
// ============================================================

function updateClock() {

    const clock =
        document.getElementById(
            "clock"
        );


    if (clock) {

        clock.textContent =
            new Date()
                .toLocaleTimeString();

    }


    const date =
        document.getElementById(
            "date"
        );


    if (date) {

        date.textContent =
            new Date()
                .toLocaleDateString(
                    "en-US",
                    {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    }
                );

    }

}


setInterval(
    updateClock,
    1000
);


updateClock();


// ============================================================
// STATUS
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
            "JARVIS: " + text;

    }

}


// ============================================================
// SIDE BUTTONS
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
                action
            );

        }
    );

}


connectSideButton(
    [
        "mic",
        "microphone",
        "listenButton",
        "startListening"
    ],
    startListening
);


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


connectSideButton(
    [
        "stopTimer",
        "cancelTimer",
        "stopTimerButton"
    ],
    stopLatestTimer
);


connectSideButton(
    [
        "stopwatchStart"
    ],
    startStopwatch
);


connectSideButton(
    [
        "stopwatchStop"
    ],
    stopStopwatch
);


connectSideButton(
    [
        "stopwatchReset"
    ],
    resetStopwatch
);


connectSideButton(
    [
        "weatherButton"
    ],
    getWeather
);


connectSideButton(
    [
        "weatherBtn"
    ],
    getForecast
);


connectSideButton(
    [
        "helpButton",
        "helpBtn"
    ],
    function () {

        speak(
            "I can handle your commands, timers, weather, notes, to-do lists, music, searches, calculations, games, and AI-powered conversations, sir."
        );

    }
);


// ============================================================
// DATA COMMAND BUTTONS
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
// STARTUP
// ============================================================

setStatus(
    "PRESS MIC TO START"
);


showJarvis(
    'Press the microphone and say "Jarvis".'
);


console.log(
    "JARVIS SMART AI BUILD ONLINE."
);
