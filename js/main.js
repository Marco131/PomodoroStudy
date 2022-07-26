// Variables
// states
let context;

// counting states
const CountingStates = {
    Pomodoro: "Pomodoro",
    ShortPause: "ShortPause",
    LongPause: "LongPause"
}

let currentCountingState = CountingStates.Pomodoro;

// states durations (* 60 for seconds)
let pomodoroTime = 25 * 60;
let shortPauseTime = 5 * 60;
let longPauseTime = 15 * 60;

// count
let timeCpt = pomodoroTime;
let isCounting = false;
let isPaused = false;
let pomodoroCpt = 0;

// elements
let timerMessage;
let clock;
let timeDisplay;

// sfx
let clickSfx;


// Events
function OnLoad(){
    timerMessage = document.getElementById("timerMessage");
    clock = document.getElementById("clock");
    timeDisplay = document.getElementById("timeDisplay");
    
    clickSfx = new Audio('sfx/switch2.wav');
    clickSfx.volume = 0.5;
    
    context = new Context();

    DisplayTime();
}

function OnClockClick(){
    switch(context.CurrentState().Name()){
        case "waiting":
            context.transitionTo(new CountingState());
            break;
        
        case "counting":
            context.transitionTo(new PausedState());
            break;
            
        case "paused":
            context.transitionTo(new CountingState());
            break;
    }
}


// Functions
// recursive function that counts the time, it calls itself after 1s
async function CountTime(){
    timeCpt -= 1;

    if(timeCpt < 0){
        context.transitionTo(new WaintingClickState());
        if(currentCountingState == CountingStates.Pomodoro){
            pomodoroCpt += 1;
        }

        ChangeCountingState();
    }
    
    DisplayTime();

    // wait 1 second
    await new Promise(r => setTimeout(r, 1000));

    if(isCounting && !isPaused){
        CountTime();
    }
}

// converts time counter from seconds to minutes:seconds and displays
function DisplayTime(){
    var minutes = Math.floor(Math.floor(timeCpt / 60));
    minutes = minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});

    var seconds = timeCpt%60;
    seconds = seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});

    var display = `${minutes}:${seconds}`;
    timeDisplay.innerText = display;
    if(isCounting){
        document.title = display;
    }
}

// changes the tab icon to the icon parameter
function ChangeTabIcon(imageUrl){
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = imageUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
}

// changes the counting state depending on the current state and the number of pomodori
function ChangeCountingState(){
    if(currentCountingState == CountingStates.Pomodoro)
    {
        timerMessage.innerText = "EASE OFF!"

        if(pomodoroCpt % 4 != 0)
        {
            currentCountingState = CountingStates.ShortPause;
            timeCpt = shortPauseTime;
        }
        else
        {
            currentCountingState = CountingStates.LongPause;
            timeCpt = longPauseTime;
        }
    }
    else
    {
        timerMessage.innerText = "FOCUS!"

        currentCountingState = CountingStates.Pomodoro;
        timeCpt = pomodoroTime;
    }
}


// States Pattern
class Context{
    constructor(){
        this.currentState;
        this.transitionTo(new WaintingClickState());
    }

    CurrentState(){
        return this.currentState;
    }

    transitionTo(newState){
        this.currentState = newState;
        this.currentState.onChange();
    }
}

// States
class State{
    constructor(name){
        this.name = name;
    }

    Name(){
        return this.name;
    }

    onChange(){}
}

class WaintingClickState extends State{
    constructor(){
        super("waiting");
    }
    
    onChange(){
        isCounting = false;
        isPaused = false;

        ChangeTabIcon("./img/icons/leaf.ico");
        document.title = "Pomodoro Study"
        
        leaf.style.display = "none"
        clock.style.backgroundImage = "url(./img/tomato.png)";
    }
}

class CountingState extends State{
    constructor(){
        super("counting");
    }
    
    onChange(){
        isPaused = false;
        isCounting = true;
        CountTime();

        ChangeTabIcon("./img/icons/play.ico");

        leaf.style.display = "block"
        clock.style.backgroundImage = "url(./img/tomatoCircle.png)";
        clickSfx.play();
    }
}

class PausedState extends State{
    constructor(){
        super("paused");
    }
    
    onChange(){
        isPaused = true;

        ChangeTabIcon("./img/icons/pause.ico");
        
        leaf.style.display = "none"
        clock.style.backgroundImage = "url(./img/tomato.png)";
        clickSfx.play();
    }
}