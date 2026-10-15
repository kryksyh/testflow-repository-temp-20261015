/*
 * SPDX-License-Identifier: GPL-3.0-only
 */

var t = require("helpers/TestSupport.js")
var Project = t.project

function clipControl() {
    var sections = api.navigation.sections()
    for (var s = 0; s < sections.length; s++) {
        if (sections[s].name !== "TrackViewSection") {
            continue
        }
        var panels = api.navigation.panels(sections[s].name)
        for (var p = 0; p < panels.length; p++) {
            if (!/^Track [0-9]+ Items Panel$/.test(panels[p].name)) {
                continue
            }
            var controls = api.navigation.controls(sections[s].name, panels[p].name)
            if (controls.length === 1 && controls[0].enabled) {
                return { section: sections[s].name, panel: panels[p].name, control: controls[0].name }
            }
        }
    }
    return null
}

function selectClip() {
    var target = null
    t.waitFor(function() { target = clipControl(); return target !== null }, "The clip navigation control is missing.")
    t.equal(api.navigation.goToControl(target.section, target.panel, target.control), true, "Focus the clip")
    // Setup clears object selection, so this action selects the focused clip.
    t.run("track-view-toggle-selection")
}

var testCase = {
    name: "Issue 12485: label the selected clip range",
    description: "Select a clip as an object and check the range of Add Label at Selection.",
    steps: [
        {
            name: "Create a two-second clip and a point selection outside it",
            func: function() {
                t.createClip()
                t.run("action://playback/seek?seekTime=0.5&triggerPlay=false")
                t.select(4, 4)
                t.equal(Project.selection.audioTracks[0].clips.length, 0, "No selected clip before the action")
            }
        },
        {
            name: "Select the clip as an object",
            func: function() {
                selectClip()
                // The point is outside the clip, so only object selection can include it.
                var selection = Project.selection
                t.near(selection.duration, 0, "Time selection duration")
                t.equal(selection.audioTracks.length, 1, "Selected audio track count")
                t.equal(selection.audioTracks[0].clips.length, 1, "Selected clip count")
                t.near(selection.audioTracks[0].clips[0].start, 0, "Selected clip start")
                t.near(selection.audioTracks[0].clips[0].end, 2, "Selected clip end")
            }
        },
        {
            name: "Add a label and check its range",
            func: function() {
                t.run("label-add")
                t.run("select-all-tracks")
                var tracks = Project.selection.labelTracks
                t.equal(tracks.length, 1, "Label track count")
                var labels = tracks[0].labels
                t.equal(labels.length, 1, "Selected label count")
                api.log.info("Created label range: [" + labels[0].start + ", " + labels[0].end + "]")
                t.near(labels[0].start, 0, "Label start")
                t.near(labels[0].end, 2, "Label end")
            }
        }
    ]
}

function main() {
    api.testflow.runTestCase(testCase)
}
