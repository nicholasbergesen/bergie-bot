const { App } = require("@slack/bolt");

const slack_signing_secret = "";
const bot_token = "";
const papago_client_id = "";
const papago_client_secret = "";

const PORT = process.env.PORT || 3000;

const app = new App({
  token: bot_token,
  signingSecret: slack_signing_secret
});

const translate = async (text, say) => {
    const request = require("request");
    const options = {
      url: "https://openapi.naver.com/v1/papago/n2mt",
      form: { source: "ko", target: "en", text: text },
      headers: {
        "X-Naver-Client-Id": papago_client_id,
        "X-Naver-Client-Secret": papago_client_secret
      },
      method: "POST"
    };
    request.post(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const json = JSON.parse(body);
        say(json.message.result.translatedText);
      } else {
        console.log("error = " + response.statusCode);
      }
    });
};

const re = /[\u3131-\uD79D]/ugi

app.message(async ({ message, say }) => {
  console.log(message);
  if(message.text.match(re)) {
    await translate(message.text, say);  
  }  
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
