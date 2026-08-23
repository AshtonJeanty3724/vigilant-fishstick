// ============================================================
//                    J.A.R.V.I.S.
//             VOICE + MEMORY FULL BUILD
// ============================================================

const micButton = document.getElementById("micButton");
const statusDisplay = document.getElementById("statusDisplay");
const youDisplay = document.getElementById("you");
const jarvisDisplay = document.getElementById("jarvis");
const reactor = document.getElementById("reactor");

let recognition = null;

let listening = false;
let speaking = false;
let waitingForJarvis = true;
let standbyMode = false;

let lastCommand = "";

let commandHistory = [];
let notes = [];
let todos = [];
let reminders = [];
let alarms = [];

let selectedVoice = null;

let timers = [];
let timerCounter = 0;

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
            JSON.parse(localStorage.getItem("jarvisHistory")) || [];
    } catch {
        commandHistory = [];
    }

    try {
        notes =
            JSON.parse(localStorage.getItem("jarvisNotes")) || [];
    } catch {
        notes = [];
    }

    try {
        todos =
            JSON.parse(localStorage.getItem("jarvisTodos")) || [];
    } catch {
        todos = [];
    }

    try {
        reminders =
            JSON.parse(localStorage.getItem("jarvisReminders")) || [];
    } catch {
        reminders = [];
    }

    try {
        alarms =
            JSON.parse(localStorage.getItem("jarvisAlarms")) || [];
    } catch {
        alarms = [];
    }
}

loadStorage();


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


// ============================================================
// VOICE RECOGNITION
// ============================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onstart = function() {

        listening = true;

        reactor.classList.add("listening");

        setStatus("LISTENING");

    };


    recognition.onresult = function(event) {

        listening = false;

        reactor.classList.remove("listening");

        const text =
            event.results[0][0]
                .transcript
                .toLowerCase()
                .trim();

        console.log("JARVIS heard:", text);

        if (youDisplay) {
            youDisplay.textContent = "You: " + text;
        }

        // Wake-word mode

        if (waitingForJarvis) {

            if (
                text.includes("jarvis") ||
                text.includes("jervis")
            ) {

                waitingForJarvis = false;

                const command =
                    text
                        .replace("jarvis", "")
                        .replace("jervis", "")
                        .trim();

                if (command.length === 0) {

                    speak(
                        "I'm listening, sir."
                    );

                } else {

                    processCommand(command);
                }

            } else {

                restartListening();
            }

            return;
        }

        processCommand(text);
    };


    recognition.onend = function() {

        listening = false;

        reactor.classList.remove("listening");

        if (!speaking && !standbyMode) {
            restartListening();
        }
    };


    recognition.onerror = function(event) {

        listening = false;

        reactor.classList.remove("listening");

        console.log(
            "Speech recognition error:",
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
            setTimeout(
                restartListening,
                1000
            );
        }
    };

} else {

    setStatus("VOICE NOT SUPPORTED");

    showJarvis(
        "Your browser does not support voice recognition, sir."
    );
}


// ============================================================
// MICROPHONE
// ============================================================

micButton.addEventListener(
    "click",
    function() {

        // The first click is allowed to start
        // microphone access.

        waitingForJarvis = false;

        startListening();

    }
);


function startListening() {

    if (
        !recognition ||
        listening ||
        speaking ||
        standbyMode
    ) {
        return;
    }

    try {

        recognition.start();

    } catch(error) {

        console.log(
            "Recognition could not start:",
            error
        );
    }
}


function restartListening() {

    if (
        !recognition ||
        speaking ||
        standbyMode ||
        listening
    ) {
        return;
    }

    setTimeout(
        startListening,
        700
    );
}


// ============================================================
// PROCESS COMMAND
// ============================================================

