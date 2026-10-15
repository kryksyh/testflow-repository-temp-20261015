/*
 * SPDX-License-Identifier: GPL-3.0-only
 */

var Project = require("Audacity.Project")

function run(action) {
    api.dispatcher.dispatch(action)
}

function equal(actual, expected, name) {
    if (actual !== expected) {
        throw new Error(name + ": expected " + expected + ", got " + actual)
    }
}

function near(actual, expected, name) {
    if (typeof actual !== "number" || !isFinite(actual) || Math.abs(actual - expected) > 0.001) {
        throw new Error(name + ": expected " + expected + " s, got " + actual + " s")
    }
}

function waitFor(check, name) {
    var deadline = Date.now() + 5000
    while (!check()) {
        if (Date.now() >= deadline) {
            throw new Error("SETUP: " + name)
        }
        api.testflow.sleep(50)
    }
}

function select(start, end) {
    run("action://trackedit/set-selection?start=" + start + "&end=" + end)
    near(Project.selection.start, start, "Selection start")
    near(Project.selection.end, end, "Selection end")
}

function createClip() {
    if (!isFinite(Project.totalTime())) {
        run("file-new")
        waitFor(function() { return isFinite(Project.totalTime()) }, "No active project.")
    }
    if (Project.trackCount() !== 0) {
        throw new Error("SETUP: The project already contains " + Project.trackCount()
                        + " track(s). This run has not added audio. Open a new empty project before you run this case.")
    }
    run("new-mono-track")
    waitFor(function() { return Project.trackCount() === 1 }, "The audio track was not created.")
    run("action://trackedit/select-track?trackIndex=0")
    select(0, 2)
    run("action://effects/apply?effectId=Chirp&StartFreq=220&EndFreq=880&StartAmp=0.8&EndAmp=0.1")
    waitFor(function() { return Project.clipCount(0) === 1 }, "The Chirp generator did not create a clip.")
    var clips = Project.clipsOnTrack(0)
    near(clips[0].start, 0, "Source clip start")
    near(clips[0].end, 2, "Source clip end")
    run("clear-selection")
    run("action://trackedit/select-track?trackIndex=0")
}

module.exports = {
    project: Project,
    run: run,
    equal: equal,
    near: near,
    waitFor: waitFor,
    select: select,
    createClip: createClip
}
