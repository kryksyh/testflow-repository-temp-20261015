/*
 * SPDX-License-Identifier: GPL-3.0-only
 * MuseScore-CLA-applies
 */

var testCase = {
    name: "Repository deliberate failure",
    description: "This example does not reproduce a reported application issue.",
    steps: [
        {
            name: "Report the example failure",
            func: function() {
                throw new Error("This failure is intentional. Use it to inspect the review workflow.")
            }
        }
    ]
}

function main() {
    api.testflow.runTestCase(testCase)
}
