```javascript
// ============================================================
// J.A.R.V.I.S. V2
// FREE ULTIMATE BUILD
// ============================================================

const micButton = document.getElementById("micButton");
const statusDisplay =
    document.getElementById("statusDisplay") ||
    document.getElementById("status");

const youDisplay = document.getElementById("you");
const jarvisDisplay = document.getElementById("jarvis");

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

let sessionMemory = {};
let selectedVoice = null;

let timers = [];
let timerCounter = 0;

let stopwatchRunning = false;
let stopwatchStart = 0;
let stopwatchElapsed = 0;
let stopwatchID = null;

const musicPlayer = document.getElementById("musicPlayer");


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

    updateMemoryDisplay();
}

loadStorage();


// ============================================================
// STATUS / DISPLAY
// ============================================================

function setStatus(text) {
    if (statusDisplay) {
        statusDisplay.textContent = text;
    }
}

function showJarvis(text) {
    if (jarvisDisplay) {
        jarvisDisplay.textContent = text;
    }
}

function updateMemoryDisplay() {
    const todoDisplay =
        document.getElementById("todoDisplay");

    const notesDisplay =
        document.getElementById("notesDisplay");

    if (todoDisplay) {
        if (!todos.length) {
            todoDisplay.textContent =
                "To-do list: empty";
        } else {
            todoDisplay.innerHTML =
                "<b>To-do list:</b><br>" +
                todos.map((t, i) =>
                    `${i + 1}. ${t.completed ? "✓ " : ""}${escapeHTML(t.text)}`
                ).join("<br>");
        }
    }

    if (notesDisplay) {
        if (!notes.length) {
            notesDisplay.textContent =
                "Notes: none";
        } else {
            notesDisplay.innerHTML =
                "<b>Notes:</b><br>" +
                notes.map(escapeHTML).join("<br>");
        }
    }
}

function escapeHTML(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}


// ============================================================
// SPEECH RECOGNITION
// ============================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {

        listening = true;

        if (standbyMode) {
            setStatus("STANDBY");
        } else if (waitingForJarvis) {
            setStatus("WAITING FOR JARVIS");
        } else {
            setStatus("LISTENING");
        }
    };

    recognition.onresult = event => {

        listening = false;

        const text =
            event.results[0][0]
                .transcript
                .toLowerCase()
                .trim();

        if (standbyMode) {

            if (
                text.includes("jarvis") ||
                text.includes("wake up")
            ) {
                standbyMode = false;
                waitingForJarvis = false;

                speak("I'm awake, sir.");
            } else {
                restartListening();
            }

            return;
        }

        if (waitingForJarvis) {

            if (text.includes("jarvis")) {

                waitingForJarvis = false;

                const command =
                    text
                        .replace(/\bjarvis\b/g, "")
                        .trim();

                if (command) {
                    processCommand(command);
                } else {
                    speak("I'm listening, sir.");
                }

            } else {
                restartListening();
            }

            return;
        }

        processCommand(text);
    };

    recognition.onend = () => {

        listening = false;

        if (!speaking && !standbyMode) {
            restartListening();
        }
    };

    recognition.onerror = event => {

        listening = false;

        console.log("Voice error:", event.error);

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
            setTimeout(restartListening, 800);
        }
    };
}


// ============================================================
// LISTENING
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
    } catch {}
}

function restartListening() {

    if (
        !recognition ||
        speaking ||
        standbyMode
    ) {
        return;
    }

    setTimeout(startListening, 600);
}

if (micButton) {
    micButton.addEventListener("click", () => {
        waitingForJarvis = false;
        startListening();
    });
}


// ============================================================
// MAIN PROCESSOR
// ============================================================

function processCommand(command) {

    command = command.toLowerCase().trim();

    if (!command) return;

    lastCommand = command;

    commandHistory.push(command);

    if (commandHistory.length > 50) {
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
// SMART NATURAL LANGUAGE LAYER
// ============================================================

function respond(command) {

    // STOP
    if (
        command === "stop" ||
        command.includes("stop talking") ||
        command.includes("be quiet")
    ) {
        stopSpeaking();
        return;
    }


    // GREETINGS
    if (
        /^(hi|hello|hey|yo|good morning|good afternoon|good evening)$/
            .test(command)
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
            "All systems are operational, sir."
        );
        return;
    }


    // TIME
    if (
        command.includes("what time") ||
        command === "time"
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
        command.includes("what day") ||
        command.includes("what date")
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


    // WEATHER
    if (
        command.includes("weather") ||
        command.includes("temperature") ||
        command.includes("how hot") ||
        command.includes("how cold")
    ) {
        getWeather();
        return;
    }


    // FORECAST
    if (
        command.includes("forecast") ||
        command.includes("weather tomorrow")
    ) {
        getForecast();
        return;
    }


    // CALCULATOR
    if (
        command.startsWith("calculate ") ||
        /^[0-9\s()+\-*/%.]+$/.test(command)
    ) {
        const answer = calculate(command);

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
        command.includes("set timer") ||
        command.includes("timer for")
    ) {
        startTimer(command);
        return;
    }


    if (
        command.includes("stop timer") ||
        command.includes("cancel timer")
    ) {
        stopLatestTimer();
        return;
    }


    if (
        command.includes("timer remaining") ||
        command.includes("how much time is left")
    ) {
        timerRemaining();
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


    // CONVERSIONS
    if (command.includes("convert")) {

        const result =
            convertUnits(command);

        speak(
            result ||
            "I couldn't figure out that conversion, sir."
        );

        return;
    }


    // ========================================================
    // MEMORY
    // ========================================================

    if (
        command.startsWith("remember ")
    ) {

        saveNote(
            command.replace(
                "remember ",
                ""
            ).trim()
        );

        return;
    }

    if (
        command.startsWith("remember that ")
    ) {

        saveNote(
            command.replace(
                "remember that ",
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

    if (
        command.includes("clear my notes")
    ) {
        notes = [];
        saveStorage();

        speak(
            "Your notes have been cleared, sir."
        );

        return;
    }


    // ========================================================
    // TO-DO LIST
    // ========================================================

    if (
        command.startsWith("add to my to do list") ||
        command.startsWith("add to my todo list") ||
        command.startsWith("add to my to-do list") ||
        command.startsWith("add to my list") ||
        command.startsWith("put on my to do list")
    ) {

        const todo =
            command
                .replace(
                    /^add to my (to do|todo|to-do) list/,
                    ""
                )
                .replace(
                    /^add to my list/,
                    ""
                )
                .replace(
                    /^put on my to do list/,
                    ""
                )
                .trim();

        addTodo(todo);
        return;
    }


    // NATURAL TODO SENTENCES
    if (
        command.startsWith("i need to ") ||
        command.startsWith("i have to ")
    ) {

        addTodo(command);
        return;
    }


    if (
        command.includes("show my to do list") ||
        command.includes("show my todo list") ||
        command.includes("what's on my list") ||
        command.includes("whats on my list") ||
        command.includes("show my list")
    ) {

        showTodos();
        return;
    }


    if (
        command.includes("clear my to do list") ||
        command.includes("clear my todo list") ||
        command.includes("clear my list")
    ) {

        todos = [];
        saveStorage();

        speak(
            "Your to-do list has been cleared, sir."
        );

        return;
    }


    // COMPLETE TODO
    const completeMatch =
        command.match(
            /(?:complete|finish|done with|mark)\s+(?:item\s+)?(\d+)/
        );

    if (completeMatch) {

        completeTodo(
            Number(completeMatch[1]) - 1
        );

        return;
    }


    // ========================================================
    // MUSIC
    // ========================================================

    if (
        command.includes("play music") ||
        command === "play"
    ) {
        playMusic();
        return;
    }

    if (
        command.includes("pause music") ||
        command === "pause"
    ) {
        pauseMusic();
        return;
    }

    if (
        command.includes("stop music") ||
        command === "stop music"
    ) {
        stopMusic();
        return;
    }


    // ========================================================
    // SEARCH
    // ========================================================

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


    if (
        command.startsWith("google ")
    ) {

        const query =
            command.replace(
                "google ",
                ""
            );

        openSearch(query);

        speak(
            "Searching the web for " +
            query +
            ", sir."
        );

        return;
    }


    if (
        command.includes("news")
    ) {

        openSearch("latest news");

        speak(
            "Opening the latest news, sir."
        );

        return;
    }


    // ========================================================
    // MAPS
    // ========================================================

    if (
        command.startsWith("directions to ")
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


    // ========================================================
    // FOOTBALL WORKOUT
    // ========================================================

    if (
        command.includes("football workout") ||
        command.includes("football training") ||
        command.includes("qb workout") ||
        command.includes("quarterback workout")
    ) {

        footballWorkout();
        return;
    }


    // ========================================================
    // BASKETBALL WORKOUT
    // ========================================================

    if (
        command.includes("basketball workout") ||
        command.includes("basketball training")
    ) {

        basketballWorkout();
        return;
    }


    // ========================================================
    // JOKES
    // ========================================================

    if (
        command.includes("tell me a joke") ||
        command === "joke"
    ) {
        speak(getJoke());
        return;
    }


    // ========================================================
    // FACTS
    // ========================================================

    if (
        command.includes("tell me a fact") ||
        command.includes("random fact")
    ) {
        speak(getFact());
        return;
    }


    // ========================================================
    // COIN
    // ========================================================

    if (command.includes("flip a coin")) {

        speak(
            Math.random() < .5
                ? "Heads, sir."
                : "Tails, sir."
        );

        return;
    }


    // ========================================================
    // DICE
    // ========================================================

    if (
        command.includes("roll a die") ||
        command.includes("roll a dice")
    ) {

        speak(
            "You rolled a " +
            (Math.floor(Math.random() * 6) + 1) +
            ", sir."
        );

        return;
    }


    // ========================================================
    // HISTORY
    // ========================================================

    if (
        command.includes("command history")
    ) {
        showHistory();
        return;
    }


    if (
        command.includes("last command")
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
    // HELP
    // ========================================================

    if (
        command === "help" ||
        command.includes("what can you do") ||
        command.includes("what are your commands")
    ) {

        speak(
            "I can handle voice commands, conversation, web searches, music, weather, forecasts, timers, alarms, stopwatches, calculations, conversions, notes, persistent to-do lists, football workouts, basketball workouts, maps, news, jokes, facts, voice settings, command history, and more, sir."
        );

        return;
    }


    // ========================================================
    // UNKNOWN
    // ========================================================

    speak(
        "I heard you, sir. I don't have that command yet, but I can search the web if you'd like."
    );
}


// ============================================================
// GREETING
// ============================================================

function getGreeting() {

    const hour = new Date().getHours();

    if (hour < 12)
        return "Good morning, sir. How can I assist you?";

    if (hour < 18)
        return "Good afternoon, sir. How can I assist you?";

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
            .replace(/divided by/g, "/")
            .replace(/percent of/g, "%");

    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
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

    const amount = Number(match[1]);
    const unit = match[2];

    let milliseconds = amount * 1000;

    if (unit.includes("minute"))
        milliseconds = amount * 60 * 1000;

    if (unit.includes("hour"))
        milliseconds = amount * 60 * 60 * 1000;

    const id = ++timerCounter;
    const end = Date.now() + milliseconds;

    const timeout =
        setTimeout(() => {
            timers =
                timers.filter(
                    t => t.id !== id
                );

            playAlarmSound();

            speak(
                "Sir, timer " +
                id +
                " is finished."
            );

        }, milliseconds);

    timers.push({
        id,
        end,
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

    const timer = timers.pop();

    clearTimeout(timer.timeout);

    speak(
        "Timer " +
        timer.id +
        " cancelled, sir."
    );
}

function timerRemaining() {

    if (!timers.length) {
        speak(
            "There are no active timers, sir."
        );
        return;
    }

    const timer =
        timers[timers.length - 1];

    const seconds =
        Math.max(
            0,
            Math.ceil(
                (timer.end - Date.now()) / 1000
            )
        );

    speak(
        "Timer " +
        timer.id +
        " has " +
        Math.floor(seconds / 60) +
        " minutes and " +
        (seconds % 60) +
        " seconds remaining, sir."
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
        setInterval(updateStopwatch, 100);

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

    let elapsed = stopwatchElapsed;

    if (stopwatchRunning) {
        elapsed =
            Date.now() -
            stopwatchStart;
    }

    const display =
        document.getElementById("stopwatch");

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
// CONVERSIONS
// ============================================================

function convertUnits(command) {

    let match =
        command.match(
            /(\d+(?:\.\d+)?)\s*miles?\s*(?:to|into)\s*kilometers?/
        );

    if (match) {
        return (
            match[1] +
            " miles is about " +
            (
                Number(match[1]) * 1.609344
            ).toFixed(2) +
            " kilometers, sir."
        );
    }

    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*kilometers?\s*(?:to|into)\s*miles?/
        );

    if (match) {
        return (
            match[1] +
            " kilometers is about " +
            (
                Number(match[1]) / 1.609344
            ).toFixed(2) +
            " miles, sir."
        );
    }

    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*feet?\s*(?:to|into)\s*meters?/
        );

    if (match) {
        return (
            match[1] +
            " feet is about " +
            (
                Number(match[1]) * .3048
            ).toFixed(2) +
            " meters, sir."
        );
    }

    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*inches?\s*(?:to|into)\s*centimeters?/
        );

    if (match) {
        return (
            match[1] +
            " inches is about " +
            (
                Number(match[1]) * 2.54
            ).toFixed(2) +
            " centimeters, sir."
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

        speak(
            "In Twin Falls, Idaho, it is currently " +
            Math.round(current.temperature_2m) +
            " degrees Fahrenheit with " +
            getWeatherDescription(
                current.weather_code
            ) +
            ". Wind speed is around " +
            Math.round(current.wind_speed_10m) +
            " miles per hour, sir."
        );

    } catch {

        speak(
            "I couldn't get the weather right now, sir."
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

        speak(
            "Tomorrow in Twin Falls, the forecast is " +
            getWeatherDescription(
                data.daily.weather_code[1]
            ) +
            " with a high of " +
            Math.round(
                data.daily.temperature_2m_max[1]
            ) +
            " and a low of " +
            Math.round(
                data.daily.temperature_2m_min[1]
            ) +
            " degrees Fahrenheit, sir."
        );

    } catch {

        speak(
            "I couldn't retrieve the forecast, sir."
        );
    }
}

function getWeatherDescription(code) {

    if (code === 0)
        return "clear skies";

    if (code <= 2)
        return "partly cloudy skies";

    if (code === 3)
        return "overcast skies";

    if (code >= 51 && code <= 67)
        return "rainy conditions";

    if (code >= 71 && code <= 77)
        return "snowy conditions";

    if (code >= 80 && code <= 82)
        return "rain showers";

    if (code >= 95)
        return "thunderstorms";

    return "changing conditions";
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
        notes.join(", ") +
        ", sir."
    );
}


// ============================================================
// TO-DO
// ============================================================

function addTodo(todo) {

    if (!todo) {
        speak(
            "What should I add to your list, sir?"
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

    speak(
        "Your to-do list is: " +
        todos.map(
            (t, i) =>
                `${i + 1}. ${t.text}`
        ).join(", ") +
        ", sir."
    );
}

function completeTodo(index) {

    if (
        index < 0 ||
        index >= todos.length
    ) {
        speak(
            "I couldn't find that item, sir."
        );
        return;
    }

    todos[index].completed = true;

    saveStorage();

    speak(
        "Marked " +
        todos[index].text +
        " as complete, sir."
    );
}


// ============================================================
// WEB SEARCH
// ============================================================

function openSearch(query) {

    window.open(
        "https://www.google.com/search?q=" +
        encodeURIComponent(query),
        "_blank"
    );
}

function openMaps(destination) {

    window.open(
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(destination),
        "_blank"
    );
}


// ============================================================
// MUSIC
// ============================================================

function playMusic() {

    if (!musicPlayer || !musicPlayer.src) {

        speak(
            "Please load a music file into the music player first, sir."
        );

        return;
    }

    musicPlayer.play()
        .then(() => {
            speak("Playing music, sir.");
        })
        .catch(() => {
            speak(
                "The browser blocked playback. Press the music player once and try again, sir."
            );
        });
}

function pauseMusic() {

    if (!musicPlayer) return;

    musicPlayer.pause();

    speak(
        "Music paused, sir."
    );
}

function stopMusic() {

    if (!musicPlayer) return;

    musicPlayer.pause();
    musicPlayer.currentTime = 0;

    speak(
        "Music stopped, sir."
    );
}


// Music file loader

const musicFile =
    document.getElementById("musicFile");

if (musicFile) {

    musicFile.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if (!file) return;

            musicPlayer.src =
                URL.createObjectURL(file);

            speak(
                file.name +
                " is ready to play, sir."
            );
        }
    );
}

document
    .getElementById("musicPlay")
    ?.addEventListener(
        "click",
        playMusic
    );

document
    .getElementById("musicPause")
    ?.addEventListener(
        "click",
        pauseMusic
    );

document
    .getElementById("musicStop")
    ?.addEventListener(
        "click",
        stopMusic
    );


// ============================================================
// SPORTS WORKOUTS
// ============================================================

function footballWorkout() {

    speak(
        "Here's a football workout, sir. Start with a five minute warmup. Then do footwork drills, short acceleration drills, throwing technique practice, core exercises, and finish with a cooldown. Focus on good technique and stop if something hurts."
    );
}

function basketballWorkout() {

    speak(
        "Here's a basketball workout, sir. Start with a five minute warmup. Then work on ball handling, passing, shooting form, defensive footwork, and finishing drills. Finish with a cooldown and focus on technique rather than trying to do everything as fast as possible."
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
            Math.random() * jokes.length
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
            Math.random() * facts.length
        )
    ];
}


// ============================================================
// HISTORY
// ============================================================

function showHistory() {

    if (!commandHistory.length) {
        speak(
            "There is no command history yet, sir."
        );
        return;
    }

    speak(
        "Your recent commands were: " +
        commandHistory
            .slice(-5)
            .join(", ") +
        ", sir."
    );
}


// ============================================================
// VOICE SYSTEM
// ============================================================

function loadVoices() {

    const voices =
        speechSynthesis.getVoices();

    const select =
        document.getElementById(
            "voiceSelect"
        );

    if (!select) return;

    select.innerHTML = "";

    voices
        .filter(v =>
            v.lang.startsWith("en")
        )
        .forEach((voice, index) => {

            const option =
                document.createElement("option");

            option.value = index;

            option.textContent =
                voice.name +
                " — " +
                voice.lang;

            select.appendChild(option);
        });

    if (
        !selectedVoice &&
        voices.length
    ) {
        selectedVoice =
            voices.find(
                v =>
                    /natural|google|microsoft|english/i
                        .test(v.name) &&
                    v.lang.startsWith("en")
            ) ||
            voices.find(
                v =>
                    v.lang.startsWith("en")
            ) ||
            voices[0];
    }
}

speechSynthesis.onvoiceschanged =
    loadVoices;

loadVoices();

const voiceSelect =
    document.getElementById(
        "voiceSelect"
    );

if (voiceSelect) {

    voiceSelect.addEventListener(
        "change",
        () => {

            const voices =
                speechSynthesis.getVoices();

            const english =
                voices.filter(
                    v =>
                        v.lang.startsWith("en")
                );

            selectedVoice =
                english[
                    Number(
                        voiceSelect.value
                    )
                ];
        }
    );
}

document
    .getElementById("testVoice")
    ?.addEventListener(
        "click",
        () => {
            speak(
                "Voice test successful, sir. I am ready."
            );
        }
    );


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
        } catch {}
    }

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.rate = 0.88;
    utterance.pitch = 0.85;
    utterance.volume = 1;

    if (selectedVoice) {
        utterance.voice =
            selectedVoice;
    }

    utterance.onend = () => {

        speaking = false;

        returnToWakeWord();
    };

    speechSynthesis.speak(
        utterance
    );
}

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

function returnToWakeWord() {

    if (standbyMode) return;

    waitingForJarvis = true;

    setStatus(
        "WAITING FOR JARVIS"
    );

    setTimeout(() => {

        if (!speaking) {
            startListening();
        }

    }, 600);
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

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.frequency.value = 880;
        gain.gain.value = .2;

        oscillator.start();

        setTimeout(() => {
            oscillator.stop();
            audio.close();
        }, 800);

    } catch {}
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
            new Date().toLocaleTimeString();
    }

    if (date) {
        date.textContent =
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
}

setInterval(updateClock, 1000);
updateClock();


// ============================================================
// BUTTONS
// ============================================================

document
    .getElementById("timerButton")
    ?.addEventListener(
        "click",
        () => {

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

document
    .getElementById("stopTimerButton")
    ?.addEventListener(
        "click",
        stopLatestTimer
    );

document
    .getElementById("stopwatchStart")
    ?.addEventListener(
        "click",
        startStopwatch
    );

document
    .getElementById("stopwatchStop")
    ?.addEventListener(
        "click",
        stopStopwatch
    );

document
    .getElementById("stopwatchReset")
    ?.addEventListener(
        "click",
        resetStopwatch
    );

document
    .getElementById("weatherButton")
    ?.addEventListener(
        "click",
        getWeather
    );

document
    .getElementById("helpButton")
    ?.addEventListener(
        "click",
        () => {

            speak(
                "I can handle voice commands, web searches, music, weather, timers, alarms, stopwatches, calculations, conversions, notes, to-do lists, football workouts, basketball workouts, maps, news, jokes, facts, and more, sir."
            );
        }
    );


// ============================================================
// TEXT COMMAND BOX
// ============================================================

const commandInput =
    document.getElementById(
        "commandInput"
    );

const sendCommand =
    document.getElementById(
        "sendCommand"
    );

if (sendCommand) {

    sendCommand.addEventListener(
        "click",
        () => {

            const command =
                commandInput.value.trim();

            if (!command) return;

            commandInput.value = "";

            processCommand(command);
        }
    );
}

if (commandInput) {

    commandInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                sendCommand.click();
            }
        }
    );
}


// ============================================================
// STARTUP
// ============================================================

updateMemoryDisplay();

setStatus(
    "PRESS MIC TO START"
);

showJarvis(
    'Press the microphone and say "Jarvis".'
);

console.log(
    "JARVIS V2 FREE BUILD ONLINE."
);
```
