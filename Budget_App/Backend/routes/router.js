Routes;
const fs = require("fs");
const path = require("path");
const sendJson = require("../utils/sendJson");

function sendJSON(res, fileName) {
  const filePath = path.join(__dirname, "../data", fileName);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Data not found" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(data);
  });
}

module.exports = function (req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  switch (pathname) {
    case "/api/addnewcard":
      return sendJSON(res, "addnewcard.json");
    case "/api/addnewrecipient":
      return sendJSON(res, "addnewrecipient.json");
    case "/api/auth":
      return sendJSON(res, "auth.json");
    case "/api/bankhistory":
      return sendJSON(res, "bankhistory.json");
    case "/api/banque":
      return sendJSON(res, "banque.json");
    case "/api/bill":
      return sendJSON(res, "bill.json");
    case "/api/cardinfo":
      return sendJSON(res, "cardinfo.json");
    case "/api/cards":
      return sendJSON(res, "cards.json");
    case "/api/changepw":
      return sendJSON(res, "changepw.json");
    case "/api/contacts":
      return sendJSON(res, "contacts.json");
    case "/api/creatnewpwd":
      return sendJSON(res, "creatnewpwd.json");
    case "/api/dealmanagement":
      return sendJSON(res, "dealmanagement.json");
    case "/api/dealmanagement2":
      return sendJSON(res, "dealmanagement2.json");
    case "/api/detailcontact":
      return sendJSON(res, "detailcontact.json");
    case "/api/editprofil":
      return sendJSON(res, "editprofil.json");
    case "/api/electricity":
      return sendJSON(res, "electricity.json");
    case "/api/film":
      return sendJSON(res, "film.json");
    case "/api/giftcarddetail":
      return sendJSON(res, "giftcarddetail.json");
    case "/api/home":
      return sendJSON(res, "home.json");
    case "/api/inscription":
      return sendJSON(res, "inscription.json");
    case "/api/internet":
      return sendJSON(res, "internet.json");
    case "/api/login":
      return sendJSON(res, "login.json");
    case "/api/mycontact":
      return sendJSON(res, "mycontact.json");
    case "/api/resetpwd":
      return sendJSON(res, "resetpwd.json");
    case "/api/rewards":
      return sendJSON(res, "rewards.json");
    case "/api/securitycenter":
      return sendJSON(res, "securitycenter.json");
    case "/api/setting":
      return sendJSON(res, "setting.json");
    case "/api/topup":
      return sendJSON(res, "topup.json");
    case "/api/transactions":
      return sendJSON(res, "transactions.json");
    case "/api/transferbank":
      return sendJSON(res, "transferbank.json");
    case "/api/transferbybank":
      return sendJSON(res, "transferbybank.json");
    case "/api/transferconfirm":
      return sendJSON(res, "transferconfirm.json");
    case "/api/transfer":
      return sendJSON(res, "transfer.json");
    case "/api/user":
      return sendJSON(res, "user.json");
    case "/api/waterbill":
      return sendJSON(res, "waterbill.json");

    default:
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Route not found" }));
  }
};
