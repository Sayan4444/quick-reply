export enum Messages {
    NO_COMMAND = "Invalid command",
    HELPER_COMMANDS = `Need some help with \`/quick-reply\` commands?

        Commands:
        • use \`/quick-reply save\` to save a quick reply or delete a saved quick reply
        • use \`/quick-reply id <idName>\` to print the message associated with it

        Note: id should be unique one word string
        `,
    NO_ID = "No id found",
    NO_MESSAGE = "No message found",
    UNIQUE_ID = "Id should be unique",
    SINGLE_WORD_ID = "Id should be a single word",
    SAVED = "Reply Saved",
    NO_MESSAGE_FOUND_ID = "No saved message found with this id",
}
