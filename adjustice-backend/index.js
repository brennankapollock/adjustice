const express = require("express");
const puppeteer = require("puppeteer");
const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Origin",
    "chrome-extension://gbcfnioibdcnflaoennokgjhoafokjbm"
  ); // update to match the domain you will make the request from

  next();
});

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

  const infoObject = {
    name: name,
    originalPrice: originalPrice,
    finalPrice: finalPrice,
  };

  await browser.close();

  app.get("/info", (req, res) => {
    res.send(infoObject);
  });

  return { name, originalPrice, finalPrice };
};

getInfo();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
