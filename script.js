import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

const keysPressed = new Map()
let lastKeyDownTime = null
let firstNoteStartTime
let noteStartTimes = []

// TODO: is it still be practice to use DomContentLoaded or something?
const recordedSequenceDiv = document.getElementById("recorded-sequence")
const tapArea = document.getElementById("tap-area")
let isUsingTouch = false

function recordNoteStart(keyLabel, timeStamp) {
    // Only process keydown if the key (or tap area) is not already pressed
    if (!keysPressed.has(event.key)) {
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
    recordNoteStart(event.key, event.timeStamp)
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

    // Record keyup as the last recorded event.
    // But, when the next key is down, replace it with the
    // time since last keydown.
    addNoteStartTime(timeStamp)
    const el = document.createElement("div")
    el.id = "keyup-event"
    el.textContent = `\u2191 ${duration.toFixed(2)}ms` // &uarr; up arrow (but textContent is better than innerHTML)
    recordedSequenceDiv.appendChild(el)
}

document.addEventListener("keyup", (event) => {
    recordNoteStop(event.key, event.timeStamp)
})

tapArea.addEventListener("pointerup", (event) => {
    recordNoteStop("tap", event.timeStamp)
})

function addNoteStartTime(time) {
    if (noteStartTimes.length === 0) {
        firstNoteStartTime = time
        noteStartTimes.push(0)
    } else {
        noteStartTimes.push(time - firstNoteStartTime)
    }

    drawChart()
    console.log(noteStartTimes)
}

function drawChart() {
    // TODO: with D3 I think I don't need to recreate everything each frame

    const width = document.getElementById("viz").clientWidth

    const svg = d3.create("svg").attr("width", width).attr("height", 100)

    let lastRecordedTime = noteStartTimes[noteStartTimes.length - 1] || 0

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

    // document.getElementById("viz").textContent = noteStartTimes.join(", ")

    // requestAnimationFrame(animate)
}
// animate()
