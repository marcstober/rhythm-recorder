import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

// TODO - BUGS:
// * why does the tap area change color on touch but not stay that way while holding, I don't have any styles? (on Windows)
// * It seems like there is *always* a width-less-than 1 warning about a width of 0,
//  don't think this should happen? Maybe related: should there really be a time of 0 in the displayed list?
//  I.e., it is a list of start times or durations? Seems like these concepts might have gotten mixed up.

const keysPressed = new Map()
let lastKeyDownTime = null
let firstNoteStartTime
let noteStartTimes = []

// Keys to ignore when recording notes (reserved for browser navigation, shortcuts, etc.)
const ignoredKeys = ["Control", "Alt", "Shift", "Tab"]

// TODO: is it still be practice to use DomContentLoaded or something?
const recordedSequenceDiv = document.getElementById("recorded-sequence")
const tapArea = document.getElementById("tap-area")
let isUsingTouch = false

function recordNoteStart(keyLabel, timeStamp) {
    // Only process keydown if the key (or tap area) is not already pressed
    if (!keysPressed.has(keyLabel)) {
        const timeSinceLastKeyDown =
            lastKeyDownTime !== null ? timeStamp - lastKeyDownTime : null

        keysPressed.set(keyLabel, timeStamp)
        lastKeyDownTime = timeStamp

        // remove last keyup-event element if it exists
        const lastKeyupEl = document.getElementById("keyup-event")
        if (lastKeyupEl) {
            noteStartTimes.pop()
            recordedSequenceDiv.removeChild(lastKeyupEl)
        }

        // add element to recorded sequence
        addNoteStartTime(timeStamp)
        const el = document.createElement("div")
        el.textContent = `\u2193 ${(timeSinceLastKeyDown || 0).toFixed(2)}ms` // &darr; down arrow (but textContent is better than innerHTML)
        recordedSequenceDiv.appendChild(el)
    }
}

document.addEventListener("keydown", (event) => {
    if (!ignoredKeys.includes(event.key)) {
        recordNoteStart(event.key, event.timeStamp)
    }
})

tapArea.addEventListener("pointerdown", (event) => {
    isUsingTouch = event.pointerType === "touch"
    tapArea.classList.toggle("no-select", isUsingTouch)
    recordNoteStart("tap", event.timeStamp)
    event.preventDefault()
})

tapArea.addEventListener("contextmenu", (e) => {
    if (isUsingTouch) {
        e.preventDefault()
    }
})

function recordNoteStop(keyLabel, timeStamp) {
    const pressedTime = keysPressed.get(keyLabel)
    const duration = timeStamp - pressedTime
    keysPressed.delete(keyLabel)

    console.log(
        `Key "${keyLabel}" released  [event: keyup] - duration: ${duration.toFixed(
            2
        )}ms`
    )
    console.log(noteStartTimes)

    // When user stops tapping, record end of the last tap.
    // But, when the next tap starts, we'll replace it with the
    // time since the start of the previous tap.
    addNoteStartTime(timeStamp)
    const el = document.createElement("div")
    el.id = "keyup-event"
    el.textContent = `\u2191 ${duration.toFixed(2)}ms` // &uarr; up arrow (but textContent is better than innerHTML)
    recordedSequenceDiv.appendChild(el)
}

document.addEventListener("keyup", (event) => {
    if (!ignoredKeys.includes(event.key)) {
        recordNoteStop(event.key, event.timeStamp)
    }
})

tapArea.addEventListener("pointerup", (event) => {
    recordNoteStop("tap", event.timeStamp)
})

tapArea.addEventListener("pointerout", (event) => {
    // If pointer leaves tap area while held, stop.
    // (Otherwise tap could get "stuck running" if pointerup outside tap area.)
    if (keysPressed.has("tap")) {
        recordNoteStop("tap", event.timeStamp)
    }
})

function addNoteStartTime(time) {
    if (noteStartTimes.length === 0) {
        firstNoteStartTime = time
        noteStartTimes.push(0)
    } else {
        noteStartTimes.push(time - firstNoteStartTime)
    }

    animate()
    console.log(noteStartTimes)
}

function drawChart() {
    // TODO: with D3 I think I don't need to recreate everything each frame

    const width = document.getElementById("viz").clientWidth

    const svg = d3.create("svg").attr("width", width).attr("height", 100)

    let lastRecordedTime =
        keysPressed.size === 0
            ? noteStartTimes[noteStartTimes.length - 1] || 0
            : performance.now() - firstNoteStartTime

    const x = d3.scaleLinear().domain([0, lastRecordedTime]).range([0, width])

    svg.append("g")
        .attr("fill", "#787070")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .selectAll()
        .data(noteStartTimes)
        .join("rect")
        .attr("x", (d) => x(d))
        .attr("y", 22)
        .attr("height", 50)
        .attr("width", (d, i) => {
            const nextIndex = i + 1
            let w
            if (nextIndex >= noteStartTimes.length) {
                w = x(lastRecordedTime - d)
            } else {
                w = x(noteStartTimes[i + 1] - d)
            }
            if (w < 1) {
                console.warn("width less than 1:", w)
                return 1
            }
            console.log("width:", w)
            return w
        })

    // TODO: is innerHTML really the most efficient way to clear the div?
    //  (was reading other things about innerHTML being slow)
    document.getElementById("viz").innerHTML = ""

    document.getElementById("viz").appendChild(svg.node())
}

function animate() {
    console.log("animation running")
    drawChart()

    // animate while "note" is being held
    if (keysPressed.size > 0) {
        requestAnimationFrame(animate)
    } else {
        // leave this in for testing
        console.log("animation stopped")
    }
}
