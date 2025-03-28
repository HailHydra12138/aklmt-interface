import consentTexts from "./consent-texts";

function add(a, b) {
  return a + b;
}

/**
 * Gets the text from the first task, or fallbacks to value returned by 'fn'
 */

function fromTask(field, fn) {
  return (...args) => {
    const text = args[0][args[0].length - 1]?.[field];
    if (text == null) {
      return fn(...args);
    }
    return typeof text === "function" ? text(...args) : text;
  };
}

/**
 * Gets the text from the condition itself under the "consent" key for the first task, or fallbacks to value returned by 'fn'
 */

function fromConditionText(field, fn) {
  return (...args) => {
    const text = consentTexts[args[2]]?.[field];
    if (text == null) {
      return fn(...args);
    }
    return typeof text === "function" ? text(...args) : text;
  };
}
/* Helpers */

const sigma = fromTask('sigma', () => 0);

const partsInstructions = fromConditionText("partsInstructions", (tasks, basePayment) => {
  return "";
});

const predictionCount = (tasks, basePayment) => {
  return tasks[0].forecastMode.split("+").length + (tasks[0].predictLongRunning ? 1 : 0);
};

const totalRounds = (tasks, basePayment) => {
  return (
    tasks.map((t) => t.trainingRounds).reduce(add, 0) +
    tasks.map((t) => t.testingRounds).reduce(add, 0)
  );
};

const basePayment = fromConditionText("basePayment", (tasks, basePayment) => {
  return basePayment;
});

const estimatedTime = fromConditionText("estimatedTime", (tasks, basePayment) => {
  return predictionCount(tasks, basePayment) === 1 ? "15" : "20";
});

const estimatedBonus = fromConditionText("estimatedBonus", (tasks, basePayment) => {
  return predictionCount(tasks, basePayment) === 1 ? "1.25" : "2.50";
});

const bonusDivisor = (tasks, basePayment) => {
  return tasks[0].bonusDivisor;
};

const predictionNextValues = (tasks, basePayment) => {
  switch (tasks[0].forecastMode) {
    case "1+2":
      return "next two values of the process";
    case "2":
      return "next value of the process";
    case "2":
      return "t+2 value of the process, i.e. 2 periods ahead of the current realization";
    case "1+10":
      return "the value of the process in 1 period and in 10 periods ahead of the last realized value";
    case "10":
      return "the value of the process 10 periods ahead of the last realized value";
    case "1+5":
      return "t+1 and t+5 values of the process, i.e. 1 period and 5 periods ahead of the current realization";
  }
  return "FORECAST_MODE_MISSING";
};

const additionalTasks = (tasks, basePayment) => ``;

const predictInstructions = (...args) => {
  switch (args[0].length) {
    case 1:
      return `In each of the ${totalRounds(
        ...args
      )} rounds, we will ask you to predict the ${predictionNextValues(
        ...args
      )}.`;
    case 2:
      return `In each of the 40 rounds in part 1 and part 2, we will ask you to predict the ${predictionNextValues(
        ...args
      )}.`;
  }
};

/* Main paragraphs */

