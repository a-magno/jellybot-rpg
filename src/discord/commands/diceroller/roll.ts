import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

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
        },
        {
            name: 'reroll',
            description: 'Mark any result below this to reroll',
            type: ApplicationCommandOptionType.Number
        }
    ],
    async run(interaction) {
        const { options } = interaction;
        const notation = options.getString('roll', true);
        const rerollThreshold : number | null = options.getNumber('reroll');
        const result = parseDiceNotation(notation, rerollThreshold ? rerollThreshold : 0);

        await interaction.reply({
            content: result.message
        })
    }
});

interface DiceRollResult {
    results: number[];
    total?: number;
    successes?: number;
    message: string;
    rerollMarks?: boolean[];
}

function rollDice(amount: number, dieSize: number): number[] {
    const results: number[] = [];
    for (let i = 0; i < amount; i++) {
        results.push(Math.floor(Math.random() * dieSize) + 1);
    }
    return results;
}

function formatRollResults(rolls: number[], target?: number, rerollThreshold?: number): string {
    const formattedRolls: string[] = [];
    for (const roll of rolls) {
        if (target !== undefined && roll >= target) {
            formattedRolls.push(`**${roll}**`);
        } else if (rerollThreshold !== undefined && roll <= rerollThreshold && rerollThreshold > 0) {
            formattedRolls.push(`__${roll}__`); // Underline for reroll
        } else if (target !== undefined && roll < target) {
            formattedRolls.push(`~~${roll}~~`);
        } else{
            formattedRolls.push(`${roll}`);
        }
    }
    return `[Rolls: ${formattedRolls.join(", ")}]`;
}

function parsePoolCheck(match: RegExpMatchArray, rerollThreshold?: number): DiceRollResult {
    const amount = parseInt(match[1]);
    const dieSize = parseInt(match[2]);
    const target = match[3] ? parseInt(match[3]) : undefined;

    const results = rollDice(amount, dieSize);
    let successes: number | undefined;

    if (target !== undefined) {
        successes = results.filter((roll) => roll >= target).length;
    }

    let message = formatRollResults(results, target, rerollThreshold);
    if (target !== undefined) {
        message += `, Successes: ${successes}`;
    }

    const rerollMarks = rerollThreshold !== undefined ? results.map(roll => roll < rerollThreshold) : undefined;

    return { results, successes, message, rerollMarks };
}

function parseRegularRoll(match: RegExpMatchArray, rerollThreshold?: number): DiceRollResult {
    const amount = parseInt(match[1]);
    const dieSize = parseInt(match[2]);
    const target = match[3] ? parseInt(match[3]) : undefined;

    const results = rollDice(amount, dieSize);
    const total = results.reduce((sum, roll) => sum + roll, 0);
    let successes: number | undefined;

    if (target !== undefined) {
        successes = total >= target ? 1 : 0;
    }

    let message = formatRollResults(results, target, rerollThreshold);
    if (target !== undefined) {
        message += `, Total: ${total}, Success: ${successes ? "Yes" : "No"}`;
    } else {
        message += `, Total: ${total}`;
    }

    const rerollMarks = rerollThreshold !== undefined ? results.map(roll => roll < rerollThreshold) : undefined;

    return { results, total, successes, message, rerollMarks };
}

function parseDiceNotation(notation: string, rerollThreshold: number = 0): DiceRollResult {
    const poolRegex = /^(\d+)\s+d(\d+)(?:\s+t(\d+))?$/i;
    const regularRegex = /^(\d+)d(\d+)(?:\s+t(\d+))?$/i;

    const poolMatch = notation.match(poolRegex);
    if (poolMatch) {
        return parsePoolCheck(poolMatch, rerollThreshold);
    }

    const regularMatch = notation.match(regularRegex);
    if (regularMatch) {
        return parseRegularRoll(regularMatch);
    }

    return {
        results: [],
        message: "Invalid roll notation. Use 'XdY' or 'XdY tZ' for regular rolls, or 'X dY tZ' for pool checks.",
    };
}

