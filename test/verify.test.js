const http = require("http");
const fs = require("fs");
const puppeteer = require("puppeteer");

let server;
let browser;
let page;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    const filePath = __dirname + "/.." + req.url;
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "File not found" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  });

  const PORT = process.env.PORT || 3000;
  await new Promise((resolve) => server.listen(PORT, resolve));
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(async () => {
  browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  page = await browser.newPage();
  await page.goto("http://localhost:3000/index.html");
});

afterEach(async () => {
  await browser.close();
});

describe("anchor", () => {
  it("should contain a div with the id of footer", async () => {
    const footer = await page.$('div[id="footer"]');
    expect(footer).not.toBeNull();
  });

  it("should link to footer id", async () => {
    const inPageAnchor = await page.$('a[href="#footer"]');
    expect(inPageAnchor).not.toBeNull();
  });

  it("should open a website in a new tab", async () => {
    const tabAnchor = await page.$('a[href^="http"][target="_blank"]');
    expect(tabAnchor).not.toBeNull();
  });

  it("should open a website in the same page", async () => {
    const samePageAnchor = await page.$(
      'a[href^="http"]:not([target="_blank"])'
    );
    expect(samePageAnchor).not.toBeNull();
  });
});