const initialInstructions = (...args) => `
  <div style='text-align: center; font-size: 22px; font-weight: bold;'>
    Department of Psychology, University of Warwick<br>
    Participant Information Sheet
  </div><br>
  <div style='text-align: left; font-size: 16px;'>
    <p>
      <strong>Title of Project</strong>: Number Series Prediction Task<br>
      <strong>Name of Researcher</strong>: Jenny Zhou<br>
      <strong>Name of Supervisor</strong>: Prof. Adam Sanborn<br>
      <strong>Invitation</strong><br>
    </p>
    <p>
      You are invited to participate in a research study exploring how people make predictions. To be eligible for participation, individuals must be 18 years of age or older, possess a proficient level of English to comprehend the study materials, and provide informed consent to take part in the research.<br><br>
      This study has been reviewed and approved by the Department of Psychology Research Ethics Committee at the University of Warwick.<br><br>
      Please take the time to read the following information carefully. Please get in touch if there is anything that is not clear or if you would like more information.<br><br>
    </p>
    <p>
      <strong>What will happen?</strong><br>
      You will be asked to make forecasts about future occurrences of a random process using a web-based platform. The task consists of 40 rounds, and within each round, you'll make predictions for the following two rounds. Before the prediction, you'll be shown previous occurrences to help identify underlying patterns. This data may also be used for future research, and subject to your consent at the outset of this research project.<br><br>
      The study will take approximately 20 minutes.<br><br>
    </p>
    <p>
      <strong>Participant rights</strong><br>
      Your participation in this study is completely voluntary and choosing not to take part will not affect your rights in any way. You have the right to not answer or respond to any question that is asked of you. If you wish to withdraw from participating in the study, please withdraw at any time by closing the browser without giving any reason. Incomplete experiments will be discarded for analysis, and you can withdraw your data in the debrief by using 'please click here if you do not want your data to be used in this study.'<br><br>
    </p>
    <p>
      <strong>Benefits and risks</strong><br>
      There are no anticipated risks associated with participating in this study. Your participation in this study will help researchers gain insights into how people make predictions and contribute to improve predictive models.<br><br>
    </p>
    <p>
      <strong>Expenses and payments</strong><br>
      You will receive base payment of £3.0. You will also receive a bonus payment. The bonus payment will be at the maximum of £1.5, but the precise amount will depend on the accuracy of your predictions.<br><br>
    </p>
    <p>
      <strong>Confidentiality</strong><br>
      No identifiable data will be collected from you as part of this study. This means that once you finish the experiment, it will not be possible to withdraw this data as your individual responses cannot be identified but nor will it be possible to link your responses to you. If you wish to withdraw your data, please close the browser, or tick the ‘click here if you do not want your data to be used in this study’ option in the debrief.<br><br>
    </p>
    <p>
      <strong>What will happen to the data collected about me?</strong><br>
      We will use your data in the ways needed to conduct and analyse the research study. We will be using information from you to undertake this study and will act as the data controller for this study. We are committed to protecting the rights of individuals in line with data protection legislation.<br><br>
      During the data collection period, your data will be stored securely on University of Warwick servers. The data will only be accessed by the researchers and supervisors named above and will not be shared with any other organisations or institutes.<br><br>
      Your rights to access, change or move your information are limited, as we need to manage your information in specific ways in order for the research to be reliable and accurate. The University of Warwick has in place policies and procedures to keep your data safe.<br><br>
      Further information can be found in the University's Privacy notice for research here:<br>
      <a href='https://warwick.ac.uk/services/idc/dataprotection/privacynotices/researchprivacynotice'>https://warwick.ac.uk/services/idc/dataprotection/privacynotices/researchprivacynotice</a> or by contacting the Information and Data Compliance Team at <a href='mailto:GDPR@warwick.ac.uk'>GDPR@warwick.ac.uk</a>.<br><br>
    </p>
    <p>
      <strong>What will happen to the results of the study?</strong><br>
      The results of this study will be reported in the researchers' project reports. The results may also be reported in a journal publication/conference presentation. The project does not involve or report comparisons or evaluations of individuals; the results will be reported anonymously.<br><br>
    </p>
    <p>
      <strong>Further information/complaints</strong><br>
      If you have any questions about this study, or if you have a complaint about the way you have been dealt with during the study or any possible harm you might have suffered, please contact the person below, who is the supervisor of this study.<br><br>
      Prof. Adam Sanborn&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Email: <a href='mailto:a.n.sanborn@warwick.ac.uk'>a.n.sanborn@warwick.ac.uk</a><br>
      Department of Psychology<br>University of Warwick<br>Coventry<br>CV4 7AL<br><br>
      If you wish to raise a complaint on how we have handled your personal data, you can contact our Data Protection Officer who will investigate the matter: <a href='mailto:DPO@warwick.ac.uk'>DPO@warwick.ac.uk</a>.<br><br>
    </p>
    <div style='text-align: center; font-weight: bold;'>Thank you for taking the time to read this Participant Information Sheet.</div><br><br>
  </div>
`;

