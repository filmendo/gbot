const { authorAssociations } = require("./src/fixtures/enums");
const messages = require("./src/fixtures/messages");

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  // Your code here
  // app.log.info("Yay, the app was loaded!");

  app.on("issue_comment.created", async (context) => {
    if (context.isBot) return; // Ignore bot comments

    const allowedUsers = [
      authorAssociations.OWNER,
      authorAssociations.COLLABORATOR,
    ];

    if (allowedUsers.includes(context.payload.comment.author_association)) {
      const issueComment = context.issue({ body: messages.todoList });
      return context.octokit.issues.createComment(issueComment);
    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
