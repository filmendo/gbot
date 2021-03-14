const nock = require("nock");
// Requiring our app implementation
const myProbotApp = require("..");
const { Probot, ProbotOctokit } = require("probot");

// Requiring our fixtures
const payload = require("./fixtures/issues.opened");
const issueCreatedBody = { body: "Thanks for opening this issue!" };
const fs = require("fs");
const path = require("path");
const {
  commentCreatedBotResponse,
  OwnerCommentEvent,
  BotCommentEvent,
  CollaboratorCommentEvent,
  MemberCommentEvent,
  ContributorCommentEvent,
} = require("./mock");

const privateKey = fs.readFileSync(
  path.join(__dirname, "fixtures/mock-cert.pem"),
  "utf-8"
);

describe("My Probot app", () => {
  let probot;

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({
      appId: 123,
      privateKey,
      // disable request throttling and retries for testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    // Load our app into probot
    probot.load(myProbotApp);
  });

  const allowedAssociations = {
    OWNER: {
      event: new OwnerCommentEvent(),
    },
    COLLABORATOR: {
      event: new CollaboratorCommentEvent(),
    },
  };

  Object.keys(allowedAssociations).forEach((association) => {
    test(`creates a comment when an PR is commented by ${association}`, async () => {
      const mockApi = nock("https://api.github.com")
        // Test that a comment is posted
        .post("/repos/filmendo/gbot/issues/1/comments", (body) => {
          expect(body).toMatchObject(commentCreatedBotResponse);
          return true;
        })
        .reply(200);

      // Receive a webhook event
      const { event } = allowedAssociations[association];
      await probot.receive(event);

      expect(mockApi.pendingMocks()).toStrictEqual([]);
    });
  });

  const ignoredAssociations = {
    BOT: {
      event: new BotCommentEvent(),
    },
    CONTRIBUTOR: {
      event: new ContributorCommentEvent(),
    },
    MEMBER: {
      event: new MemberCommentEvent(),
    },
  };
  Object.keys(ignoredAssociations).forEach((association) => {
    test(`does not create a comment when a PR is commented by a ${association}`, async () => {
      const mockApi = nock("https://api.github.com")
        // Test that a comment is posted
        .post("/repos/filmendo/gbot/issues/1/comments", (body) => {
          expect(body).toMatchObject(commentCreatedBotResponse);
          return true;
        })
        .reply(200);

      // Receive a webhook event
      const { event } = ignoredAssociations[association];
      await probot.receive(event);

      expect(mockApi.pendingMocks()).toStrictEqual([
        "POST https://api.github.com:443/repos/filmendo/gbot/issues/1/comments",
      ]);
    });
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
