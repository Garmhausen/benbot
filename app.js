const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const { DateTime } = require('luxon');

/* 

the idea is to have a bot vote every ~3 seconds for about 30 seconds total, 
then pause for 3 minutes, and then continue voting for 30 seconds, pausing 3 mins, repeat until killed.

*/

chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
const driver = new Builder()
  .forBrowser('chrome')
  .build();

let innerInterval;

async function attemptClicks() {
  const clickBenAndClickVote = async () => {
    const ben = await driver.findElement(By.xpath('//span[text()="Ben Gilbert, Broughton"]'));
    const voteButton = await driver.findElement(By.xpath("//a[contains(concat(' ',normalize-space(@class),' '),' css-vote-button ')]//span"));
    await driver.executeScript("arguments[0].scrollIntoView()", ben);
    await ben.click();
    await voteButton.click();
  }

  const clickReturnToPoll = async () => {
    const returnToPoll = await driver.findElement(By.xpath('//a[text()="Return To Poll"]'));
    await returnToPoll.click();
  }

  // Sometimes the poll is slow to load and stutters.
  // If there is an error finding an element, it will check for the older state,
  // just kind of doing a flip/flop if needed.

  try {
    clickBenAndClickVote();
  } catch {
    clickReturnToPoll();
  }

  await driver.sleep(500); // .5 seconds

  try {
    clickReturnToPoll();
  } catch {
    clickBenAndClickVote();
  }
}

async function startInterval() {
  console.log('beginning a round of voting.', getTime());
  innerInterval = setInterval(async () => {
    await attemptClicks();
  }, 2000); // 2 seconds
}

function stopInterval() {
  console.log('waiting 3 minutes', getTime());
  clearInterval(innerInterval);
}

function startBot() {
  console.log('starting bot in 3 minutes...', getTime());
  setInterval(() => {
    startInterval();
    setTimeout(stopInterval, 30000); // 30 seconds
  }, 180000); // 3 minutes
}

const getTime = () => {
  return DateTime.now().toLocaleString(DateTime.TIME_WITH_SECONDS)
}

const init = () => {
  driver.get('https://www.newsobserver.com/sports/high-school/article249932279.html');
  startBot();
};

init();
