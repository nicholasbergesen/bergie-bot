const { App, ExpressReceiver } = require("@slack/bolt");
const request = require("request");

const slack_signing_secret = "";
const bot_token = "";
const papago_client_id = "";
const papago_client_secret = "";

const PORT = process.env.PORT || 3000;

const receiver = new ExpressReceiver({ signingSecret: slack_signing_secret });
const app = new App({
  token: bot_token,
  receiver
});

const translate = async (message, say) => {
  const options = {
    url: "https://openapi.naver.com/v1/papago/n2mt",
    form: { source: "ko", target: "en", text: message.text },
    headers: {
      "X-Naver-Client-Id": papago_client_id,
      "X-Naver-Client-Secret": papago_client_secret
    },
    method: "POST"
  };
  request.post(options, async function(error, response, body) {
    if (!error && response.statusCode == 200) {
      const json = JSON.parse(body);
      await say(json.message.result.translatedText);
    } else {
      console.log("error = " + response.statusCode);
    }
  });
};

const re = /[\u3131-\uD79D]/giu;
const recentMessages = [];

function pruneArray() {
  recentMessages.splice(0, 1);
  if (recentMessages.length > 0) {
    setTimeout(pruneArray, 10000);
  }
}

//Don't await translate, need to response to slack within 3 seconds or
//they will resend the message
app.message(({ message, say }) => {
  if (message.text.match(re)) {
    if (recentMessages.includes(message.client_msg_id)) {
      return;
    } else {
      recentMessages.push(message.client_msg_id);
      setTimeout(pruneArray, 10000);
    }
    (async () => {
      translate(message, say);
    })();
  }
});

receiver.router.get("/", (req, res) => {
  res.send("Hello! I'm Bergie-Bot 🤖");
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("🤖 Bergie-Bot is running!");
})();
