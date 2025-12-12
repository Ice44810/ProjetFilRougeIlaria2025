const express = require("express");
const fs = require("node:fs");
const path = require("path");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("assets"));

app.get("/Budget_App", (req, res) => {
  res.render("home", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("login", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("profile", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("banque", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("bill", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("card", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("film", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("electricity", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("internet", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("invoice", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("bankhistory", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("mobile", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("market", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("mycontact", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("myqr", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("topup", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("transactions", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("trasfert", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("voucher", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("waterbill", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("rewards", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("setting", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("security", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("language_select", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("notification_setting", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("notification", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("edit_profile", { title: "" });
});

app.get("/Budget_App", (req, res) => {
  res.render("help_support", { title: "" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