const paymentInstructions = (...args) => `

<!-- Understanding Check -->
  <div style="border: 2px solid black; padding: 15px; text-align: left; margin-top: 20px;">
    <p><strong>Understanding Check:</strong></p>
    <p>Please answer the following question by <strong>pressing A or B</strong>. If you answer incorrectly, 
    you will have the chance to review the instructions and try again.</p>

    <!-- Question 1 -->
    <p><strong>Question 1:</strong> We will randomly select one of your predictions with equal probability.</p>
    <p>A. Correct</p>
    <p>B. Incorrect</p>
    <select id="answer1" style="width: 50px; text-transform: uppercase;">
        <option value="" disabled selected> </option>
        <option value="A">A</option>
        <option value="B">B</option>
    </select>
    <br><br>

    <!-- Question 2 -->
    <p><strong>Question 2:</strong> Your predictions will influence the value of the sequence.</p>
    <p>A. Correct</p>
    <p>B. Incorrect</p>
    <select id="answer2" style="width: 50px; text-transform: uppercase;">
        <option value="" disabled selected> </option>
        <option value="A">A</option>
        <option value="B">B</option>
    </select>
  </div>
`;

const thankInstructions = (...args) => `
  <p>
    Thank you very much for your participation. This study will take you about ${estimatedTime(...args)} minutes to complete.
  </p>
`;

const bonusInstructions = (...args) => `
  <p>
    You will receive base payment of <b>£${basePayment(...args)}</b>. You will also receive a <b>bonus payment</b>. The maximum bonus amount will be <b>£${estimatedBonus(...args)}</b>, but the precise amount will depend on the accuracy of your predictions. ${additionalTasks(
  ...args
)}
  </p>
`;