function processCommand(command) {

    command = command
        .toLowerCase()
        .trim();

    lastCommand = command;

    commandHistory.push(command);

    if (commandHistory.length > 30) {
        commandHistory.shift();
    }

    saveStorage();

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


    // STOP SPEAKING

    if (
        command === "stop" ||
        command.includes("stop talking") ||
        command.includes("be quiet")
    ) {

        stopSpeaking();

        return;
    }


    // GREETING

    if (
        command === "hello" ||
        command === "hi" ||
        command === "hey"
    ) {

        speak(getGreeting());

        return;
    }


    // WHO ARE YOU

    if (
        command.includes("who are you") ||
        command.includes("what are you")
    ) {

        speak(
            "I am JARVIS, your personal voice assistant, sir."
        );

        return;
    }


    // HOW ARE YOU

    if (command.includes("how are you")) {

        speak(
            "I'm doing great, sir. All systems are operational."
        );

        return;
    }


    // ARE YOU THERE

    if (command.includes("are you there")) {

        speak(
            "Always, sir."
        );

        return;
    }


    // THANK YOU

    if (
        command.includes("thank you") ||
        command.includes("thanks")
    ) {

        speak(
            "You're welcome, sir."
        );

        return;
    }


    // TIME

    if (
        command === "time" ||
        command.includes("what time is it")
    ) {

        speak(
            "The time is " +
            new Date().toLocaleTimeString() +
            ", sir."
        );

        return;
    }


    // DATE

    if (
        command.includes("what day is it") ||
        command.includes("what date is it")
    ) {

        speak(
            "Today is " +
            new Date().toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            ) +
            ", sir."
        );

        return;
    }


    // CALCULATOR

    if (command.startsWith("calculate ")) {

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


    // TIMER

    if (
        command.includes("set a timer") ||
        command.includes("set timer")
    ) {

        startTimer(command);

        return;
    }


    // STOP TIMER

    if (
        command.includes("stop timer") ||
        command.includes("cancel timer")
    ) {

        stopLatestTimer();

        return;
    }


    // STOPWATCH

    if (command.includes("start stopwatch")) {

        startStopwatch();

        return;
    }


    if (command.includes("stop stopwatch")) {

        stopStopwatch();

        return;
    }


    if (command.includes("reset stopwatch")) {

        resetStopwatch();

        return;
    }


    // NOTES / MEMORY

    if (command.startsWith("remember ")) {

        saveNote(
            command.replace(
                "remember ",
                ""
            ).trim()
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


    if (command.includes("clear my notes")) {

        notes = [];

        saveStorage();

        speak(
            "Your saved notes have been cleared, sir."
        );

        return;
    }


    // TODO

    if (
        command.startsWith("add to my to do list")
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
        command.startsWith("add to my todo list")
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
        command.includes("show my to do list") ||
        command.includes("show my todo list")
    ) {

        showTodos();

        return;
    }


    if (
        command.includes("clear my to do list") ||
        command.includes("clear my todo list")
    ) {

        todos = [];

        saveStorage();

        speak(
            "Your to-do list has been cleared, sir."
        );

        return;
    }


    // MUSIC

    if (
        command.includes("play music") ||
        command.includes("play my music")
    ) {

        playMusic();

        return;
    }


    if (
        command.includes("pause music") ||
        command.includes("pause audio")
    ) {

        pauseMusic();

        return;
    }


    // SEARCH

    if (command.startsWith("search for ")) {

        const query =
            command.replace(
                "search for ",
                ""
            ).trim();

        openSearch(query);

        speak(
            "Searching for " +
            query +
            ", sir."
        );

        return;
    }


    // NEWS

    if (command.includes("news")) {

        openSearch("latest news");

        speak(
            "Opening the latest news, sir."
        );

        return;
    }


    // MAPS

    if (command.startsWith("directions to ")) {

        const destination =
            command.replace(
                "directions to ",
                ""
            ).trim();

        openMaps(destination);

        speak(
            "Opening directions to " +
            destination +
            ", sir."
        );

        return;
    }


    // JOKE

    if (
        command.includes("tell me a joke") ||
        command === "joke"
    ) {

        speak(getJoke());

        return;
    }


    // FACT

    if (
        command.includes("tell me a fact") ||
        command.includes("random fact")
    ) {

        speak(getFact());

        return;
    }


    // COIN

    if (command.includes("flip a coin")) {

        speak(
            Math.random() < .5
                ? "Heads, sir."
                : "Tails, sir."
        );

        return;
    }


    // DICE

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


    // HELP

    if (
        command === "help" ||
        command.includes("what can you do")
    ) {

        speak(
            "I can listen to you, talk back to you, remember notes, manage your to-do list, set timers and alarms, run a stopwatch, calculate math, convert units, search the web, open maps, control music on this page, tell jokes and facts, and more, sir."
        );

        return;
    }


    // GOODBYE

    if (
        command === "goodbye" ||
        command === "bye"
    ) {

        standbyMode = true;
        waitingForJarvis = true;

        speak(
            "Goodbye, sir. Returning to standby."
        );

        return;
    }


    // UNKNOWN

    speak(
        "I heard you, sir, but I don't know how to do that yet."
    );
}


// ============================================================
// SPEAKING
// ============================================================

function speak(text) {

    if (!("speechSynthesis" in window)) {

        showJarvis(
            text
        );

        return;
    }

    speaking = true;

    setStatus("SPEAKING");

    showJarvis(text);

    if (recognition) {

        try {
            recognition.stop();
        } catch {}
    }

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.rate = 0.90;
    utterance.pitch = 0.82;
    utterance.volume = 1;

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.onend = function() {

        speaking = false;

        returnToWakeWord();
    };

    utterance.onerror = function() {

        speaking = false;

        returnToWakeWord();
    };

    speechSynthesis.speak(
        utterance
    );
}


// ============================================================
// VOICE SELECTION
// ============================================================

function loadVoices() {

    const voices =
        speechSynthesis.getVoices();

    if (!voices.length) {
        return;
    }

    const english =
        voices.filter(
            voice =>
                voice.lang
                    .toLowerCase()
                    .startsWith("en")
        );

    selectedVoice =
        english.find(
            voice =>
                voice.name
                    .toLowerCase()
                    .includes("microsoft")
        ) ||
        english.find(
            voice =>
                voice.name
                    .toLowerCase()
                    .includes("google")
        ) ||
        english[0] ||
        voices[0];
}

speechSynthesis.onvoiceschanged =
    loadVoices;

loadVoices();


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
        function() {

            if (!speaking) {
                startListening();
            }

        },
        700
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
        "Speech stopped, sir."
    );

    restartListening();
}


