// Why mysql2 : https://stackoverflow.com/a/56509065/10280599.
const mysql = require("mysql2");

// Client connection. TODO: consider using a connection pool: https://www.npmjs.com/package/mysql2#using-connection-pools.
var conn = null;

///////////////////
//// CONSTANTS ////
///////////////////

const FIELDS = {
  ReceivedAt: "ReceivedAt",
  DeviceReportedTime: "DeviceReportedTime",
  Facility: "Facility",
  Priority: "Priority",
  Host: "Host",
  Message: "Message",
  SysLogTag: "SysLogTag"
};

const FACILITIES = ["kern", "user", "mail", "daemon", "auth", "syslog", "lpr", "cron", "authpriv", "ftp", "local"];
const PRIORITIES = ["emerg", "alert", "crit", "err", "warning", "notice", "info", "debug"];

/////////////////
//// METHODS ////
/////////////////

//bach ntconnectaw ldb
const connect = function () {
  // should be executed only once
  if (conn) return;

  conn = mysql.createConnection({
    host: "localhost",
    user: "rsyslog",
    password: "sI5iEUfVWlBn", // Replaced by an auto-generated password during installation.
    database: "Syslog"
  });
};

//function li katrj3 results from searchObject
/**
 * Converts the @search object into a valid SQL query,
 * performs the request to the client's databse.
 *
 * @param {Object} search
 *  The search object.
 *   @example
 *   {
 *     // query [string] : something to search for in the @Message and @SyslogTag columns.
 *     'query': 'rLogViewer',
 *
 *     // priority [string-array | null: any] : The list of priorities to include or null to include all priorities.
 *     'priority': ['error', 'crit', ...], // (array of strings | null: any)
 *
 *     // facility [string-array | null: any] : The list of facilities to include or null to include all facilities.
 *     'facility': ['ftp', 'mail', ...], // (array of strings | null: any)
 *
 *     // host [string-array | null: any] : The list of host to include or exlude.
 *     // A hostname preceded by an equal symbol '=host' matches hostnames equal to the string following '='.
 *     'host': ['=host1', 'word', '!bad host', '!=lazy-worker-pc']
 *     
 *      // The next two fiels will depend on the date/time pickers we will implement or include (3th party).
 *     'date': ...,
 *     'time': ...
 *   }
 *
 * @param callback(error, results, field)
 *
 *
 */
const query = function (search, callback) {
  connect();

  var conditions = [];

  // Since conditions are grouped using AND at the end, and some condition are combined with OR, we should put them inside pparenthesis.
  // To ensure we don't forget, use the helper lambda addCondition.

  let addCondition = (cond) => conditions.push(`(${cond})`);

  if (typeof search.query === "string") {
    addCondition(`${FIELDS.Message} LIKE '%${search.query}%' OR ${FIELDS.SysLogTag} LIKE '%${search.query}%'`);
  }

  addSQLConditionForFP(search.priority, FIELDS.Priority, PRIORITIES, addCondition);
  addSQLConditionForFP(search.facility, FIELDS.Facility, FACILITIES, addCondition);

  if (Array.isArray(search.host)) {
    let hostsToInclude = [], hostsToExclude = [];

    search.host.forEach((hostname) => {
      if (typeof hostname !== "string") {
        return; // skip if not valid string
      }
      
      let exclude = false, equal = false;

      if(hostname.charAt(0) === "!") {
        exclude = true;
        hostname = hostname.substr(1);
      }

      if(hostname.charAt(0) === "=") {
        equal = true;
        hostname = hostname.substr(1);
      }
      
      if(equal) {
        if(exclude)
          hostsToExclude.push(`${FIELDS.Host}!='${hostname}'`);
        else
          hostsToInclude.push(`${FIELDS.Host}='${hostname}'`);
      }
      else {
        if(exclude)
          hostsToExclude.push(`${FIELDS.Host} NOT LIKE '%${hostname}%'`);
        else
          hostsToInclude.push(`${FIELDS.Host} LIKE '%${hostname}%'`);
      }
    });

    if(hostsToInclude.length && hostsToExclude.length)
      addCondition(`(${hostsToInclude.join(" OR ")}) AND ${hostsToExclude.join(" AND ")}`);
    else if(hostsToInclude.length)
      addCondition(hostsToInclude.join(" OR "));
    else if(hostsToExclude.length)
      addCondition(hostsToExclude.join(" AND "));
  }

  if (search.date) {
    let query = "DATE(ReceivedAt) ";
    if (search.date.operator === "BETWEEN") {
      query = query + "BETWEEN '" + search.date.date1 + "' AND '" + search.date.date2 + "'";
    } else {
      query = query + search.date.operator + "'" + search.date.date1 + "'";
    }
    conditions.push(query);
  }

  if (search.time) {
    let query = "TIME(ReceivedAt) ";
    if (search.time.operator === "BETWEEN") {
      query = query + "BETWEEN '" + search.time.time1 + "' AND '" + search.time.time2 + "'";
    } else {
      query = query + search.time.operator + "'" + search.time.time1 + "'";
    }
    conditions.push(query);
  }

  //daba njm3o kolchi
  var sqlConditions = "";
  if (conditions.length > 0) sqlConditions = ` WHERE ${conditions.join(" AND ")}`;

  // TODO: find a better way of doing this.

  let pageIndex = search.pageIndex;
  let pageSize = search.pageSize;

  // Never return more than 100.. bghit o sf
  if (pageSize > 100) {
    pageSize = 100;
  }

  let offset = pageSize * pageIndex;

  if (offset <= 0 || isNaN(offset)) {
    offset = 0;
  }

  // https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_found-rows
  // First query the total number of results (rows)

  conn.query(`SELECT COUNT(*) FROM SystemEvents${sqlConditions};`, function (error, totalResults) {
    if (error) {
      callback(error);
      return;
    } 

    // Then get the results
    conn.query(`SELECT * FROM SystemEvents ${sqlConditions} LIMIT ${conn.escape(pageSize)} OFFSET ${conn.escape(offset)};`, 
    function (error,results) {

      if(error) {
        callback(error);
        return;
      }

      callback(error, 
        {
        totalResults: totalResults[0]['COUNT(*)'],
        count: results.length,
        results: results
        });
    });
  });
};

/**
 *
 * Returns the SQL condition to place inside a WHERE statement to filter priority or facility since they're filtered the same way (DRY).
 *
 * @param {array} fieldSearchArray searchObject.facility or searchObject.priority
 * @param {string} fieldName FIELDS.Facility or FIELDS.Priority
 * @param {array} fieldValues FACILITIES or PRIORITIES
 */
const addSQLConditionForFP = function (fieldSearchArray, fieldName, fieldValues, addCondition) {
  if (Array.isArray(fieldSearchArray)) {
    let valuesToInclude = [];

    fieldSearchArray.forEach((filter) => {
      let value = fieldValues.indexOf(filter);
      if (value > -1) {
        valuesToInclude.push(value);
      }
    });

    if (valuesToInclude.length) {
      // searchArray = ['err', 'crit', 'info'] && forFacility = false => 'Priority IN (2,3,6)'
      addCondition(`${fieldName} IN (${valuesToInclude.join(",")})`);
    }
  }
};

////////////////////////////////////////////////////////////////////////////////////

exports.connectDB = connect;
exports.query = query;
