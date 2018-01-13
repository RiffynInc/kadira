// Presence of any environment variables will override meteor settings.
Kadira._getConnectionSettings = function() {
  var appid   = process.env.APM_APP_ID      || process.env.KADIRA_APP_ID;
  var secret  = process.env.APM_APP_SECRET  || process.env.KADIRA_APP_SECRET;
  var nrid    = process.env.APM_NEWRELIC_ID || process.env.KADIRA_NEWRELIC_ID;

  if (Meteor.settings && Meteor.settings.kadira) {
    if (!appid && Meteor.settings.kadira.appId) {
      appid = Meteor.settings.kadira.appId;
    }

    if (!secret && Meteor.settings.kadira.appSecret) {
      secret = Meteor.settings.kadira.appSecret;
    }

    if (!nrid && Meteor.settings.kadira.newRelicId) {
      nrid = Meteor.settings.kadira.newRelicId;
    }
  }

  var options = Kadira._parseEnv(process.env);
  if (nrid) {
    options = options || { };
    options.newRelicId = nrid;
  }

  return {
    app_id:     appid,
    app_secret: secret,
    options: options
  };
};


Kadira._validateConnectionSettings = function(settings) {
  if (settings) {
    return (settings.app_id && settings.app_secret) ||
           (settings.options && settings.options.newRelicId);
  }

  return false;
};

Kadira._connectWithEnv = function() {
  if (Kadira._getConnectionSettings &&
      Kadira._getConnectionSettings instanceof Function) {
    var settings = Kadira._getConnectionSettings();
    if (Kadira._validateConnectionSettings(settings) ) {
      Kadira.connect(settings.app_id, settings.app_secret, settings.options);

      Kadira.connect = function() {
        throw new Error('Meteor APM already connected');
      };

      return;
    }
  }

  if(process.env.APM_APP_ID && process.env.APM_APP_SECRET && process.env.APM_OPTIONS_ENDPOINT) {
    var options = Kadira._parseEnv(process.env);

    Kadira.connect(
      process.env.APM_APP_ID,
      process.env.APM_APP_SECRET,
      options
    );

    Kadira.connect = function() {
      throw new Error('Meteor APM has already connected using credentials from Environment Variables');
    };
  }
  // other forms of Kadira.connect are not supported
};

// Try to connect automatically
Kadira._connectWithEnv();
