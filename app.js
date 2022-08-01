require("dotenv").config();
const got = require("got");
const { Client, Intents } = require("discord.js");

let geoAddress;

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS, //adds server functionality
    Intents.FLAGS.GUILD_MESSAGES, //gets messages from our bot.
  ],
});

client.once("ready", () => {
  console.log("Ready!");
});

client.on("messageCreate", async (msg) => {
  if (msg.content.includes(".find")) {
    const geoId = msg.content.split(" ");
    await getCoords(geoId[1]);

    msg.reply(`${geoAddress}`);
  }
});

async function getCoords(gameId) {
  let res;

  try {
    res = await got.get(`https://www.geoguessr.com/api/v3/games/${gameId}`);
  } catch (e) {
    console.log(e);
    return;
  }

  const obj = JSON.parse(res.body);
  const round = obj.round - 1;

  const lat = obj.rounds[round].lat;
  const lng = obj.rounds[round].lng;

  await getAddress(lat, lng);
}

async function getAddress(lat, lng) {
  let res;

  try {
    res = await got.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_API}`
    );
  } catch (e) {
    console.log(e);
  }

  const obj = JSON.parse(res.body);

  geoAddress = obj.results[0].formatted_address;
}

client.login(process.env.DISCORD_TOKEN);
