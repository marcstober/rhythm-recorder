import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import { signal } from "https://cdn.jsdelivr.net/npm/reefjs@13/dist/reef.es.min.js"

// TODO - BUGS:
// * Pressing Windows key captures a keydown but not keyup, causing "stuck on" state.
// * It seems like there is *always* a width-less-than 1 warning about a width of 0,
//  don't think this should happen?
// * Redraw chart on window resize.
// * There is still some way Ctrl-r can result in a rectangle only in half of the visualization.
// * Problems with how it looks and console errors when pickup note count is more than the number of notes.

/* 
Should we need multiple "signals" we could use 
https://reef.gomakethings.com/api/signal/#namespaces
or else here are Copilot's suggestions other than Reef:
If you need:
- dependency tracking
- nested path detection
- fine-grained updates
…then Vue’s reactivity engine or Solid signals are better suited.
*/

let data = signal({
    keysPressed: new Map(), // TODO: does reefjs emit signals for changes to Map?
    mode: "record",
    lastKeyDownTime: null,
    firstNoteStartTime: null,
    pickupNotesCount: 0,
    numberOfBeats: 8,
})
let noteStartTimes = signal([])

document.addEventListener("reef:signal", function (e) {
    animate()
})

// Initialize input values from data
document.getElementById("pickup-notes").value = data.pickupNotesCount
document.getElementById("number-of-beats").value = data.numberOfBeats

// add event handlers to UI elements
document.getElementById("pickup-notes").addEventListener("input", () => {
    let n = parseInt(document.getElementById("pickup-notes").value)
    if (!isNaN(n)) {
        data.pickupNotesCount = n
    }
    // Reef takes care of redrawing chart
})

document.getElementById("number-of-beats").addEventListener("input", () => {
    let n = parseInt(document.getElementById("number-of-beats").value)
    if (!isNaN(n) && n > 0) {
        data.numberOfBeats = n
    }
    // Reef takes care of redrawing chart
})

document.getElementById("reset-button").addEventListener("click", () => {
    location.reload()
})

// Keys to ignore when recording notes (reserved for browser navigation, shortcuts, etc.)
const ignoredKeys = ["Control", "Alt", "Shift", "Tab"]

// TODO: is it still best practice to use DomContentLoaded or something before accessing DOM elements?
const recordedSequenceDiv = document.getElementById("recorded-sequence")
const tapArea = document.getElementById("tap-area")
let isUsingTouch = false

function recordNoteStart(keyLabel, timeStamp) {
    if (data.mode !== "record") {
        return
    }

    // Only process keydown if the key (or tap area) is not already pressed
    if (!data.keysPressed.has(keyLabel)) {
        const timeSinceLastKeyDown =
            data.lastKeyDownTime !== null
                ? timeStamp - data.lastKeyDownTime
                : null

        data.keysPressed.set(keyLabel, timeStamp)
        data.lastKeyDownTime = timeStamp

        // remove last keyup-event element if it exists
        const lastKeyupEl = document.getElementById("keyup-event")
        if (lastKeyupEl) {
            noteStartTimes.pop()
            recordedSequenceDiv.removeChild(lastKeyupEl)
        }

        // add element to recorded sequence
        addNoteStartTime(timeStamp)
        // note that we are actually displaing durations between key events (at least for now)
        if (timeSinceLastKeyDown) {
            const el = document.createElement("div")
            el.textContent = `\u2193 ${timeSinceLastKeyDown.toFixed(2)}ms` // &darr; down arrow (but textContent is better than innerHTML)
            recordedSequenceDiv.appendChild(el)
        }
    }
}

function stopAndAnalyze() {
    data.mode = "analyze"
    data.keysPressed.clear()
    document.getElementById("stop-button").style.display = "none"
    document.getElementById("tap-area").style.display = "none"
    console.log("stopAndAnalyze calling animate...")
    animate()
}

// TODO: Maybe set the mode and let reactivity change things?
document.getElementById("stop-button").addEventListener("click", stopAndAnalyze)

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        stopAndAnalyze()
    } else if (!ignoredKeys.includes(event.key)) {
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
    if (data.mode !== "record") {
        return
    }

    const pressedTime = data.keysPressed.get(keyLabel)
    const duration = timeStamp - pressedTime
    data.keysPressed.delete(keyLabel)

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
    if (data.keysPressed.has("tap")) {
        recordNoteStop("tap", event.timeStamp)
    }
})

function addNoteStartTime(time) {
    if (noteStartTimes.length === 0) {
        data.firstNoteStartTime = time
        noteStartTimes.push(0)
    } else {
        noteStartTimes.push(time - data.firstNoteStartTime)
    }

    console.log(noteStartTimes)
}

function drawChart() {
    // TODO: with D3 I think I don't need to recreate everything each frame

    const width = document.getElementById("viz").clientWidth

    const margin = { top: 10, bottom: 20 }
    const chartHeight = 100 - margin.top - margin.bottom

    const svg = d3.create("svg").attr("width", width).attr("height", 100)

    let tickValues = Array.from({ length: data.numberOfBeats + 1 }, (_, i) => i)

    let lastRecordedTime =
        data.keysPressed.size === 0
            ? noteStartTimes[noteStartTimes.length - 1] || 0
            : performance.now() - data.firstNoteStartTime

    const x = d3.scaleLinear().domain([0, lastRecordedTime]).range([0, width])

    if (data.mode === "record") {
        document.getElementById("stop-button").style.display = "block"
    } else {
        const xAxisOriginValue = noteStartTimes[data.pickupNotesCount]
        const xAxisOffset = x(xAxisOriginValue)

        // x axis
        const xAxis = d3
            .axisBottom(
                d3
                    .scaleLinear()
                    .domain([0, data.numberOfBeats])
                    .range([xAxisOffset, width])
            )
            .tickValues(tickValues)
            .tickFormat(d3.format("d"))
        svg.append("g")
            .attr("transform", `translate(0, ${chartHeight + margin.top})`)
            .call(xAxis)
    }

    // note rectangles
    svg.append("g")
        .attr("fill", "#787070")
        .attr("stroke-width", 1)
        .selectAll()
        .data(noteStartTimes)
        .join("rect")
        .attr("class", "note-rect")
        .attr("x", (d) => x(d))
        .attr("y", 24)
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
    if (data.keysPressed.size > 0) {
        requestAnimationFrame(animate)
    } else {
        // leave this in for testing
        console.log("animation stopped")
    }
}
