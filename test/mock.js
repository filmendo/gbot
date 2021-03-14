const { authorAssociations, userTypes } = require("../src/fixtures/enums");
const messages = require("../src/fixtures/messages");

/**
 * Configurable settings in an event payload.
 */
class PayloadConfig {
  constructor() {
    this.owner = "filmendo";
    this.user = "filmendo";
    this.userType = userTypes.USER;
    this.org = "filmendo";
    this.repo = "gbot";
    this.association = authorAssociations.OWNER;
    this.comment = "test comment";
  }
}

/**
 * Create a payload for comment events.
 * @param {PayloadConfig} config
 */
function createCommentPayload(config) {
  const { owner, user, userType, repo, association, comment, org } = config;

  return {
    action: "created",
    issue: {
      number: 1,
      user: {
        login: "filmendo",
        type: userType,
      },
      author_association: authorAssociations.OWNER,
    },
    comment: {
      user: {
        login: user,
        type: userType,
      },
      author_association: association,
      body: comment,
    },
    repository: {
      id: 123,
      name: repo,
      full_name: `${org}/${repo}`,
      private: false,
      owner: {
        login: owner,
        type: userTypes.USER,
      },
    },
    sender: {
      login: user,
      type: userType,
      site_admin: false,
    },
  };
}

class IssueCommentEvent {
  constructor() {
    this.name = "issue_comment";
  }
}

class OwnerCommentEvent extends IssueCommentEvent {
  constructor() {
    super();
    const config = new PayloadConfig();
    config.association = authorAssociations.OWNER;

    this.payload = createCommentPayload(config);
  }
}

class CollaboratorCommentEvent extends IssueCommentEvent {
  constructor() {
    super();
    const config = new PayloadConfig();
    config.association = authorAssociations.COLLABORATOR;

    this.payload = createCommentPayload(config);
  }
}

class ContributorCommentEvent extends IssueCommentEvent {
  constructor() {
    super();
    const config = new PayloadConfig();
    config.association = authorAssociations.CONTRIBUTOR;

    this.payload = createCommentPayload(config);
  }
}

class MemberCommentEvent extends IssueCommentEvent {
  constructor() {
    super();
    const config = new PayloadConfig();
    config.association = authorAssociations.MEMBER;

    this.payload = createCommentPayload(config);
  }
}

class BotCommentEvent extends IssueCommentEvent {
  constructor() {
    super();
    const config = new PayloadConfig();
    config.user = "gbot-adj[bot]";
    config.userType = userTypes.BOT;
    config.association = authorAssociations.NONE;

    this.payload = createCommentPayload(config);
  }
}

const commentCreatedBotResponse = { body: messages.todoList };

module.exports = {
  BotCommentEvent,
  CollaboratorCommentEvent,
  ContributorCommentEvent,
  MemberCommentEvent,
  OwnerCommentEvent,
  commentCreatedBotResponse,
};
