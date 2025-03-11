import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { rollDice } from "#functions";

createCommand({
    name: 'r',
    description: "Rolls some dice! Let's go gambling 🎲!",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'roll',
            description: 'XdY tZ for d20 systems, X dy tZ for d6 systems.',
            type: ApplicationCommandOptionType.String,
            required
        }
    ],
    async run(interaction) {
        const { options } = interaction;
        const notation = options.getString('roll', true);
        // const rerollThreshold : number | null = options.getNumber('reroll');
        // const result = parseDiceNotation(notation, rerollThreshold ? rerollThreshold : 0);
        const roll = rollDice( notation );
        // console.log(roll)
        await interaction.reply({
            content: roll.message,
            flags : roll.ephemeral ? "Ephemeral" : undefined
        })
    }
});
