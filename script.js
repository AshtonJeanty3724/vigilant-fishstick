// ============================================================
//                    J.A.R.V.I.S.
//               ULTIMATE FULL BUILD
//          + SMART TO-DO + REMINDER SYSTEM
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
// LOAD SAVED INFORMATION
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


loadStorage();


// ============================================================
// SAVE STORAGE
// ============================================================

function saveStorage() {

    localStorage.setItem(
        "jarvisHistory",
        JSON.stringify(
            commandHistory
        )
    );


    localStorage.setItem(
        "jarvisNotes",
        JSON.stringify(
            notes
        )
    );


    localStorage.setItem(
        "jarvisTodos",
        JSON.stringify(
            todos
        )
    );


    localStorage.setItem(
        "jarvisReminders",
        JSON.stringify(
            reminders
        )
    );


    localStorage.setItem(
        "jarvisAlarms",
        JSON.stringify(
            alarms
        )
    );

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


    recognition.lang =
        "en-US";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.onstart =
        function () {

            listening = true;

            if (standbyMode) {

                setStatus(
                    "STANDBY"
                );

            } else if (
                waitingForJarvis
            ) {

                setStatus(
                    "WAITING FOR JARVIS"
                );

            } else {

                setStatus(
                    "LISTENING"
                );

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


            if (standbyMode) {

                if (
                    text.includes(
                        "jarvis"
                    ) ||
                    text.includes(
                        "wake up"
                    )
                ) {

                    standbyMode =
                        false;

                    waitingForJarvis =
                        false;


                    speak(
                        "I'm awake, sir."
                    );

                } else {

                    restartListening();

                }

                return;

            }


            if (
                waitingForJarvis
            ) {

                if (
                    text.includes(
                        "jarvis"
                    )
                ) {

                    waitingForJarvis =
                        false;


                    const command =
                        text
                            .replace(
                                "jarvis",
                                ""
                            )
                            .trim();


                    if (
                        command.length ===
                        0
                    ) {

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


            processCommand(
                text
            );

        };


    recognition.onend =
        function () {

            listening =
                false;


            if (
                !speaking &&
                !standbyMode
            ) {

                restartListening();

            }

        };


    recognition.onerror =
        function (event) {

            listening =
                false;


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
        startListening
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

    } catch {

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
        commandHistory.length >
        30
    ) {

        commandHistory.shift();

    }


    saveStorage();


    if (youDisplay) {

        youDisplay.textContent =
            "You: " +
            command;

    }


    setStatus(
        "THINKING"
    );


    respond(
        command
    );

}


// ============================================================
// MAIN RESPONSE SYSTEM
// ============================================================

function respond(
    command
) {

    command =
        command
            .toLowerCase()
            .trim();


    // ========================================================
    // STOP SPEAKING
    // ========================================================

    if (
        command === "stop" ||
        command.includes(
            "stop talking"
        ) ||
        command.includes(
            "be quiet"
        )
    ) {

        stopSpeaking();

        return;

    }


    // ========================================================
    // SECURE MODE
    // ========================================================

    if (
        command.includes(
            "enable secure mode"
        ) ||
        command.includes(
            "turn on secure mode"
        )
    ) {

        secureMode =
            true;


        speak(
            "Secure mode enabled, sir."
        );


        return;

    }


    if (
        command.includes(
            "disable secure mode"
        ) ||
        command.includes(
            "turn off secure mode"
        )
    ) {

        secureMode =
            false;


        speak(
            "Secure mode disabled, sir."
        );


        return;

    }


    // ========================================================
    // STANDBY
    // ========================================================

    if (
        command.includes(
            "standby"
        ) ||
        command.includes(
            "go to sleep"
        ) ||
        command.includes(
            "sleep mode"
        )
    ) {

        standbyMode =
            true;

        waitingForJarvis =
            true;


        speak(
            "Entering standby mode, sir."
        );


        return;

    }


    // ========================================================
    // WAKE
    // ========================================================

    if (
        command.includes(
            "wake up"
        )
    ) {

        standbyMode =
            false;

        waitingForJarvis =
            false;


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
                        weekday:
                            "long",
                        month:
                            "long",
                        day:
                            "numeric",
                        year:
                            "numeric"
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
            "temperature"
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
    // FORECAST
    // ========================================================

    if (
        command.includes(
            "forecast"
        ) ||
        command.includes(
            "weather tomorrow"
        )
    ) {

        getForecast();


        return;

    }


    // ========================================================
    // SUNRISE
    // ========================================================

    if (
        command.includes(
            "sunrise"
        )
    ) {

        getSunData();


        return;

    }


    // ========================================================
    // SUNSET
    // ========================================================

    if (
        command.includes(
            "sunset"
        )
    ) {

        getSunData();


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


        if (
            answer !== null
        ) {

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

        stopLatestTimer();


        return;

    }


    // ========================================================
    // TIMER REMAINING
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
    // ALL TIMERS
    // ========================================================

    if (
        command.includes(
            "show timers"
        ) ||
        command.includes(
            "list timers"
        )
    ) {

        listTimers();


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

            speak(
                result
            );

        } else {

            speak(
                "I couldn't figure out that conversion, sir."
            );

        }


        return;

    }


    // ========================================================
    // ALARM
    // ========================================================

    if (
        command.includes(
            "set an alarm"
        ) ||
        command.includes(
            "set alarm"
        )
    ) {

        setAlarm(
            command
        );


        return;

    }


    // ========================================================
    // LIST ALARMS
    // ========================================================

    if (
        command.includes(
            "show alarms"
        ) ||
        command.includes(
            "list alarms"
        )
    ) {

        listAlarms();


        return;

    }


    // ========================================================
    // CANCEL ALARMS
    // ========================================================

    if (
        command.includes(
            "cancel all alarms"
        )
    ) {

        alarms = [];


        saveStorage();


        speak(
            "All alarms cancelled, sir."
        );


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

        saveNote(
            command.replace(
                "remember ",
                ""
            )
        );


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

        showNotes();


        return;

    }


    if (
        command.includes(
            "clear my notes"
        )
    ) {

        notes = [];


        saveStorage();


        speak(
            "Your notes have been cleared, sir."
        );


        return;

    }


    // ========================================================
    // SMART TO-DO LIST
    // ========================================================

    // "add homework to my to-do list"
    // "add practice to my todo list"

    if (
        command.includes(
            "to my to do list"
        ) ||
        command.includes(
            "to my todo list"
        )
    ) {

        let todoText =
            command
                .replace(
                    "add ",
                    ""
                )
                .replace(
                    "to my to do list",
                    ""
                )
                .replace(
                    "to my todo list",
                    ""
                )
                .trim();


        if (
            todoText
        ) {

            addTodo(
                todoText
            );

        } else {

            speak(
                "What should I add to your to-do list, sir?"
            );

        }


        return;

    }


    // "what's on my to-do list"
    // "show my to-do list"
    // "read my tasks"

    if (
        command.includes(
            "show my to do list"
        ) ||
        command.includes(
            "show my todo list"
        ) ||
        command.includes(
            "what is on my to do list"
        ) ||
        command.includes(
            "what's on my to do list"
        ) ||
        command.includes(
            "read my to do list"
        ) ||
        command.includes(
            "read my tasks"
        )
    ) {

        showTodos();

        return;

    }


    // "complete item 1"
    // "finish item 2"
    // "mark item 3 complete"

    if (
        command.includes(
            "complete item"
        ) ||
        command.includes(
            "finish item"
        ) ||
        command.includes(
            "mark item"
        )
    ) {

        const match =
            command.match(
                /\d+/
            );


        if (
            match
        ) {

            completeTodo(
                Number(
                    match[0]
                )
            );

        } else {

            speak(
                "Which to-do item should I complete, sir?"
            );

        }


        return;

    }


    // "remove homework from my to-do list"

    if (
        command.includes(
            "remove "
        ) &&
        (
            command.includes(
                "from my to do list"
            ) ||
            command.includes(
                "from my todo list"
            )
        )
    ) {

        let todoText =
            command
                .replace(
                    "remove ",
                    ""
                )
                .replace(
                    "from my to do list",
                    ""
                )
                .replace(
                    "from my todo list",
                    ""
                )
                .trim();


        removeTodo(
            todoText
        );

        return;

    }


    // "clear my to-do list"

    if (
        command.includes(
            "clear my to do list"
        ) ||
        command.includes(
            "clear my todo list"
        )
    ) {

        clearTodos();

        return;

    }


    // ========================================================
    // SMART REMINDERS
    // ========================================================

    // "remind me to practice at 4:30 PM"

    if (
        command.startsWith(
            "remind me to "
        )
    ) {

        const reminderText =
            command.replace(
                "remind me to ",
                ""
            );


        const atPosition =
            reminderText.lastIndexOf(
                " at "
            );


        if (
            atPosition !== -1
        ) {

            const task =
                reminderText
                    .substring(
                        0,
                        atPosition
                    )
                    .trim();


            const time =
                reminderText
                    .substring(
                        atPosition + 4
                    )
                    .trim();


            addReminder(
                task,
                time
            );

        } else {

            speak(
                "What time should I remind you, sir?"
            );

        }


        return;

    }


    // "what are my reminders?"

    if (
        command.includes(
            "show my reminders"
        ) ||
        command.includes(
            "what are my reminders"
        ) ||
        command.includes(
            "list my reminders"
        ) ||
        command.includes(
            "read my reminders"
        )
    ) {

        showReminders();

        return;

    }


    // "cancel reminder 1"

    if (
        command.includes(
            "cancel reminder"
        ) ||
        command.includes(
            "remove reminder"
        )
    ) {

        const match =
            command.match(
                /\d+/
            );


        if (
            match
        ) {

            cancelReminder(
                Number(
                    match[0]
                )
            );

        } else {

            speak(
                "Which reminder should I cancel, sir?"
            );

        }


        return;

    }


    // "clear my reminders"

    if (
        command.includes(
            "clear my reminders"
        ) ||
        command.includes(
            "delete all reminders"
        )
    ) {

        clearReminders();

        return;

    }


    // ========================================================
    // SESSION MEMORY
    // ========================================================

    if (
        command.startsWith(
            "remember that"
        )
    ) {

        const memory =
            command.replace(
                "remember that",
                ""
            ).trim();


        sessionMemory[
            "memory" +
            Date.now()
        ] =
            memory;


        speak(
            "I'll remember that during this session, sir."
        );


        return;

    }


    if (
        command.includes(
            "what do you remember about this session"
        )
    ) {

        const values =
            Object.values(
                sessionMemory
            );


        if (
            values.length === 0
        ) {

            speak(
                "I don't have any session memories yet, sir."
            );

        } else {

            speak(
                "During this session you told me: " +
                values.join(", ")
            );

        }


        return;

    }


    // ========================================================
    // JOKE
    // ========================================================

    if (
        command.includes(
            "tell me a joke"
        ) ||
        command === "joke"
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
        )
    ) {

        speak(
            getFact()
        );


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
    // NEWS
    // ========================================================

    if (
        command.includes(
            "news"
        )
    ) {

        openSearch(
            "latest news"
        );


        speak(
            "Opening the latest news in your browser, sir."
        );


        return;

    }


    // ========================================================
    // SEARCH
    // ========================================================

    if (
        command.startsWith(
            "search for "
        )
    ) {

        const query =
            command.replace(
                "search for ",
                ""
            );


        openSearch(
            query
        );


        speak(
            "Searching for " +
            query +
            ", sir."
        );


        return;

    }


    // ========================================================
    // DIRECTIONS
    // ========================================================

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


        openMaps(
            destination
        );


        speak(
            "Opening directions to " +
            destination +
            ", sir."
        );


        return;

    }


    // ========================================================
    // MAP
    // ========================================================

    if (
        command.startsWith(
            "find "
        ) &&
        command.includes(
            "near me"
        )
    ) {

        const place =
            command
                .replace(
                    "find ",
                    ""
                )
                .replace(
                    "near me",
                    ""
                )
                .trim();


        openMaps(
            place
        );


        speak(
            "Searching for " +
            place +
            " nearby, sir."
        );


        return;

    }


    // ========================================================
    // MUSIC
    // ========================================================

    if (
        command.includes(
            "play music"
        ) ||
        command.includes(
            "play my music"
        )
    ) {

        controlAudio(
            "play"
        );


        return;

    }


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
    // COMMAND HISTORY
    // ========================================================

    if (
        command.includes(
            "command history"
        )
    ) {

        showHistory();


        return;

    }


    if (
        command.includes(
            "last command"
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
    // HELP
    // ========================================================

    if (
        command ===
            "help" ||
        command.includes(
            "what can you do"
        ) ||
        command.includes(
            "what are your commands"
        )
    ) {

        speak(
            "I can handle conversation, time, date, weather, forecasts, sunrise, sunset, timers, multiple timers, alarms, stopwatches, calculators, conversions, notes, smart to-do lists, saved reminders, session memory, news searches, maps, games, music controls, system information, voice settings, secure mode, standby mode, and more, sir."
        );


        return;

    }


    // ========================================================
    // GOODBYE
    // ========================================================

    if (
        command ===
            "goodbye" ||
        command ===
            "bye"
    ) {

        standbyMode =
            true;


        waitingForJarvis =
            true;


        speak(
            "Goodbye, sir. Returning to standby."
        );


        return;

    }


    // ========================================================
    // UNKNOWN COMMAND
    // ========================================================

    speak(
        "I heard you, sir, but I don't know how to do that yet."
    );

}


// ============================================================
// GREETING
// ============================================================

function getGreeting() {

    const hour =
        new Date().getHours();


    if (
        hour < 12
    ) {

        return (
            "Good morning, sir. How can I assist you?"
        );

    }


    if (
        hour < 18
    ) {

        return (
            "Good afternoon, sir. How can I assist you?"
        );

    }


    return (
        "Good evening, sir. How can I assist you?"
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

        "Lightning can heat surrounding air to extremely high temperatures.",

        "Some turtles can breathe through specialized skin surfaces while underwater.",

        "Honey can remain edible for a very long time when properly stored."

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
            .test(
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
            typeof answer !==
                "number" ||
            !Number.isFinite(
                answer
            )
        ) {

            return null;

        }


        return answer;

    } catch {

        return null;

    }

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
        Number(
            match[1]
        );


    const unit =
        match[2];


    let milliseconds =
        amount *
        1000;


    if (
        unit.includes(
            "minute"
        )
    ) {

        milliseconds =
            amount *
            60 *
            1000;

    }


    if (
        unit.includes(
            "hour"
        )
    ) {

        milliseconds =
            amount *
            60 *
            60 *
            1000;

    }


    const id =
        ++timerCounter;


    const end =
        Date.now() +
        milliseconds;


    const timeout =
        setTimeout(
            function () {

                timerFinished(
                    id
                );

            },
            milliseconds
        );


    timers.push(
        {
            id:
                id,

            end:
                end,

            timeout:
                timeout
        }
    );


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


// ============================================================
// TIMER FINISHED
// ============================================================

function timerFinished(
    id
) {

    timers =
        timers.filter(
            timer =>
                timer.id !==
                id
        );


    playAlarmSound();


    speak(
        "Sir, timer " +
        id +
        " is finished."
    );

}


// ============================================================
// STOP LATEST TIMER
// ============================================================

function stopLatestTimer() {

    if (
        timers.length === 0
    ) {

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
// TIMER REMAINING
// ============================================================

function timerRemaining() {

    if (
        timers.length === 0
    ) {

        speak(
            "There are no active timers, sir."
        );


        return;

    }


    const timer =
        timers[
            timers.length - 1
        ];


    const seconds =
        Math.max(
            0,
            Math.ceil(
                (
                    timer.end -
                    Date.now()
                ) /
                1000
            )
        );


    const minutes =
        Math.floor(
            seconds /
            60
        );


    const remainingSeconds =
        seconds %
        60;


    speak(
        "Timer " +
        timer.id +
        " has " +
        minutes +
        " minutes and " +
        remainingSeconds +
        " seconds remaining, sir."
    );

}


// ============================================================
// LIST TIMERS
// ============================================================

function listTimers() {

    if (
        timers.length === 0
    ) {

        speak(
            "There are no active timers, sir."
        );


        return;

    }


    speak(
        "You currently have " +
        timers.length +
        " active timers, sir."
    );

}


// ============================================================
// ALARM
// ============================================================

function setAlarm(
    command
) {

    const match =
        command.match(
            /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/
        );


    if (!match) {

        speak(
            "Please say a time such as seven PM, sir."
        );


        return;

    }


    let hour =
        Number(
            match[1]
        );


    const minute =
        Number(
            match[2] || 0
        );


    const ampm =
        match[3];


    if (
        ampm ===
        "pm" &&
        hour < 12
    ) {

        hour += 12;

    }


    if (
        ampm ===
        "am" &&
        hour === 12
    ) {

        hour = 0;

    }


    const now =
        new Date();


    const target =
        new Date();


    target.setHours(
        hour,
        minute,
        0,
        0
    );


    if (
        target <=
        now
    ) {

        target.setDate(
            target.getDate() +
            1
        );

    }


    const id =
        Date.now();


    alarms.push(
        {
            id:
                id,

            time:
                target.getTime()
        }
    );


    saveStorage();


    speak(
        "Alarm set for " +
        target.toLocaleTimeString(
            [],
            {
                hour:
                    "numeric",
                minute:
                    "2-digit"
            }
        ) +
        ", sir."
    );

}


// ============================================================
// ALARM CHECKER
// ============================================================

setInterval(
    function () {

        const now =
            Date.now();


        alarms =
            alarms.filter(
                alarm => {

                    if (
                        now >=
                        alarm.time
                    ) {

                        playAlarmSound();


                        speak(
                            "Sir, your alarm is going off."
                        );


                        return false;

                    }


                    return true;

                }
            );


        saveStorage();

    },
    1000
);


// ============================================================
// LIST ALARMS
// ============================================================

function listAlarms() {

    if (
        alarms.length === 0
    ) {

        speak(
            "There are no alarms set, sir."
        );


        return;

    }


    const text =
        alarms
            .map(
                alarm =>
                    new Date(
                        alarm.time
                    ).toLocaleTimeString(
                        [],
                        {
                            hour:
                                "numeric",
                            minute:
                                "2-digit"
                        }
                    )
            )
            .join(
                ", "
            );


    speak(
        "Your alarms are set for " +
        text +
        ", sir."
    );

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

    if (
        stopwatchRunning
    ) {

        speak(
            "The stopwatch is already running, sir."
        );


        return;

    }


    stopwatchRunning =
        true;


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

    if (
        !stopwatchRunning
    ) {

        speak(
            "The stopwatch isn't running, sir."
        );


        return;

    }


    stopwatchElapsed =
        Date.now() -
        stopwatchStart;


    stopwatchRunning =
        false;


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

    stopwatchRunning =
        false;


    clearInterval(
        stopwatchID
    );


    stopwatchElapsed =
        0;


    updateStopwatch();


    speak(
        "Stopwatch reset, sir."
    );

}


function updateStopwatch() {

    let elapsed =
        stopwatchElapsed;


    if (
        stopwatchRunning
    ) {

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
            milliseconds /
            1000
        );


    const minutes =
        Math.floor(
            totalSeconds /
            60
        );


    const seconds =
        totalSeconds %
        60;


    return (
        String(
            minutes
        ).padStart(
            2,
            "0"
        ) +
        ":" +
        String(
            seconds
        ).padStart(
            2,
            "0"
        )
    );

}


// ============================================================
// UNIT CONVERSIONS
// ============================================================

function convertUnits(
    command
) {

    let match;


    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*miles?\s*(?:to|into)\s*kilometers?/
        );


    if (match) {

        const miles =
            Number(
                match[1]
            );


        return (
            miles +
            " miles is about " +
            (
                miles *
                1.609344
            ).toFixed(
                2
            ) +
            " kilometers, sir."
        );

    }


    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*kilometers?\s*(?:to|into)\s*miles?/
        );


    if (match) {

        const km =
            Number(
                match[1]
            );


        return (
            km +
            " kilometers is about " +
            (
                km /
                1.609344
            ).toFixed(
                2
            ) +
            " miles, sir."
        );

    }


    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*feet?\s*(?:to|into)\s*meters?/
        );


    if (match) {

        const feet =
            Number(
                match[1]
            );


        return (
            feet +
            " feet is about " +
            (
                feet *
                0.3048
            ).toFixed(
                2
            ) +
            " meters, sir."
        );

    }


    match =
        command.match(
            /(\d+(?:\.\d+)?)\s*inches?\s*(?:to|into)\s*centimeters?/
        );


    if (match) {

        const inches =
            Number(
                match[1]
            );


        return (
            inches +
            " inches is about " +
            (
                inches *
                2.54
            ).toFixed(
                2
            ) +
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


        if (
            !response.ok
        ) {

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

    } catch {

        speak(
            "I couldn't get the Twin Falls weather right now, sir."
        );

    }

}


// ============================================================
// FORECAST
// ============================================================

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


        const condition =
            getWeatherDescription(
                data.daily
                    .weather_code[1]
            );


        speak(
            "Tomorrow in Twin Falls, the forecast is " +
            condition +
            " with a high of " +
            max +
            " and a low of " +
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
// SUNRISE / SUNSET
// ============================================================

async function getSunData() {

    try {

        const response =
            await fetch(
                "https://api.open-meteo.com/v1/forecast?latitude=42.56297&longitude=-114.46087&daily=sunrise,sunset&timezone=America%2FDenver"
            );


        const data =
            await response.json();


        const sunrise =
            new Date(
                data.daily.sunrise[0]
            ).toLocaleTimeString(
                [],
                {
                    hour:
                        "numeric",
                    minute:
                        "2-digit"
                }
            );


        const sunset =
            new Date(
                data.daily.sunset[0]
            ).toLocaleTimeString(
                [],
                {
                    hour:
                        "numeric",
                    minute:
                        "2-digit"
                }
            );


        speak(
            "Today's sunrise is at " +
            sunrise +
            " and sunset is at " +
            sunset +
            ", sir."
        );

    } catch {

        speak(
            "I couldn't retrieve the sunrise and sunset information, sir."
        );

    }

}


// ============================================================
// WEATHER DESCRIPTION
// ============================================================

function getWeatherDescription(
    code
) {

    if (
        code === 0
    ) {

        return "clear skies";

    }


    if (
        code === 1 ||
        code === 2
    ) {

        return "partly cloudy skies";

    }


    if (
        code === 3
    ) {

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


    if (
        code >= 95
    ) {

        return "thunderstorms";

    }


    return "changing conditions";

}


// ============================================================
// NOTES
// ============================================================

function saveNote(
    note
) {

    if (
        !note
    ) {

        speak(
            "What would you like me to remember, sir?"
        );


        return;

    }


    notes.push(
        note
    );


    saveStorage();


    speak(
        "I'll remember that, sir."
    );

}


function showNotes() {

    if (
        notes.length ===
        0
    ) {

        speak(
            "I don't have any saved notes, sir."
        );


        return;

    }


    speak(
        "Your notes are: " +
        notes.join(
            ", "
        )
    );

}


// ============================================================
// SMART TO-DO FUNCTIONS
// ============================================================

function addTodo(
    todo
) {

    todo =
        todo
            .trim();


    if (
        !todo
    ) {

        speak(
            "What should I add to your to-do list, sir?"
        );


        return;

    }


    todos.push(
        {
            text:
                todo,

            completed:
                false,

            created:
                Date.now()
        }
    );


    saveStorage();


    speak(
        "Added " +
        todo +
        " to your to-do list, sir."
    );

}


function showTodos() {

    if (
        todos.length ===
        0
    ) {

        speak(
            "Your to-do list is empty, sir."
        );


        return;

    }


    const activeTodos =
        todos.filter(
            todo =>
                !todo.completed
        );


    if (
        activeTodos.length ===
        0
    ) {

        speak(
            "You've completed everything on your to-do list, sir."
        );


        return;

    }


    const text =
        activeTodos
            .map(
                (
                    todo,
                    index
                ) =>
                    (
                        index + 1
                    ) +
                    ". " +
                    todo.text
            )
            .join(
                ", "
            );


    speak(
        "Your to-do list is: " +
        text
    );

}


function completeTodo(
    number
) {

    const activeTodos =
        todos.filter(
            todo =>
                !todo.completed
        );


    const index =
        number - 1;


    if (
        index < 0 ||
        index >=
            activeTodos.length
    ) {

        speak(
            "I couldn't find that to-do item, sir."
        );


        return;

    }


    const todo =
        activeTodos[index];


    todo.completed =
        true;


    saveStorage();


    speak(
        "Completed " +
        todo.text +
        ", sir."
    );

}


function removeTodo(
    text
) {

    text =
        text
            .toLowerCase()
            .trim();


    const oldLength =
        todos.length;


    todos =
        todos.filter(
            todo =>
                !todo.text
                    .toLowerCase()
                    .includes(
                        text
                    )
        );


    if (
        todos.length ===
        oldLength
    ) {

        speak(
            "I couldn't find that item on your to-do list, sir."
        );


        return;

    }


    saveStorage();


    speak(
        "I've removed that item from your to-do list, sir."
    );

}


function clearTodos() {

    todos = [];


    saveStorage();


    speak(
        "Your to-do list has been cleared, sir."
    );

}


// ============================================================
// SMART REMINDER FUNCTIONS
// ============================================================

function parseReminderTime(
    text
) {

    text =
        text
            .toLowerCase()
            .trim();


    const match =
        text.match(
            /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/
        );


    if (
        !match
    ) {

        return null;

    }


    let hour =
        Number(
            match[1]
        );


    const minute =
        Number(
            match[2] ||
            0
        );


    const ampm =
        match[3];


    if (
        hour < 1 ||
        hour > 12 ||
        minute < 0 ||
        minute > 59
    ) {

        return null;

    }


    if (
        ampm ===
        "pm" &&
        hour < 12
    ) {

        hour += 12;

    }


    if (
        ampm ===
        "am" &&
        hour === 12
    ) {

        hour = 0;

    }


    const now =
        new Date();


    const target =
        new Date();


    target.setHours(
        hour,
        minute,
        0,
        0
    );


    if (
        target <=
        now
    ) {

        target.setDate(
            target.getDate() +
            1
        );

    }


    return target.getTime();

}


function addReminder(
    task,
    timeText
) {

    task =
        task
            .trim();


    const reminderTime =
        parseReminderTime(
            timeText
        );


    if (
        !task
    ) {

        speak(
            "What should I remind you about, sir?"
        );


        return;

    }


    if (
        !reminderTime
    ) {

        speak(
            "I couldn't understand that time. Try saying something like four thirty PM, sir."
        );


        return;

    }


    const reminder = {

        id:
            Date.now(),

        task:
            task,

        time:
            reminderTime,

        created:
            Date.now()

    };


    reminders.push(
        reminder
    );


    saveStorage();


    const formattedTime =
        new Date(
            reminderTime
        ).toLocaleTimeString(
            [],
            {
                hour:
                    "numeric",

                minute:
                    "2-digit"
            }
        );


    speak(
        "Reminder set for " +
        formattedTime +
        ". I'll remind you to " +
        task +
        ", sir."
    );

}


function showReminders() {

    if (
        reminders.length ===
        0
    ) {

        speak(
            "You don't have any reminders, sir."
        );


        return;

    }


    const text =
        reminders
            .map(
                (
                    reminder,
                    index
                ) => {

                    const time =
                        new Date(
                            reminder.time
                        ).toLocaleTimeString(
                            [],
                            {
                                hour:
                                    "numeric",

                                minute:
                                    "2-digit"
                            }
                        );


                    return (
                        (
                            index + 1
                        ) +
                        ". " +
                        reminder.task +
                        " at " +
                        time
                    );

                }
            )
            .join(
                ", "
            );


    speak(
        "Your reminders are: " +
        text +
        ", sir."
    );

}


function cancelReminder(
    number
) {

    const index =
        number - 1;


    if (
        index < 0 ||
        index >=
            reminders.length
    ) {

        speak(
            "I couldn't find that reminder, sir."
        );


        return;

    }


    const removed =
        reminders.splice(
            index,
            1
        )[0];


    saveStorage();


    speak(
        "Cancelled your reminder to " +
        removed.task +
        ", sir."
    );

}


function clearReminders() {

    reminders = [];


    saveStorage();


    speak(
        "All reminders have been cleared, sir."
    );

}


// ============================================================
// REMINDER CHECKER
// ============================================================

setInterval(
    function () {

        const now =
            Date.now();


        let changed =
            false;


        reminders =
            reminders.filter(
                reminder => {

                    if (
                        now >=
                        reminder.time
                    ) {

                        changed =
                            true;


                        playAlarmSound();


                        speak(
                            "Sir, this is your reminder. " +
                            reminder.task
                        );


                        return false;

                    }


                    return true;

                }
            );


        if (
            changed
        ) {

            saveStorage();

        }

    },
    1000
);


// ============================================================
// HISTORY
// ============================================================

function showHistory() {

    if (
        commandHistory.length ===
        0
    ) {

        speak(
            "There is no command history yet, sir."
        );


        return;

    }


    speak(
        "Your recent commands were: " +
        commandHistory
            .slice(
                -5
            )
            .join(
                ", "
            )
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
        encodeURIComponent(
            query
        ),
        "_blank"
    );

}


// ============================================================
// MAPS
// ============================================================

function openMaps(
    destination
) {

    window.open(
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
            destination
        ),
        "_blank"
    );

}


// ============================================================
// AUDIO
// ============================================================

function controlAudio(
    action
) {

    const audioElements =
        document.querySelectorAll(
            "audio"
        );


    if (
        audioElements.length ===
        0
    ) {

        speak(
            "I couldn't find music loaded on this page, sir."
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
        action ===
        "play"
            ? "Playing audio, sir."
            : "Audio paused, sir."
    );

}


// ============================================================
// VOICES
// ============================================================

function loadVoices() {

    const voices =
        speechSynthesis
            .getVoices();


    if (
        !selectedVoice &&
        voices.length
    ) {

        selectedVoice =
            voices.find(
                voice =>
                    voice.lang
                        .startsWith(
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
        speechSynthesis
            .getVoices();


    if (
        voices.length ===
        0
    ) {

        speak(
            "No voices are available yet, sir."
        );


        return;

    }


    const names =
        voices
            .filter(
                voice =>
                    voice.lang
                        .startsWith(
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
            .join(
                ", "
            );


    speak(
        "Available voices include " +
        names +
        "."
    );

}


// ============================================================
// SPEAK
// ============================================================

function speak(
    text
) {

    speaking =
        true;


    setStatus(
        "SPEAKING"
    );


    showJarvis(
        text
    );


    if (
        recognition
    ) {

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
        0.95;


    utterance.pitch =
        0.9;


    utterance.volume =
        1;


    if (
        selectedVoice
    ) {

        utterance.voice =
            selectedVoice;

    }


    utterance.onend =
        function () {

            speaking =
                false;


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


    speaking =
        false;


    setStatus(
        "WAITING FOR JARVIS"
    );


    showJarvis(
        "Speech stopped."
    );


    waitingForJarvis =
        true;


    restartListening();

}


// ============================================================
// RETURN TO WAKE WORD
// ============================================================

function returnToWakeWord() {

    if (
        standbyMode
    ) {

        return;

    }


    waitingForJarvis =
        true;


    setStatus(
        "WAITING FOR JARVIS"
    );


    setTimeout(
        function () {

            if (
                !speaking
            ) {

                startListening();

            }

        },
        600
    );

}


// ============================================================
// SYSTEM INFORMATION
// ============================================================

function systemInformation() {

    const platform =
        navigator.platform ||
        "Unknown";


    const browser =
        navigator.userAgent;


    const cores =
        navigator.hardwareConcurrency ||
        "Unknown";


    speak(
        "Your system reports the platform as " +
        platform +
        ". The browser reports " +
        cores +
        " logical processor cores. I can only access information your browser makes available, sir."
    );

}


// ============================================================
// CLOCK
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


    if (
        clock
    ) {

        clock.textContent =
            new Date()
                .toLocaleTimeString();

    }


    const date =
        document.getElementById(
            "date"
        ) ||
        document.getElementById(
            "liveDate"
        );


    if (
        date
    ) {

        date.textContent =
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


setInterval(
    updateClock,
    1000
);


updateClock();


// ============================================================
// STATUS
// ============================================================

function setStatus(
    text
) {

    if (
        statusDisplay
    ) {

        statusDisplay.textContent =
            text;

    }

}


function showJarvis(
    text
) {

    if (
        jarvisDisplay
    ) {

        jarvisDisplay.textContent =
            text;

    }

}


// ============================================================
// SIDE BUTTON SUPPORT
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


            if (
                !element
            ) {

                return;

            }


            element.addEventListener(
                "click",
                action
            );

        }
    );

}


// Microphone

connectSideButton(
    [
        "mic",
        "microphone",
        "listenButton",
        "startListening"
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


        if (
            value
        ) {

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
    stopLatestTimer
);


// Stopwatch

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


// Weather

connectSideButton(
    [
        "weatherButton",
        "weatherBtn"
    ],
    getWeather
);


// Help

connectSideButton(
    [
        "helpButton",
        "helpBtn"
    ],
    function () {

        speak(
            "I can handle timers, alarms, weather, forecasts, notes, smart to-do lists, saved reminders, calculators, conversions, games, music, maps, news, and conversation, sir."
        );

    }
);


// ============================================================
// DATA-COMMAND BUTTON SUPPORT
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
    "JARVIS ULTIMATE BUILD ONLINE."
);
