const { VoteTypeInvalidError } = require("../errors/vote.js");

function validateVoteType({ type }) {
    if (type !== "UPVOTE" && type !== "DOWNVOTE")
        return new VoteTypeInvalidError();
}

module.exports = {
    validateVoteType,
};
