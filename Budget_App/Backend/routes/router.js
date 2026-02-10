const fs = require("fs");
const path = require("path");
const url = require("url");
const sendHtml = require("../utils/sendHtml");

module.exports = function (req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  switch (pathname) {
    case "/api/addnewcard":
      return sendHtml(res, "addnewcard.html");
    case "/api/addnewrecipient":
      return sendHtml(res, "addnewrecipient.html");
    case "/api/auth":
      return sendHtml(res, "auth.html");
    case "/api/bankhistory":
      return sendHtml(res, "bankhistory.html");
    case "/api/banque":
      return sendHtml(res, "banque.html");
    case "/api/bill":
      return sendHtml(res, "bill.html");
    case "/api/cardinfo":
      return sendHtml(res, "cardinfo.html");
    case "/api/cards":
      return sendHtml(res, "cards.html");
    case "/api/changepw":
      return sendHtml(res, "changepw.html");
    case "/api/contacts":
      return sendHtml(res, "contacts.html");
    case "/api/creatnewpwd":
      return sendHtml(res, "creatnewpwd.html");
    case "/api/dealmanagement":
      return sendHtml(res, "dealmanagement.html");
    case "/api/dealmanagement2":
      return sendHtml(res, "dealmanagement2.html");
    case "/api/detailcontact":
      return sendHtml(res, "detailcontact.html");
    case "/api/editprofil":
      return sendHtml(res, "editprofil.html");
    case "/api/electricity":
      return sendHtml(res, "electricity.html");
    case "/api/film":
      return sendHtml(res, "film.html");
    case "/api/giftcarddetail":
      return sendHtml(res, "giftcarddetail.html");
    case "/api/home":
      return sendHtml(res, "index.html");
    case "/api/inscription":
      return sendHtml(res, "inscription.html");
    case "/api/internet":
      return sendHtml(res, "internet.html");
    case "/api/login":
      return sendHtml(res, "login.html");
    case "/api/mycontact":
      return sendHtml(res, "mycontact.html");
    case "/api/resetpwd":
      return sendHtml(res, "resetpwd.html");
    case "/api/rewards":
      return sendHtml(res, "rewards.html");
    case "/api/securitycenter":
      return sendHtml(res, "securitycenter.html");
    case "/api/setting":
      return sendHtml(res, "setting.html");
    case "/api/topup":
      return sendHtml(res, "topup.html");
    case "/api/transactions":
      return sendHtml(res, "transactions.html");
    case "/api/transferbank":
      return sendHtml(res, "transferbank.html");
    case "/api/transferbybank":
      return sendHtml(res, "transferbybank.html");
    case "/api/transferconfirm":
      return sendHtml(res, "transferconfirm.html");
    case "/api/transfer":
      return sendHtml(res, "transfer.html");
    case "/api/user":
      return sendHtml(res, "user.html");
    case "/api/waterbill":
      return sendHtml(res, "waterbill.html");

    default:
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 - Page not found</h1>");
  }
};
