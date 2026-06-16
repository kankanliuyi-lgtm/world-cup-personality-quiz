import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:4173/";
const outputDir = path.resolve("screenshots");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [];

page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(baseURL, { waitUntil: "networkidle" });
await page.screenshot({
  path: path.join(outputDir, "mobile-home.png"),
  fullPage: true,
});

const homeMetrics = await page.evaluate(() => ({
  viewportWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  height: document.documentElement.scrollHeight,
}));

await page.getByRole("button", { name: /测测我是哪位球星/ }).click();
await page.screenshot({
  path: path.join(outputDir, "mobile-question.png"),
  fullPage: true,
});
for (let index = 0; index < 12; index += 1) {
  await page.locator(".option").first().click();
  await page.waitForTimeout(260);
}

await page.getByRole("heading", { level: 1 }).waitFor();
const resultName = await page.getByRole("heading", { level: 1 }).textContent();
await page.screenshot({
  path: path.join(outputDir, "mobile-result.png"),
  fullPage: true,
});
await page.locator(".player-card").screenshot({
  path: path.join(outputDir, "mobile-player-card.png"),
});

const resultMetrics = await page.evaluate(() => ({
  viewportWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  height: document.documentElement.scrollHeight,
  cardWidth: document.querySelector(".player-card")?.getBoundingClientRect().width,
  dimensionCount: document.querySelectorAll(".dimension-item").length,
  jerseyNumber: document.querySelector(".card-jersey-number")?.textContent,
  displayNumber: document.querySelector(".card-number")?.textContent,
}));

const resultCoverage = await page.evaluate(() => {
  const {
    questions,
    personalities,
    findResult,
    addScore,
    calculateProfile,
    getSubtype,
    getTypeCode,
  } = window.__quizDebug;

  const archetypeChecks = personalities.map((personality) => {
    let scores = { attack: 0, social: 0, decision: 0, pressure: 0 };
    const answers = questions.map((question) => {
      const dimensionIndex = ["attack", "social", "decision", "pressure"].indexOf(
        question.dimension,
      );
      const optionIndex = personality.target[dimensionIndex] > 0 ? 0 : 3;
      scores = addScore(
        scores,
        question,
        question.options[optionIndex].value,
      );
      return optionIndex;
    });
    return {
      expected: personality.id,
      actual: findResult(scores).id,
      answers,
      typeCode: getTypeCode(scores),
      subtype: getSubtype(scores),
      profileTotalsValid: calculateProfile(scores).every(
        (item) => item.positivePercent + item.negativePercent === 100,
      ),
    };
  });

  const binaryCombinations = [];
  for (let mask = 0; mask < 16; mask += 1) {
    const scores = {
      attack: mask & 1 ? 6 : -6,
      social: mask & 2 ? 6 : -6,
      decision: mask & 4 ? 6 : -6,
      pressure: mask & 8 ? 6 : -6,
    };
    binaryCombinations.push({
      code: getTypeCode(scores),
      result: findResult(scores).id,
    });
  }

  return {
    archetypeChecks,
    binaryCombinations,
  };
});

const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: /保存结果卡/ }).click();
const download = await downloadPromise;
await download.saveAs(path.join(outputDir, "generated-result-card.png"));

const desktopPage = await context.newPage();
await desktopPage.setViewportSize({ width: 1440, height: 1000 });
await desktopPage.goto(baseURL, { waitUntil: "networkidle" });
await desktopPage.screenshot({
  path: path.join(outputDir, "desktop-home.png"),
  fullPage: true,
});

const failed =
  errors.length > 0 ||
  homeMetrics.scrollWidth > homeMetrics.viewportWidth ||
  resultMetrics.scrollWidth > resultMetrics.viewportWidth ||
  resultMetrics.dimensionCount !== 4 ||
  resultMetrics.jerseyNumber !== resultMetrics.displayNumber ||
  resultCoverage.archetypeChecks.some(
    (item) => item.expected !== item.actual || !item.profileTotalsValid,
  ) ||
  new Set(resultCoverage.binaryCombinations.map((item) => item.code)).size !==
    16 ||
  !resultName;

console.log(
  JSON.stringify(
    {
      status: failed ? "failed" : "passed",
      resultName,
      homeMetrics,
      resultMetrics,
      resultCoverage,
      errors,
      downloaded: "screenshots/generated-result-card.png",
    },
    null,
    2,
  ),
);

await browser.close();
if (failed) process.exitCode = 1;
