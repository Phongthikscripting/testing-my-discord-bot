import {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { storage } from "./storage.ts";
import axios from "axios";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let isConnected = false;

const randomReplies = [
  "bruh",
  "nah",
  "what",
  "https://tenor.com/view/skeleton-minecraft-minecraft-skeleton-shield-rahhh-gif-13102641407116959174",
  "https://tenor.com/view/judgement-minos-prime-judgement-minos-prime-ultrakill-gif-5728374530149769385",
  "BEHOLD! THE POWER OF AN ANGEL",
];

// ---------------- COMMANDS ----------------
const commands = [
  new SlashCommandBuilder()
    .setName("random")
    .setDescription("bot sends a random reply"),

  new SlashCommandBuilder()
    .setName("cat-flicking-toungue")
    .setDescription("gif"),

  new SlashCommandBuilder()
    .setName("gif")
    .setDescription("send a gif"),

  new SlashCommandBuilder()
    .setName("randommeme")
    .setDescription("get a random meme from reddit"),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("bot says text")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("What the bot should say")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("sayembed")
    .setDescription("bot says text in embed")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("What the bot should say")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("minos")
    .setDescription("PREPARE THYSELF"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("show all bot commands"),
].map(cmd => cmd.toJSON());

// ---------------- READY ----------------
client.once(Events.ClientReady, async (c) => {
  isConnected = true;
  console.log("BOT ONLINE");

  await storage.createLog({
    type: "success",
    message: "BOT ONLINE",
  });

  try {
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);
    await rest.put(Routes.applicationCommands(c.user.id), { body: commands });
    console.log("Slash commands registered");

    await storage.createLog({
      type: "info",
      message: "Slash commands registered successfully",
    });
  } catch (error: any) {
    console.error("Failed to register slash commands:", error);
    await storage.createLog({
      type: "error",
      message: `Failed to register slash commands: ${error.message}`,
    });
  }
});

// ---------------- INTERACTIONS ----------------
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === "random") {
      const reply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
      return await interaction.reply(reply);
    }

    if (interaction.commandName === "cat-flicking-toungue") {
      return await interaction.reply("https://tenor.com/view/cat-tongue-shaking-gif-1214800249503457963");
    }

    if (interaction.commandName === "gif") {
      return await interaction.reply("https://tenor.com/view/cat-tongue-shaking-gif-1214800249503457963");
    }

    if (interaction.commandName === "randommeme") {
      try {
        const response = await axios.get("https://meme-api.com/gimme");
        return await interaction.reply(response.data.url);
      } catch (error) {
        console.error("Meme error:", error);
        return await interaction.reply("Couldn't find a meme right now 😢");
      }
    }

    if (interaction.commandName === "say") {
      const text = interaction.options.getString("text", true);
      return await interaction.reply(text);
    }

    if (interaction.commandName === "sayembed") {
      const text = interaction.options.getString("text", true);

      const embed = new EmbedBuilder()
        .setDescription(text)
        .setColor(0x00ff99)
        .setFooter({ text: "bantumlum bot" });

      return await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "minos") {
      return await interaction.reply(
        "https://tenor.com/view/judgement-minos-prime-judgement-minos-prime-ultrakill-gif-5728374530149769385"
      );
    }

    if (interaction.commandName === "help") {
      const embed = new EmbedBuilder()
        .setTitle("📖 Bantumlum Bot Commands")
        .setColor(0x00ffff)
        .setDescription(`
/random - random reply  
/cat-flicking-toungue - cat gif  
/gif - gif  
/randommeme - random meme  
/say - bot says text  
/sayembed - bot says embed  
/minos - minos gif  
/help - show this list  
        `)
        .setFooter({ text: "bantumlum bot" });

      return await interaction.reply({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Interaction error:", error);
    if (!interaction.replied) {
      await interaction.reply({ content: "Error 😢", ephemeral: true });
    }
  }
});

// ---------------- ERROR ----------------
client.on(Events.Error, async (error) => {
  console.error("Discord Client Error:", error);
  await storage.createLog({
    type: "error",
    message: `Discord Client Error: ${error.message}`,
  });
});

// ---------------- EXPORT ----------------
export async function startBot() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.warn("DISCORD_TOKEN not set. Bot will not start.");
    return false;
  }
  try {
    await client.login(token);
    return true;
  } catch (error) {
    console.error("Failed to login to Discord:", error);
    return false;
  }
}

export function getBotStatus() {
  return {
    status: isConnected ? "online" : "offline",
    uptime: client.uptime,
    latency: client.ws.ping,
  };
}
