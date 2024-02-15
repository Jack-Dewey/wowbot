// Require the necessary discord.js classes

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const puppeteer = require('puppeteer-extra')

// REMEMBER TO INSTALL PUPPET TO PI

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const scrape_raiderio = async () => {
    // Start a Puppeteer session with:
    // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
    // - no default viewport (`defaultViewport: null` - website page will in full width and height)
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
  
    // Open a new page
    const page = await browser.newPage();
  
    // On this new page:
    // - open the "http://quotes.toscrape.com/" website
    // - wait until the dom content is loaded (HTML is ready)
    await page.goto("https://raider.io/characters/us/sargeras/Entranced", {
      waitUntil: "domcontentloaded",


    });

    const score = await page.evaluate(() => {
        const score = document.getElementsByClassName("rio-badge-size--medium slds-badge rio-badge rio-badge-color--light rio-border--light rio-shadow--small rio-text-shadow--normal")[0].innerText;
        console.log(score);
        console.log("test");
        return score;
    });
        
    // Display the quotes
    console.log(score);
    // Close the browser
    await browser.close();
};
    // // Get page data
    // const quotes = await page.evaluate(() => {
    //   // Fetch the first element with class "quote"
    //   const quote = document.querySelector(".quote");
  
    //   // Fetch the sub-elements from the previously fetched quote element
    //   // Get the displayed text and return it (`.innerText`)
    //   //const text = quote.querySelector(".text").innerText;
    //   //const author = quote.querySelector(".author").innerText;
  
    //   return {};
    // });
  
//     // Display the quotes
//     console.log(quotes);
  
//     // Close the browser
//     await browser.close();
//   };
  
  // Start the scraping
scrape_raiderio();


// Enable required event listeners for chat input commands
client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);
});


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

