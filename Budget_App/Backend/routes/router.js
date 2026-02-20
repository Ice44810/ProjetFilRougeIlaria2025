const fs = require("fs");
const path = require("path");
const url = require("url");

function sendHtml(res, pageName) {
  const filePath = path.join(__dirname, "../pages", pageName);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end("<h1>404 - Page not found</h1>");
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(data);
  });
}

module.exports = function (req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  switch (pathname) {

    // Main routes
    case "/home":
      return sendHtml(res, "index.html");

    case "/login":
      return sendHtml(res, "login.html");

    case "/inscription":
      return sendHtml(res, "inscription.html");

    case "/resetpassword":
      return sendHtml(res, "resetpassword.html");

    case "/changepw":
      return sendHtml(res, "changepw.html");

    case "/createnewpwd":
      return sendHtml(res, "createnewpwd.html");

    case "/newpass-confirm":
      return sendHtml(res, "newpass-confirm.html");

    // Cards routes
    case "/cards":
      return sendHtml(res, "card.html");

    case "/addcard":
      return sendHtml(res, "addnewcard.html");

    case "/cardinfo":
      return sendHtml(res, "cardinfo.html");

    case "/giftcarddetail":
      return sendHtml(res, "giftcarddetail.html");

    // Transactions routes
    case "/transactions":
      return sendHtml(res, "transactions.html");

    // Recipients/Contacts routes
    case "/addrecipient":
      return sendHtml(res, "addnewrecipient.html");

    case "/contacts":
      return sendHtml(res, "mycontact.html");

    case "/contact":
      return sendHtml(res, "detailcontact.html");

    // Transfer routes
    case "/transfer":
      return sendHtml(res, "transfert.html");

    case "/transferconfirm":
      return sendHtml(res, "transferconfirm.html");

    case "/transferbybank":
      return sendHtml(res, "transferbybank.html");

    // Bill routes
    case "/bill":
      return sendHtml(res, "bill.html");

    case "/electricity":
      return sendHtml(res, "electricity.html");

    case "/waterbill":
      return sendHtml(res, "waterbill.html");

    case "/internet":
      return sendHtml(res, "internet.html");

    // Profile & Settings routes
    case "/profile":
      return sendHtml(res, "Profile.html");

    case "/editprofile":
      return sendHtml(res, "edit_profil.html");

    case "/settings":
      return sendHtml(res, "setting.html");

    case "/security":
      return sendHtml(res, "security_center.html");

    // Statistics & Rewards
    case "/statistics":
      return sendHtml(res, "statistics.html");

    case "/rewards":
      return sendHtml(res, "rewards.html");

    // Banking routes
    case "/banque":
      return sendHtml(res, "banque.html");

    case "/bankhistory":
      return sendHtml(res, "bankhistory.html");

    case "/topup":
      return sendHtml(res, "topup.html");

    // Payment routes
    case "/payment":
      return sendHtml(res, "paymentsource.html");

    // QR code route
    case "/qr":
      return sendHtml(res, "myqr.html");

    // Services & Deals
    case "/market":
      return sendHtml(res, "market.html");

    case "/deals":
      return sendHtml(res, "dealmanagement.html");

    case "/services":
      return sendHtml(res, "servicemanagement2.html");

    // Mobile & Entertainment
    case "/mobile":
      return sendHtml(res, "mobile.html");

    case "/film":
      return sendHtml(res, "film.html");

    // Notifications
    case "/notifications":
      return sendHtml(res, "notification_setting.html");

    // Help & Support
    case "/help":
      return sendHtml(res, "help_support.html");

    // UI pages
    case "/ui":
      return sendHtml(res, "ui-pages.html");

    default:
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 - Page not found</h1>");
  }
};


