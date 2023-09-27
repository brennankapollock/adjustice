import puppeteer from "puppeteer";
import fetch from "node-fetch";

const WORLDMARKET_URL =
  "https://www.worldmarket.com/p/sansur-rustic-pecan-live-edge-wood-coffee-table-565754.html?store=store174&targetid=pla-906465670315&lid=92700053663921975&campaignid=238407179&channel=online&acctid=21700000001660222&dsproductgroupid=906465670315&merchid=5165106&network=g&mrkgbflag=camp%3Dppc%3Agoogle%3A_pla_%2B_Brand&mrkgcl=660&product_id=565754&prodlang=en&prodctry=US&dskeywordid=92700053663921975&ds_s_inventory_feed_id=97700000007265821&creative=111621983699&camp=ppc%3Agoogle%3Apla%2BMerkle_Shopping_PLA%7CBrand%2BBrand%7CFurniture&gclid=CjwKCAjwsKqoBhBPEiwALrrqiMhndWgjRZ1MOoizqKNEjK8JTLNZbJuEBKsNtm2-rWs7f1EwLCXfpBoCkEwQAvD_BwE&locationid=9061109&adgroupid=30334060499&ds_s_kwgid=58700005278864536&device=c&gclsrc=aw.ds";
const EXPECTED_AMOUNT = "$400.00";

// const WORLDMARKET_URL =
//   "https://www.worldmarket.com/p/woven-bamboo-pendant-shade-105439.html?store=store174";

const getInfo = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(WORLDMARKET_URL, {
    waitUntil: "domcontentloaded",
  });

  const name = await page.evaluate(() => {
    const name = document.querySelector(".product-name").innerText;

    return { name };
  });

  const originalPrice = await page.evaluate(() => {
    const price = document.querySelector(".price").innerText;

    const regex = /(\$[0-9]+\.[0-9]{2})/;
    const match = price.match(regex);

    const originalPrice = match[0];

    return { originalPrice };
  });

  const finalPrice = await page.evaluate(() => {
    let finalPrice;
    const salePrice = document.querySelector(".sale-price")?.innerText;

    if (salePrice) {
      const regex = /(\$[0-9]+\.[0-9]{2})/;
      const match = salePrice.match(regex);
      finalPrice = match[0];
    } else {
      finalPrice = "0.00";
    }

    return { finalPrice };
  });

  console.log(name);

  console.log(originalPrice);

  console.log(finalPrice);

  // Close the browser
  await browser.close();

  const sendPush = async (finalPrice, name) => {
    const channelID = "TMB9EKb75zjmmTj16pct";
    const data = `Price went down: ${name.name} dropped to ${finalPrice.finalPrice}`;
    let headers = {
      method: "POST",
      body: data,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
      },
    };

    await fetch(`https://notify.run/${channelID}`, headers);
    return true;
  };

  const parsedFinal = parseFloat(finalPrice.finalPrice.replace(/[^0-9.]/g, ""));
  const parsedExpected = parseFloat(EXPECTED_AMOUNT.replace(/[^0-9.]/g, ""));

  if (parsedFinal <= parsedExpected) {
    sendPush(finalPrice, name);
    console.log(
      `${name.name} has gone down in price to ${finalPrice.finalPrice}`
    );
  } else {
    console.log(`${name.name} has not gone down in price!.`);
  }
};

export default getInfo;
