var extend = require('./util').extend,
  util = require('./util');

/**
 * Represents a Pod (Podman-specific feature)
 * @param {Object} modem docker-modem
 * @param {String} id    Pod's ID
 */
var Pod = function(modem, id) {
  this.modem = modem;
  this.id = id;

  this.defaultOptions = {
    start: {},
    stop: {},
    restart: {},
    pause: {},
    unpause: {},
    remove: {},
    kill: {},
    stats: {},
    top: {},
    inspect: {},
    exists: {},
    prune: {}
  };
};

Pod.prototype[require('util').inspect.custom] = function() { return this; };

/**
 * Inspect
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback, if supplied will query Podman.
 * @return {Object}            ID only and only if callback isn't supplied.
 */
Pod.prototype.inspect = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '/json?',
    method: 'GET',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    statusCodes: {
      200: true,
      404: 'no such pod',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Start
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 */
Pod.prototype.start = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '/start?',
    method: 'POST',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    statusCodes: {
      200: true,
      204: true,
      304: 'pod already started',
      404: 'no such pod',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Stop
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 */
Pod.prototype.stop = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '/stop?',
    method: 'POST',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    statusCodes: {
      200: true,
      204: true,
      304: 'pod already stopped',
      404: 'no such pod',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Restart
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 */
Pod.prototype.restart = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '/restart?',
    method: 'POST',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    statusCodes: {
      200: true,
      204: true,
      404: 'no such pod',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Pause
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 */
Pod.prototype.pause = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '/pause?',
    method: 'POST',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    statusCodes: {
      200: true,
      204: true,
      404: 'no such pod',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Unpause
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 */
Pod.prototype.unpause = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '/unpause?',
    method: 'POST',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    statusCodes: {
      200: true,
      204: true,
      404: 'no such pod',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Kill
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 */
Pod.prototype.kill = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '/kill?',
    method: 'POST',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    statusCodes: {
      200: true,
      204: true,
      404: 'no such pod',
      409: 'conflict',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Remove
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 */
Pod.prototype.remove = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '?',
    method: 'DELETE',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    statusCodes: {
      200: true,
      204: true,
      404: 'no such pod',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Stats
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 */
Pod.prototype.stats = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '/stats?',
    method: 'GET',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    isStream: true,
    statusCodes: {
      200: true,
      404: 'no such pod',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Top
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 */
Pod.prototype.top = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '/top?',
    method: 'GET',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    statusCodes: {
      200: true,
      404: 'no such pod',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

/**
 * Exists
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 */
Pod.prototype.exists = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/libpod/pods/' + this.id + '/exists?',
    method: 'GET',
    options: args.opts,
    abortSignal: args.opts.abortSignal,
    statusCodes: {
      204: true,
      404: 'no such pod',
      500: 'server error'
    }
  };

  if (args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};

module.exports = Pod;