const studyInstructions = (...args) => {
  let eq1 = `<svg xmlns="http://www.w3.org/2000/svg" width="19.065ex" height="1.808ex" role="img" focusable="false" viewBox="0 -583 8426.9 799" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" style="vertical-align: -0.489ex;"><defs><path id="MJX-1-TEX-I-1D465" d="M52 289Q59 331 106 386T222 442Q257 442 286 424T329 379Q371 442 430 442Q467 442 494 420T522 361Q522 332 508 314T481 292T458 288Q439 288 427 299T415 328Q415 374 465 391Q454 404 425 404Q412 404 406 402Q368 386 350 336Q290 115 290 78Q290 50 306 38T341 26Q378 26 414 59T463 140Q466 150 469 151T485 153H489Q504 153 504 145Q504 144 502 134Q486 77 440 33T333 -11Q263 -11 227 52Q186 -10 133 -10H127Q78 -10 57 16T35 71Q35 103 54 123T99 143Q142 143 142 101Q142 81 130 66T107 46T94 41L91 40Q91 39 97 36T113 29T132 26Q168 26 194 71Q203 87 217 139T245 247T261 313Q266 340 266 352Q266 380 251 392T217 404Q177 404 142 372T93 290Q91 281 88 280T72 278H58Q52 284 52 289Z"></path><path id="MJX-1-TEX-I-1D461" d="M26 385Q19 392 19 395Q19 399 22 411T27 425Q29 430 36 430T87 431H140L159 511Q162 522 166 540T173 566T179 586T187 603T197 615T211 624T229 626Q247 625 254 615T261 596Q261 589 252 549T232 470L222 433Q222 431 272 431H323Q330 424 330 420Q330 398 317 385H210L174 240Q135 80 135 68Q135 26 162 26Q197 26 230 60T283 144Q285 150 288 151T303 153H307Q322 153 322 145Q322 142 319 133Q314 117 301 95T267 48T216 6T155 -11Q125 -11 98 4T59 56Q57 64 57 83V101L92 241Q127 382 128 383Q128 385 77 385H26Z"></path><path id="MJX-1-TEX-N-3D" d="M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z"></path><path id="MJX-1-TEX-I-1D707" d="M58 -216Q44 -216 34 -208T23 -186Q23 -176 96 116T173 414Q186 442 219 442Q231 441 239 435T249 423T251 413Q251 401 220 279T187 142Q185 131 185 107V99Q185 26 252 26Q261 26 270 27T287 31T302 38T315 45T327 55T338 65T348 77T356 88T365 100L372 110L408 253Q444 395 448 404Q461 431 491 431Q504 431 512 424T523 412T525 402L449 84Q448 79 448 68Q448 43 455 35T476 26Q485 27 496 35Q517 55 537 131Q543 151 547 152Q549 153 557 153H561Q580 153 580 144Q580 138 575 117T555 63T523 13Q510 0 491 -8Q483 -10 467 -10Q446 -10 429 -4T402 11T385 29T376 44T374 51L368 45Q362 39 350 30T324 12T288 -4T246 -11Q199 -11 153 12L129 -85Q108 -167 104 -180T92 -202Q76 -216 58 -216Z"></path><path id="MJX-1-TEX-N-2B" d="M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z"></path><path id="MJX-1-TEX-I-1D70C" d="M58 -216Q25 -216 23 -186Q23 -176 73 26T127 234Q143 289 182 341Q252 427 341 441Q343 441 349 441T359 442Q432 442 471 394T510 276Q510 219 486 165T425 74T345 13T266 -10H255H248Q197 -10 165 35L160 41L133 -71Q108 -168 104 -181T92 -202Q76 -216 58 -216ZM424 322Q424 359 407 382T357 405Q322 405 287 376T231 300Q217 269 193 170L176 102Q193 26 260 26Q298 26 334 62Q367 92 389 158T418 266T424 322Z"></path><path id="MJX-1-TEX-N-2212" d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"></path><path id="MJX-1-TEX-N-31" d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"></path><path id="MJX-1-TEX-I-1D452" d="M39 168Q39 225 58 272T107 350T174 402T244 433T307 442H310Q355 442 388 420T421 355Q421 265 310 237Q261 224 176 223Q139 223 138 221Q138 219 132 186T125 128Q125 81 146 54T209 26T302 45T394 111Q403 121 406 121Q410 121 419 112T429 98T420 82T390 55T344 24T281 -1T205 -11Q126 -11 83 42T39 168ZM373 353Q367 405 305 405Q272 405 244 391T199 357T170 316T154 280T149 261Q149 260 169 260Q282 260 327 284T373 353Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="msub"><g data-mml-node="mrow"><g data-mml-node="mi" fill="black" stroke="black"><use data-c="1D465" xlink:href="#MJX-1-TEX-I-1D465"></use></g></g><g data-mml-node="mrow" transform="translate(605,-150) scale(0.707)"><g data-mml-node="mi" fill="black" stroke="black"><use data-c="1D461" xlink:href="#MJX-1-TEX-I-1D461"></use></g></g></g><g data-mml-node="mo" fill="black" stroke="black" transform="translate(1188,0)"><use data-c="3D" xlink:href="#MJX-1-TEX-N-3D"></use></g><g data-mml-node="mi" fill="black" stroke="black" transform="translate(2243.8,0)"><use data-c="1D707" xlink:href="#MJX-1-TEX-I-1D707"></use></g><g data-mml-node="mo" fill="black" stroke="black" transform="translate(3069,0)"><use data-c="2B" xlink:href="#MJX-1-TEX-N-2B"></use></g><g data-mml-node="mi" fill="black" stroke="black" transform="translate(4069.3,0)"><use data-c="1D70C" xlink:href="#MJX-1-TEX-I-1D70C"></use></g><g data-mml-node="msub" transform="translate(4586.3,0)"><g data-mml-node="mrow"><g data-mml-node="mi" fill="black" stroke="black"><use data-c="1D465" xlink:href="#MJX-1-TEX-I-1D465"></use></g></g><g data-mml-node="mrow" transform="translate(605,-150) scale(0.707)"><g data-mml-node="mi" fill="black" stroke="black"><use data-c="1D461" xlink:href="#MJX-1-TEX-I-1D461"></use></g><g data-mml-node="mo" fill="black" stroke="black" transform="translate(361,0)"><use data-c="2212" xlink:href="#MJX-1-TEX-N-2212"></use></g><g data-mml-node="mn" fill="black" stroke="black" transform="translate(1139,0)"><use data-c="31" xlink:href="#MJX-1-TEX-N-31"></use></g></g></g><g data-mml-node="mo" fill="black" stroke="black" transform="translate(6622.4,0)"><use data-c="2B" xlink:href="#MJX-1-TEX-N-2B"></use></g><g data-mml-node="msub" transform="translate(7622.7,0)"><g data-mml-node="mrow"><g data-mml-node="mi" fill="black" stroke="black"><use data-c="1D452" xlink:href="#MJX-1-TEX-I-1D452"></use></g></g><g data-mml-node="mrow" transform="translate(499,-150) scale(0.707)"><g data-mml-node="mi" fill="black" stroke="black"><use data-c="1D461" xlink:href="#MJX-1-TEX-I-1D461"></use></g></g></g></g></g></svg>`
  let eq2 = `<svg xmlns="http://www.w3.org/2000/svg" width="1.364ex" height="1.489ex" role="img" focusable="false" viewBox="0 -442 603 658" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" style="vertical-align: -0.489ex;"><defs><path id="MJX-2-TEX-I-1D707" d="M58 -216Q44 -216 34 -208T23 -186Q23 -176 96 116T173 414Q186 442 219 442Q231 441 239 435T249 423T251 413Q251 401 220 279T187 142Q185 131 185 107V99Q185 26 252 26Q261 26 270 27T287 31T302 38T315 45T327 55T338 65T348 77T356 88T365 100L372 110L408 253Q444 395 448 404Q461 431 491 431Q504 431 512 424T523 412T525 402L449 84Q448 79 448 68Q448 43 455 35T476 26Q485 27 496 35Q517 55 537 131Q543 151 547 152Q549 153 557 153H561Q580 153 580 144Q580 138 575 117T555 63T523 13Q510 0 491 -8Q483 -10 467 -10Q446 -10 429 -4T402 11T385 29T376 44T374 51L368 45Q362 39 350 30T324 12T288 -4T246 -11Q199 -11 153 12L129 -85Q108 -167 104 -180T92 -202Q76 -216 58 -216Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="mi" fill="black" stroke="black"><use data-c="1D707" xlink:href="#MJX-2-TEX-I-1D707"></use></g></g></g></svg>`
  let eq3 = `<svg xmlns="http://www.w3.org/2000/svg" width="8.085ex" height="2.262ex" role="img" focusable="false" viewBox="0 -750 3573.6 1000" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" style="vertical-align: -0.566ex;"><defs><path id="MJX-1-TEX-I-1D70C" d="M58 -216Q25 -216 23 -186Q23 -176 73 26T127 234Q143 289 182 341Q252 427 341 441Q343 441 349 441T359 442Q432 442 471 394T510 276Q510 219 486 165T425 74T345 13T266 -10H255H248Q197 -10 165 35L160 41L133 -71Q108 -168 104 -181T92 -202Q76 -216 58 -216ZM424 322Q424 359 407 382T357 405Q322 405 287 376T231 300Q217 269 193 170L176 102Q193 26 260 26Q298 26 334 62Q367 92 389 158T418 266T424 322Z"></path><path id="MJX-1-TEX-N-2208" d="M84 250Q84 372 166 450T360 539Q361 539 377 539T419 540T469 540H568Q583 532 583 520Q583 511 570 501L466 500Q355 499 329 494Q280 482 242 458T183 409T147 354T129 306T124 272V270H568Q583 262 583 250T568 230H124V228Q124 207 134 177T167 112T231 48T328 7Q355 1 466 0H570Q583 -10 583 -20Q583 -32 568 -40H471Q464 -40 446 -40T417 -41Q262 -41 172 45Q84 127 84 250Z"></path><path id="MJX-1-TEX-N-5B" d="M118 -250V750H255V710H158V-210H255V-250H118Z"></path><path id="MJX-1-TEX-N-30" d="M96 585Q152 666 249 666Q297 666 345 640T423 548Q460 465 460 320Q460 165 417 83Q397 41 362 16T301 -15T250 -22Q224 -22 198 -16T137 16T82 83Q39 165 39 320Q39 494 96 585ZM321 597Q291 629 250 629Q208 629 178 597Q153 571 145 525T137 333Q137 175 145 125T181 46Q209 16 250 16Q290 16 318 46Q347 76 354 130T362 333Q362 478 354 524T321 597Z"></path><path id="MJX-1-TEX-N-2C" d="M78 35T78 60T94 103T137 121Q165 121 187 96T210 8Q210 -27 201 -60T180 -117T154 -158T130 -185T117 -194Q113 -194 104 -185T95 -172Q95 -168 106 -156T131 -126T157 -76T173 -3V9L172 8Q170 7 167 6T161 3T152 1T140 0Q113 0 96 17Z"></path><path id="MJX-1-TEX-N-31" d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"></path><path id="MJX-1-TEX-N-5D" d="M22 710V750H159V-250H22V-210H119V710H22Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="mi" fill="black" stroke="black"><use data-c="1D70C" xlink:href="#MJX-1-TEX-I-1D70C"></use></g><g data-mml-node="mo" fill="black" stroke="black" transform="translate(794.8,0)"><use data-c="2208" xlink:href="#MJX-1-TEX-N-2208"></use></g><g data-mml-node="mo" fill="black" stroke="black" transform="translate(1739.6,0)"><use data-c="5B" xlink:href="#MJX-1-TEX-N-5B"></use></g><g data-mml-node="mn" fill="black" stroke="black" transform="translate(2017.6,0)"><use data-c="30" xlink:href="#MJX-1-TEX-N-30"></use><use data-c="2C" xlink:href="#MJX-1-TEX-N-2C" transform="translate(500,0)"></use><use data-c="31" xlink:href="#MJX-1-TEX-N-31" transform="translate(778,0)"></use></g><g data-mml-node="mo" fill="black" stroke="black" transform="translate(3295.6,0)"><use data-c="5D" xlink:href="#MJX-1-TEX-N-5D"></use></g></g></g></svg>`
  let eq4 = `<svg xmlns="http://www.w3.org/2000/svg" width="1.82ex" height="1.357ex" role="img" focusable="false" viewBox="0 -442 804.3 599.8" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" style="vertical-align: -0.357ex;"><defs><path id="MJX-2-TEX-I-1D452" d="M39 168Q39 225 58 272T107 350T174 402T244 433T307 442H310Q355 442 388 420T421 355Q421 265 310 237Q261 224 176 223Q139 223 138 221Q138 219 132 186T125 128Q125 81 146 54T209 26T302 45T394 111Q403 121 406 121Q410 121 419 112T429 98T420 82T390 55T344 24T281 -1T205 -11Q126 -11 83 42T39 168ZM373 353Q367 405 305 405Q272 405 244 391T199 357T170 316T154 280T149 261Q149 260 169 260Q282 260 327 284T373 353Z"></path><path id="MJX-2-TEX-I-1D461" d="M26 385Q19 392 19 395Q19 399 22 411T27 425Q29 430 36 430T87 431H140L159 511Q162 522 166 540T173 566T179 586T187 603T197 615T211 624T229 626Q247 625 254 615T261 596Q261 589 252 549T232 470L222 433Q222 431 272 431H323Q330 424 330 420Q330 398 317 385H210L174 240Q135 80 135 68Q135 26 162 26Q197 26 230 60T283 144Q285 150 288 151T303 153H307Q322 153 322 145Q322 142 319 133Q314 117 301 95T267 48T216 6T155 -11Q125 -11 98 4T59 56Q57 64 57 83V101L92 241Q127 382 128 383Q128 385 77 385H26Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="msub"><g data-mml-node="mrow"><g data-mml-node="mi" fill="black" stroke="black"><use data-c="1D452" xlink:href="#MJX-2-TEX-I-1D452"></use></g></g><g data-mml-node="mrow" transform="translate(499,-150) scale(0.707)"><g data-mml-node="mi" fill="black" stroke="black"><use data-c="1D461" xlink:href="#MJX-2-TEX-I-1D461"></use></g></g></g></g></g></svg>`
  
  switch(args[2]) {
  case "C3":
  case "C4":
    return `
      <p>
        In this study, we would like to understand how people make predictions about future realizations of random processes. We will first show you 40 past realizations from a fixed and stationary AR(1) process: ${eq1}, with a given ${eq2}, a given ${eq3}, and ${eq4} is an i.i.d. random shock. You will make predictions of the future value of the process for ${totalRounds(...args)} rounds.
      </p>
    `
  default:
    return `
      <p>
        In this study, we would like to understand how people make predictions about future realizations of random processes. We will first show you 40 past realizations of a process, and you will make predictions of its future value for ${totalRounds(...args)} rounds. <b>${fromTask('processInfo', () => '')(...args)}</b>  ${partsInstructions(...args)}
      </p>
    `
  }
}

