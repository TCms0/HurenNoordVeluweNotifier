var request = require("request");
var config = require("./config.json");
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(config.TgToken, { polling: true });
var Steden = [];
var SwapTime = false;
console.log("Getting Data...");
GetData();
//Request GetData every 5 minutes
setInterval(GetData, 300000);
var BotStart = "2022-09-21 19:32:28";
function GetData() {
  process.stdout.write(".");
  var options = {
    method: "POST",
    url: "https://www.hurennoordveluwe.nl/portal/object/frontend/getallobjects/format/json",
    headers: {
      authority: "www.hurennoordveluwe.nl",
      accept: "application/json, text/plain, */*",
      "accept-language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7",
      "content-length": "0",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      origin: "https://www.hurennoordveluwe.nl",
      referer: "https://www.hurennoordveluwe.nl/aanbod/te-huur",
      "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="104", "Opera GX";v="90"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36 OPR/90.0.4480.100",
      "x-requested-with": "XMLHttpRequest",
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    var ResponseData = JSON.parse(response.body);
    if (ResponseData != null) {
      var Data = ResponseData.result;
      Data.forEach((Woningen) => {
        if (!Steden.includes(Woningen?.city?.name)) {
          var PublicatieDatum = Woningen?.publicationDate;
          var CurrentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
          if (CurrentDate > PublicatieDatum && PublicatieDatum > BotStart) {
            SwapTime = true;
            var Type = Woningen?.model?.modelCategorie?.icon;
            var Url = "https://www.hurennoordveluwe.nl/aanbod/te-huur/details/" + Woningen?.urlKey;
            var Message = Woningen?.city?.name + " " + Woningen?.street + " " + Woningen?.houseNumber + "\nPrijs: " + Woningen?.netRent + "€\nType: " + Type + "\n" + Url;
            SendTelegramMessage(config.TgToken, config.ChatId, Message);
            console.log("Sent Message");
            console.log(Message);
          }
        }
      });
      if (SwapTime) {
        var CurrentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
        BotStart = CurrentDate;
        SwapTime = false;
      }
    }
  });
}

function SendTelegramMessage(Tgtoken, ChatId, Message) {
  if (Tgtoken == undefined) {
    console.log("Starting Tg Bot...");
  } else {
    datenow = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    bot.sendMessage(ChatId, Message + `\n` + "Time: " + datenow);
  }
}
