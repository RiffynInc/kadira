Kadira._connectWithEnv = function() {
  if ((process.env.KADIRA_APP_ID && process.env.KADIRA_APP_SECRET) ||
      process.env.KADIRA_NEWRELIC_ID) {
    var options = Kadira._parseEnv(process.env);

    if (process.env.KADIRA_NEWRELIC_ID) {
      options = options || { };
      options.newRelicId = process.env.KADIRA_NEWRELIC_ID;
    }

    Kadira.connect(
      process.env.KADIRA_APP_ID,
      process.env.KADIRA_APP_SECRET,
      options
    );

    Kadira.connect = function() {
      throw new Error('Kadira has been already connected using credentials from Environment Variables');
    };
  }
};


Kadira._connectWithSettings = function () {
  if(
    Meteor.settings.kadira &&
    ((Meteor.settings.kadira.appId &&
      Meteor.settings.kadira.appSecret) ||
     Meteor.settings.kadira.newRelicId)
  ) {
    var options = Meteor.settings.kadira.options;

    if (Meteor.settings.kadira.newRelicId) {
      options = options || { };
      options.newrelicId = Meteor.settings.kadira.newRelicId;
    }

    Kadira.connect(
      Meteor.settings.kadira.appId,
      Meteor.settings.kadira.appSecret,
      options
    );

    Kadira.connect = function() {
      throw new Error('Kadira has been already connected using credentials from Meteor.settings');
    };
  }
};


// Try to connect automatically
Kadira._connectWithEnv();
Kadira._connectWithSettings();