// ============================================================
// GREETING
// ============================================================

function getGreeting() {

    const hour =
        new Date().getHours();

    if (hour < 12) {

        return "Good morning, sir. How can I assist you?";
    }

    if (hour < 18) {

        return "Good afternoon, sir. How can I assist you?";
    }

    return "Good evening, sir. How can I assist you?";
}


// ============================================================
// CALCULATOR
// ============================================================

function calculate(command) {

    let expression =
        command
            .replace(/^calculate\s*/i, "")
            .replace(/plus/g, "+")
            .replace(/minus/g, "-")
            .replace(/times/g, "*")
            .replace(/multiplied by/g, "*")
            .replace(/divided by/g, "/");

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
                '"use strict";return(' +
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
// TIMERS
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

    if (unit.includes("minute")) {

        milliseconds =
            amount * 60 * 1000;
    }

    if (unit.includes("hour")) {

        milliseconds =
            amount * 60 * 60 * 1000;
    }

    const id =
        ++timerCounter;

    const timeout =
        setTimeout(
            function() {

                speak(
                    "Sir, timer " +
                    id +
                    " is finished."
                );

            },
            milliseconds
        );

    timers.push({
        id,
        end:
            Date.now() + milliseconds,
        timeout
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
        formatStopwatch(stopwatchElapsed) +
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
            formatStopwatch(elapsed);
    }
}


function formatStopwatch(ms) {

    const total =
        Math.floor(ms / 1000);

    const minutes =
        Math.floor(total / 60);

    const seconds =
        total % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
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
        "Your saved notes are: " +
        notes.join(", ")
    );
}


// ============================================================
// TO-DO LIST
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
                    (index + 1) +
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

function playMusic() {

    const audio =
        document.querySelectorAll("audio");

    if (!audio.length) {

        speak(
            "I don't see any music loaded on this page, sir. Add an audio player to the page first."
        );

        return;
    }

    let played = false;

    audio.forEach(
        player => {

            player.play()
                .then(
                    () => {
                        played = true;
                    }
                )
                .catch(
                    error => {
                        console.log(
                            "Music error:",
                            error
                        );
                    }
                );
        }
    );

    setTimeout(
        function() {

            if (played) {

                speak(
                    "Playing your music, sir."
                );

            } else {

                speak(
                    "The browser blocked the music. Click the page once and try again, sir."
                );
            }

        },
        300
    );
}


function pauseMusic() {

    const audio =
        document.querySelectorAll("audio");

    if (!audio.length) {

        speak(
            "I don't see any music loaded on this page, sir."
        );

        return;
    }

    audio.forEach(
        player => player.pause()
    );

    speak(
        "Music paused, sir."
    );
}


// ============================================================
// WEB SEARCH
// ============================================================

function openSearch(query) {

    const url =
        "https://www.google.com/search?q=" +
        encodeURIComponent(query);

    window.open(
        url,
        "_blank"
    );
}


// ============================================================
// MAPS
// ============================================================

function openMaps(destination) {

    const url =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(destination);

    window.open(
        url,
        "_blank"
    );
}


// ============================================================
// JOKES
// ============================================================

function getJoke() {

    const jokes = [

        "Why was the computer cold? It left its Windows open.",

        "Why do programmers prefer dark mode? Because light attracts bugs.",

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

    const facts = [

        "Octopuses have three hearts.",

        "A day on Venus is longer than a year on Venus.",

        "Some turtles can breathe through specialized skin surfaces underwater.",

        "Lightning can heat the surrounding air to extremely high temperatures."
    ];

    return facts[
        Math.floor(
            Math.random() * facts.length
        )
    ];
}


// ============================================================
// CLOCK
// ============================================================

function updateClock() {

    const clock =
        document.getElementById("clock");

    const date =
        document.getElementById("date");

    if (clock) {

        clock.textContent =
            new Date()
                .toLocaleTimeString();
    }

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
// UI
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
// STARTUP
// ============================================================

setStatus(
    "PRESS MIC TO START"
);

showJarvis(
    'Press the microphone and say "Jarvis".'
);

console.log(
    "J.A.R.V.I.S. VOICE BUILD ONLINE."
);
