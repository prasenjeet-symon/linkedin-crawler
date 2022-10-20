import dotenv from "dotenv";
import puppeteer from "puppeteer";
import { delayExecution, delay_time } from "./utils";
dotenv.config();

const LINKEDIN_LOGIN_PAGE = "https://www.linkedin.com/login";
let LINKEDIN_PROFILE_PAGES: string[] = [];

// linkedin scrapper v1.0.0

const loginToLinkedin = async (email: string, password: string) => {
  // load the URLS using require
  LINKEDIN_PROFILE_PAGES = require("./URLS.json");

  const browser = await puppeteer.launch({
    headless: false,
    // args: ["--proxy-server=socks5://127.0.0.1:9050"], // for the tor network
  });

  const incognitoB = await browser.createIncognitoBrowserContext();
  const page = await incognitoB.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.goto(LINKEDIN_LOGIN_PAGE, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector(".form__input--floating");
  await page.waitForSelector("#username");
  await page.waitForSelector("#password");
  await page.waitForSelector(".login__form_action_container > button");

  // fill the email id
  await page.focus("#username");
  await page.keyboard.type(email, { delay: delay_time() });

  // fill the password
  await page.focus("#password");
  await page.keyboard.type(password, { delay: delay_time() });

  await delayExecution(delay_time());

  // click the login button
  await page.click(".login__form_action_container > button", { delay: delay_time() });

  // wait for the feed page
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });

  for (const profilePageLink of LINKEDIN_PROFILE_PAGES) {
    console.log("profile -->", profilePageLink);

    const profilePage = await incognitoB.newPage();
    profilePage.setDefaultNavigationTimeout(0);

    await profilePage.goto(profilePageLink, {
      waitUntil: "domcontentloaded",
    });

    await delayExecution(10000);

    // check of the feature card is available or not
    const featureCard = await profilePage.$(".pvs-carousel");
    let descriptionIndex = 0;
    if (featureCard) {
      // there is a feature card
      descriptionIndex = 3;
    } else {
      // there is no feature card
      descriptionIndex = 0;
    }

    // get the description
    const description = await profilePage.evaluate((descriptionIndex) => {
      return document.querySelectorAll(".pv-shared-text-with-see-more")[descriptionIndex].querySelector(".inline-show-more-text span.visually-hidden")?.textContent;
    }, descriptionIndex);

    // click the contact info button
    await profilePage.click("#top-card-text-details-contact-info", { delay: delay_time() });
    await delayExecution(1000);

    // get the contact info email
    const contactEmail = await profilePage.evaluate(() => {
      const emailID = document.querySelector(".ci-email > div > a")?.getAttribute("href");
      if (emailID) {
        const email = emailID.split(":")[1];
        return email;
      } else {
        return null;
      }
    });

    // get the contact info website
    const websiteUrl = await profilePage.evaluate(() => {
      const website = document.querySelector(".ci-websites > ul > li > a")?.getAttribute("href");
      return website;
    });

    // extract the the experience
    // open the experience page
    const userID = profilePageLink.split("/")[4];
    const experienceURL = `https://www.linkedin.com/in/${userID}/details/experience/`;
    await profilePage.goto(experienceURL, {
      waitUntil: "domcontentloaded",
    });
    await delayExecution(10000);

    // get the experience
    const experiences = await profilePage.evaluate(() => {
      const experienceListNodesMain = document.querySelectorAll(".pvs-list__container ul  li  div > div:nth-of-type(1) > div:nth-of-type(1) > div > span > span:nth-of-type(1)");
      if (experienceListNodesMain.length === 0) return "";
      const experienceList: string[] = [];

      experienceListNodesMain.forEach((experienceNode) => {
        const experience = experienceNode.textContent;
        experienceList.push(experience || "");
      });
      return experienceList.join(" | ");
    });

    // prepare the JSON data
    const data = {
      description,
      contactEmail,
      websiteUrl,
      experiences,
    };

    // convert to json and save to the file
    const fs = require("fs");
    // create data.json if not exit
    if (!fs.existsSync("data.json")) {
      fs.writeFileSync("data.json", JSON.stringify([]));
    }

    // read the old data if any and append the new data
    const oldData = fs.readFileSync("data.json", "utf8");
    if (!oldData) {
      fs.writeFileSync("data.json", JSON.stringify([data]));
    } else {
      const newData = JSON.parse(oldData);
      newData.push(data);
      fs.writeFileSync("data.json", JSON.stringify(newData));
    }

    // close the profile page
    await profilePage.close();
  }

  throw new Error("completed");
};

(async () => {
  let keep_running = true;
  while (keep_running) {
    try {
      console.log("starting the script");
      const email = process.env.EMAIL;
      const password = process.env.PASSWORD;

      if (!email || !password) {
        throw new Error("email or password not found. Add the email and password in the .env file");
      }

      await loginToLinkedin(email, password);
    } catch (error) {
      console.error(error, "ERROR");
      keep_running = false;
    }
  }
})();
