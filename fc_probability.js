

function generateProbabilities(upgradeMult, minBase, maxMult) {
    const cumProb = [];
    let remainingProbability = 1;
    const minTime = minBase * upgradeMult;
    const maxTime = maxMult * minTime;
    const spanTime = maxTime - minTime;
    for (let i = 0; i < maxTime; i++) {
        const thisFrame =
            remainingProbability * Math.pow(Math.max(0, (i - minTime) / spanTime), 5);
        remainingProbability -= thisFrame;
        cumProb.push(1 - remainingProbability);
    }
    return cumProb;
}

const CUMULATIVE_PROBABILITIES = {
    golden: [1, 0.95, 0.5, 0.475, 0.25, 0.2375].reduce(function (r, x) {
        r[x] = generateProbabilities(x, 5 * 60 * Game.fps, 3);
        return r;
    }, {}),
    reindeer: [1, 0.5].reduce(function (r, x) {
        r[x] = generateProbabilities(x, 3 * 60 * Game.fps, 2);
        return r;
    }, {}),
};

function getProbabilityList(listType) {
    return CUMULATIVE_PROBABILITIES[listType][getProbabilityModifiers(listType)];
}

function getProbabilityModifiers(listType) {
    switch (listType) {
        case "golden":
            return (
                (Game.Has("Lucky day") ? 0.5 : 1) *
                (Game.Has("Serendipity") ? 0.5 : 1) *
                (Game.Has("Golden goose egg") ? 0.95 : 1)
            );
        case "reindeer":
            return Game.Has("Reindeer baking grounds") ? 0.5 : 1;
    }
    return 1;
}

export function probabilitySpan(listType, start, endProbability) {
    const startProbability = getProbabilityList(listType)[start];
    return _.sortedIndex(
        getProbabilityList(listType),
        startProbability + endProbability - startProbability * endProbability
    );
}
