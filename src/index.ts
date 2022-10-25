/**
 * MIT License
 *
 * Copyright (c) 2020 Prasenjeet Symon
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author Prasenjeet Symon
 * @license MIT
 * @version 1.0.0
 * @description linkedin scrapper
 * @link https://github.com/prasenjeet-symon/linkedin-crawler
 *
 */

import dotenv from "dotenv";
import puppeteer from "puppeteer";
import { delayExecution, delay_time } from "./utils";
dotenv.config();

const LINKEDIN_LOGIN_PAGE = "https://www.linkedin.com/login";
let LINKEDIN_PROFILE_PAGES: string[] = [];

const runCrawler = async (email: string, password: string) => {
  LINKEDIN_PROFILE_PAGES = require("./URLS.json");

  const browser = await puppeteer.launch({
    headless: false,
    // args: ["--proxy-server=socks5://127.0.0.1:9050"], // connect to TOR
  });

  /************************************************************ */
  const incognitoB = await browser.createIncognitoBrowserContext();
  const page = await incognitoB.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.goto(LINKEDIN_LOGIN_PAGE, {
    waitUntil: "domcontentloaded",
  });
  /************************************************************ */
  /************************************************************ */
  await page.waitForSelector(".form__input--floating");
  await page.waitForSelector("#username");
  await page.waitForSelector("#password");
  await page.waitForSelector(".login__form_action_container > button");
  /************************************************************ */
  /************************************************************ */
  await page.focus("#username");
  await page.keyboard.type(email, { delay: delay_time() });
  /************************************************************ */
  /************************************************************ */
  await page.focus("#password");
  await page.keyboard.type(password, { delay: delay_time() });
  /************************************************************ */
  /************************************************************ */
  await page.click(".login__form_action_container > button", { delay: delay_time() });
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  await delayExecution(5000);
  /************************************************************ */
  /************************************************************ */
  for (const profilePageLink of LINKEDIN_PROFILE_PAGES) {
    console.log("\x1b[36m%s\x1b[0m", `Processing ${profilePageLink}`);
    try {
      /************************************************************ */
      const profilePage = await incognitoB.newPage();
      profilePage.setDefaultNavigationTimeout(0);
      await profilePage.goto(profilePageLink, {
        waitUntil: "domcontentloaded",
      });
      /************************************************************ */
      await delayExecution(15000);
      /************************************************************ */
      /************************************************************ */
      const featureCard = await profilePage.$(".pvs-carousel");
      let descriptionIndex = 0;
      if (featureCard) {
        descriptionIndex = 3;
      } else {
        descriptionIndex = 0;
      }
      /************************************************************ */
      /************************************************************ */
      const description = await profilePage.evaluate((descriptionIndex) => {
        return document.querySelectorAll(".pv-shared-text-with-see-more")[descriptionIndex].querySelector(".inline-show-more-text span.visually-hidden")?.textContent;
      }, descriptionIndex);
      /************************************************************ */
      /************************************************************ */
      const fullName = await profilePage.evaluate(() => {
        return document.querySelector(".pv-text-details__left-panel > div:nth-of-type(1) > h1")?.textContent?.trim();
      });
      /************************************************************ */
      /************************************************************ */
      const address = await profilePage.evaluate(() => {
        const nodes = document.querySelectorAll(".pv-text-details__left-panel");
        if (nodes.length > 0 && nodes.length === 2) {
          return nodes[1].querySelector("span:nth-of-type(1)")?.textContent?.trim();
        } else {
          return "";
        }
      });
      /************************************************************ */
      /************************************************************ */
      await profilePage.click("#top-card-text-details-contact-info", { delay: delay_time() });
      await delayExecution(5000);
      /************************************************************ */
      /************************************************************ */
      const contactEmail = await profilePage.evaluate(() => {
        const emailID = document.querySelector(".ci-email > div > a")?.getAttribute("href");
        if (emailID) {
          const email = emailID.split(":")[1];
          return email;
        } else {
          return null;
        }
      });
      /************************************************************ */
      /************************************************************ */
      const websiteUrl = await profilePage.evaluate(() => {
        const website = document.querySelector(".ci-websites > ul > li > a")?.getAttribute("href");
        return website;
      });
      /************************************************************ */
      /************************************************************ */
      const userID = profilePageLink.split("/")[4];
      const experienceURL = `https://www.linkedin.com/in/${userID}/details/experience/`;
      await profilePage.goto(experienceURL, {
        waitUntil: "domcontentloaded",
      });
      await delayExecution(15000);
      /************************************************************ */
      /************************************************************ */
      const experiences = await profilePage.evaluate(() => {
        const experienceListNodesMain = document.querySelectorAll(".pvs-list__container ul  li  div > div:nth-of-type(1) > div:nth-of-type(1) > div > span > span:nth-of-type(1)");
        if (experienceListNodesMain.length === 0) return "";
        const experienceList: string[] = [];

        experienceListNodesMain.forEach((experienceNode) => {
          const experience = experienceNode.textContent;
          experienceList.push(experience || "");
        });
        return experienceList.join(" / ");
      });
      /************************************************************ */
      /************************************************************ */
      const data = {
        id: 0,
        name: fullName,
        email: contactEmail,
        website: websiteUrl,
        city: address,
        experience: experiences,
        description: description,
      };

      const fs = require("fs");
      if (!fs.existsSync("data.json")) {
        fs.writeFileSync("data.json", JSON.stringify([]));
      }

      const oldData = fs.readFileSync("data.json", "utf8");
      if (!oldData) {
        fs.writeFileSync("data.json", JSON.stringify([data]));
      } else {
        const newData = JSON.parse(oldData);
        newData.push(data);
        fs.writeFileSync("data.json", JSON.stringify(newData));
      }
      /************************************************************ */
      /************************************************************ */
      await profilePage.close();
    } catch (error) {
      console.error("Error while processing ", profilePageLink);
    }
  }
  /************************************************************ */
  /************************************************************ */
  const fs = require("fs");
  const oldData = fs.readFileSync("data.json", "utf8");
  if (!oldData) {
    fs.writeFileSync("data.json", JSON.stringify([]));
  } else {
    const newData: any = JSON.parse(oldData);
    newData.forEach((data: any, index: number) => {
      data.id = index + 1;
    });
    fs.writeFileSync("data.json", JSON.stringify(newData));
  }

  await incognitoB.close();
  await browser.close();
  return;
};

// main function
async function main() {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;
  if (!email || !password) {
    throw new Error("email or password not found. Add the email and password in the .env file");
  }
  await runCrawler(email, password);
}

main()
  .then(() => {
    console.log("\x1b[32m%s\x1b[0m", "Crawler completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
