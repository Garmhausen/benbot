const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const { DateTime } = require('luxon');

/* 

the idea is to have a bot vote every ~3 seconds for about 30 seconds total, 
then pause for 10 minutes, and then continue voting for 30 seconds, pausing 10 mins, repeat until killed.

*/

 chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
const driver = new Builder()
  .forBrowser('chrome')
  .build();

let innerInterval;

async function attemptClicks() {
  let ben, voteButton, returnToPoll;

  try {
    ben = driver.findElement(By.xpath('//span[text()="Ben Gilbert, Broughton"]'));
    voteButton = driver.findElement(By.xpath("//a[contains(concat(' ',normalize-space(@class),' '),' css-vote-button ')]//span"));
    await (await driver).executeScript("arguments[0].scrollIntoView()", ben);
    (await ben).click();
    (await voteButton).click();
  } catch {
    returnToPoll = driver.findElement(By.xpath('//a[text()="Return To Poll"]'));
    (await returnToPoll).click();
  }

  await (await driver).sleep(500); // .5 seconds

  try {
    returnToPoll = driver.findElement(By.xpath('//a[text()="Return To Poll"]'));
    (await returnToPoll).click();
  } catch {
    ben = driver.findElement(By.xpath('//span[text()="Ben Gilbert, Broughton"]'));
    voteButton = driver.findElement(By.xpath("//a[contains(concat(' ',normalize-space(@class),' '),' css-vote-button ')]//span"));
    await (await driver).executeScript("arguments[0].scrollIntoView()", ben);
    (await ben).click();
    (await voteButton).click();
  }
}

async function startInterval() {
  console.log('beginning a round of voting.', DateTime.now().toLocaleString(DateTime.TIME_WITH_SECONDS));
  innerInterval = setInterval(async () => {
    await attemptClicks();
  }, 2000); // 2 seconds
}

function stopInterval() {
  console.log('waiting 5 minutes', DateTime.now().toLocaleString(DateTime.TIME_WITH_SECONDS));
  clearInterval(innerInterval);
}

function startBot() {
  console.log('starting bot in 3 minutes...', DateTime.now().toLocaleString(DateTime.TIME_WITH_SECONDS));
  setInterval(() => {
    startInterval();
    setTimeout(stopInterval, 30000); // 30 seconds
  }, 300000); // 5 minutes
}

const init = () => {
  driver.get('https://www.newsobserver.com/sports/high-school/article249932279.html');
  startBot();
};

init();