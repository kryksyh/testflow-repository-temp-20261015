/*
 * SPDX-License-Identifier: GPL-3.0-only
 */

var t = require("helpers/TestSupport.js")
var Project = t.project

var testCase = {
    name: "Issue 11660: paste at the time selection",
    description: "Paste a two-second clip at the selection start while the playhead is elsewhere.",
    steps: [
        {
            name: "Create and copy a two-second clip",
            func: function() {
                t.createClip()
                t.select(0, 2)
                t.run("clip-copy-selected")
            }
        },
        {
            name: "Put the playhead at 1 s and select 4 to 6 s",
            func: function() {
                t.run("action://playback/seek?seekTime=1&triggerPlay=false")
                t.select(4, 6)
                t.equal(Project.clipCount(0), 1, "Clip count before paste")
            }
        },
        {
            name: "Paste and check both clip ranges",
            func: function() {
                // Use an explicit paste mode to avoid dependence on user preferences.
                t.run("action://trackedit/paste-overlap")
                var clips = Project.clipsOnTrack(0)
                var ranges = []
                for (var i = 0; i < clips.length; i++) {
                    ranges.push("[" + clips[i].start + ", " + clips[i].end + "]")
                }
                api.log.info("Clip ranges after paste: " + ranges.join(", "))
                t.equal(clips.length, 2, "Clip count after paste")
                t.near(clips[0].start, 0, "Source clip start after paste")
                t.near(clips[0].end, 2, "Source clip end after paste")
                t.near(clips[1].start, 4, "Pasted clip start")
                t.near(clips[1].end, 6, "Pasted clip end")
            }
        }
    ]
}

function main() {
    api.testflow.runTestCase(testCase)
}
