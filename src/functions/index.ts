// export functions here
import { DiceRoll, DiceRoller } from "@dice-roller/rpg-dice-roller";

const roller = new DiceRoller();

interface DiceRollResult {
    message? : string,
    total?: number,
    ephemeral? : boolean
}

export function rollDice( input : string ) : DiceRollResult {
    roller.clearLog();
    try{
        const roll : DiceRoll | DiceRoll[] = roller.roll(input);
        console.log(roller.output);

        return {
            message : roll.toString(),
            total : roller.total
        }
    }catch(err){
        // console.log(err)
        return {
            message : "There's been a syntax error. See ``/help`` for any questions!",
            ephemeral : true
        }
    }
}