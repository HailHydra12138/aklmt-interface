class SeedRandom {
  constructor(seed) {
    this.seed = this.hashSeed(seed);
    this.next();
  }

  hashSeed(seed) {
    if (typeof seed === 'object') {
      return seed ? [...JSON.stringify(seed)].reduce((a, c) => a + c.charCodeAt(0), 0) : 0;
    }
    return typeof seed === 'number' ? seed : 0;
  }

  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }

  random() {
    return this.next();
  }

  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

function sum(a, b) {
  return a + b;
}
function calculateBonus(score, task) {
  return Math.round((score / task.bonusDivisor) * 100) / 100;
}
module.exports.calculateBonus = calculateBonus;

module.exports.totalScore = module.exports.totalExperimentScore;
module.exports.totalEarnings = function (assignment) {
  return assignment.tasks
    .map((task, i) => {
      return calculateBonus(module.exports.totalTaskScore(i, assignment).totalScore, task);
    })
    .reduce(sum, 0);
};

module.exports.totalBonus = (result, tasks) => {
  return module.exports.totalEarnings({ ...result, tasks });
};

function scoreForPrediction (task, predicted, actual) {
  var delta = Math.abs(predicted - actual);
  var score = Math.max(0, 1 - delta / task.sigma) * 100;
  return Math.round(score);
};

function getForecastModes(task) {
  const modes = task.forecastMode.split("+").map((p) => parseInt(p));
  if (modes.length > 2) {
    throw "only up to two predictions are supported per round";
  }
  return modes;
}

function getPredictions(roundN, predictions, task) {
  const forecastModes = getForecastModes(task);
  return forecastModes.map((fm, i) => {
    return predictions[roundN * 2 + i];
  });
}

function getActuals(roundN, actuals, task) {
  const forecastModes = getForecastModes(task);
  return forecastModes.map((fm, i) => {
    return actuals[40 + roundN + fm - 1];
  });
}

module.exports.totalTaskScore = function (taskN, assignment) {
  const task = assignment.tasks[taskN];
  const predictionsArr = assignment.predictions[taskN];
  const actualsArr = assignment.values[taskN];
  const longRunningAveragePredHistArr = assignment.longRunningAveragePredHist[taskN];
  let totalScore = 0;

  // 使用 assignment id 作为随机种子，并选择一个随机回合作为 bonus round
  const seed = assignment.surveyTime;
  const random = new SeedRandom(seed);
  const total_round_idx = task.trainingRounds + task.testingRounds - 1;
  const bonusRound = random.randomInt(0, total_round_idx);

  for (var roundN = 0; roundN < (task.trainingRounds + task.testingRounds); roundN++) {
    if (roundN !== bonusRound) {
      continue;
    }
    if (roundN >= task.trainingRounds) {
      const predictions = getPredictions(roundN, predictionsArr, task);
      const actuals = getActuals(roundN, actualsArr, task);

      if (predictions.length > 1) {
        // 生成一个随机索引 0 或 1（如果有两个预测值）
        const randomIndex = new SeedRandom(seed + roundN).randomInt(0, predictions.length - 1);
        totalScore += scoreForPrediction(task, predictions[randomIndex], actuals[randomIndex]);
      } else {
        // 如果只有一个预测值，直接计算
        totalScore += scoreForPrediction(task, predictions[0], actuals[0]);
      }

      // 如果任务要求长期预测，则计算长期预测得分
      if (task.predictLongRunning) {
        totalScore += scoreForPrediction(task, longRunningAveragePredHistArr[roundN], 0);
      }
    }
  }
  return totalScore;
};

module.exports.totalExperimentScore = function (assignment) {
  let totalScore = 0;
  for (var taskN = 0; taskN < assignment.tasks.length; taskN++) {
    totalScore += module.exports.totalTaskScore(taskN, assignment).totalScore;
  }
  return totalScore;
};
module.exports.totalScore = module.exports.totalExperimentScore;

module.exports.getScore = function (roundN, predictionsArr, actualsArr, task) {
  const actuals = getActuals(roundN, actualsArr, task);
  const predictions = getPredictions(roundN, predictionsArr, task);
  return predictions.map((p, i) => {
    return scoreForPrediction(task, p, actuals[i]);
  })
}


module.exports.getPredictions = getPredictions;
module.exports.getActuals = getActuals;
module.exports.scoreForPrediction = scoreForPrediction;
module.exports.getForecastModes = getForecastModes;