const scoreInstructions = (...args) => `
  <p>
    <b>${predictInstructions(
      ...args
    )}</b> You will receive a score for each prediction you make. The more accurate your predictions are, the higher your score will be. If your prediction is out of certain neighborhood around the actual value, you may receive a score of zero. The specific formula for the score of each prediction is 100 &times; max(0, 1 - |&Delta;| / ${sigma(
  ...args
)}) where &Delta; is the difference between your prediction and the realized value. 
  </p>
  ${
    args[0][0].predictLongRunning
      ? `  <p>
      <b>In each of the 40 rounds, we will also ask you to predict the long-run average of the process.</b> You will receive a score for this assessment as well. The specific formula for the score is 100 × max(0, 1 - |Δ| / 20) where Δ is the difference between your prediction and the true value. 
  </p>`
      : ``
  }
`;

const endInstructions = fromConditionText(
  "endInstructions",
  (...args) => `
    <p>
      At the end of the experiment, we will randomly select one of your predictions from the ${totalRounds(...args)} rounds and use its corresponding score to calculate your bonus. <i>You will receive the bonus payment in GBP which is equal to your selected score divided by ${bonusDivisor(...args)}.</i>
    </p>
  `
);

export function consent(...args) {
  return `
    <div style='text-align: center; font-size: 22px; font-weight: bold;'>
      Consent Form
    </div><br>
    <div style='text-align: left; font-size: 16px;'>
      <h6><b>Title of Project:</b></h6>
      <p>Number Series Prediction Task</p>
      
      <h6><b>Name of Researcher:</b></h6>
      <p>Jenny Zhou</p>
      
      <h6><b>Name of Supervisor:</b></h6>
      <p>Prof. Adam Sanborn</p>
      
      <h6><b>By checking the box below, I confirm that:</b></h6>
      <ul>
        <li>I have read and understand the information sheet for the above study. I have had the opportunity to consider the information, ask questions by contacting the researcher (<a href="mailto:yuqi.zhou@warwick.ac.uk">yuqi.zhou@warwick.ac.uk</a>) and have had these answered satisfactorily.</li>
        <li>I understand that my participation is voluntary and that I am free to withdraw at any time by closing the browser without giving any reason, without my legal rights being affected.</li>
        <li>I understand that my data collected during the study may be looked at by the researcher (Jenny Zhou) and their supervisor (Prof. Adam Sanborn) from the University of Warwick. I give permission for these individuals to access my data.</li>
        <li>I understand that my data may be used in future research.</li>
        <li>I confirm that I am over 18 years of age.</li>
        <li>I agree to take part in the above study.</li>
      </ul>
    </div>
  `;
}

export const instructions = (...args) => `
  <div class="consent-wrapper mt-3">
    ${thankInstructions(...args)}
    ${bonusInstructions(...args)}
    ${studyInstructions(...args)}
    ${scoreInstructions(...args)}
    ${endInstructions(...args)} 
    ${paymentInstructions(...args)} 
  </div>
`;

export const instructions2 = (...args) => `
  <div class="consent-wrapper mt-3">
    ${initialInstructions(...args)}
  </div>
`;
