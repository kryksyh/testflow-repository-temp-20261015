/*
 * SPDX-License-Identifier: GPL-3.0-only
 * MuseScore-CLA-applies
 */

var testCase = {
    name: "Repository smoke pass",
    description: "Example only. This case checks the TestFlow execution context.",
    steps: [
        {
            name: "Read the script path",
            func: function() {
                var path = api.context.globalVal("script_path")
                if (typeof path !== "string" || path.length === 0) {
                    throw new Error("The script path is missing from the execution context.")
                }
            }
        }
    ]
}

function main() {
    api.testflow.runTestCase(testCase)
}
