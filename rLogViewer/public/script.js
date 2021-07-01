const FACILITIES = ["kernel", "user", "mail", "daemon", "auth", "syslog", "lpr", "cron", "authpriv", "ftp", "local"];
const PRIORITIES = ["emergency", "alert", "critical", "error", "warning", "notice", "info", "debug"];

const Pager = {    
  pageSelector: null,
  pageIndex: 0,
  pageSize: 10,
  pageChangedListener: null,

  init: function (pageChangedListener) {    
    
    this.pageSelector = document.getElementById("select-page-index");
    this.pageSelector.addEventListener("change", (e) => {
      Pager.pageIndex = parseInt(e.target.value, 10)
      pageChangedListener(Pager.pageIndex - 1);
    });

    let pageSizeSelector = document.getElementById("select-page-size");
    pageSizeSelector.addEventListener("change", (e) => {
      Pager.pageSize = parseInt(e.target.value, 10);
    });

    this.pageSize = parseInt(pageSizeSelector.value, 10);
  },

  updatePagesCount: function (totalResults) {               
      let max = Math.floor(totalResults / this.pageSize);
      if( totalResults % this.pageSize > 0 ) {
          max ++;
      }
      this.pageSelector.max = max;
  },
};

const Table = {
  body: document.getElementById("table-body"),

  displayLogs: function (logs) {
    this.body.innerHTML = "";

    logs.forEach((log) => {
        let row = this.body.insertRow();
        row.insertCell().appendChild(document.createTextNode(log.ReceivedAt));
        row.insertCell().appendChild(document.createTextNode(log.Host));
        row.insertCell().appendChild(document.createTextNode(FACILITIES[log.Facility]));
        row.insertCell().appendChild(document.createTextNode(PRIORITIES[log.Priority]));
        row.insertCell().appendChild(document.createTextNode(log.Message));
        row.insertCell().appendChild(document.createTextNode(log.SysLogTag));
        row.insertCell().appendChild(document.createTextNode(log.DeviceReportedTime));
  
        Main.addHost(log.Host);
    });
  }  
};

const Main = {
  query: null,
  facility: null,
  priority: null,
  hosts: null,
  searchButt: null,
  pager: null,
  searchObj: null,

  init: function () {
    this.query = document.getElementById("query");
    this.facility = new FilterByTag("facility", Filters.Facility);
    this.priority = new FilterByTag("priority", Filters.Priority);

    // Edit whitelist:
    // hosts.whitelist = ["host1", "=host1", "!host1", "!=host1", "host2"];
    this.hosts = new Tagify(document.querySelector('input[name="input-hosts"]'), {
      enforceWhitelist: true,
      dropdown: {
        maxItems: 50, // <- mixumum allowed rendered suggestions
        classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
        enabled: 0, // <- show suggestions on focus
        closeOnSelect: false // <- do not hide the suggestions dropdown once an item has been selected
      }
    });

    Pager.init((pageIndex) => this.onPageChanged(pageIndex));

    this.searchButt = document.getElementById("search");
    this.searchButt.addEventListener("click", () => this.onSearch());
  },

  onPageChanged: function (pageIndex) {
    this.searchObj.pageIndex = pageIndex;
    this.postRequest(this.searchObj);
  },

  addHost: function(hostname) {
      if(! this.hosts.whitelist.includes(hostname)) {
          this.hosts.whitelist.push(hostname, '='+hostname, '!'+hostname, '!='+hostname);
      }
  },

  onSearch: function () {
    // Disable the button
    this.searchButt.disabled = true;

    this.searchObj = {};

    // Query
    if (this.query.value) {
        this.searchObj.query = this.query.value;
    }

    // Priority
    let priority = this.priority.getSelectedValues();

    if (priority.length) {
        this.searchObj.priority = priority;
    }

    // Facility
    let facility = this.facility.getSelectedValues();

    if (facility.length) {
        this.searchObj.facility = facility;
    }

    // Host
    // This will return a list of tags, e.g ["host1", "!host2", ...]
    this.searchObj.host = this.hosts.value.map((tag) => tag.value);

    // Date...

    // Time...
    this.searchObj.time=PickerTime.getTimeObject();
    console.log(this.searchObj.time);

    // Page size / index
    this.searchObj.pageSize = Pager.pageSize;
    this.searchObj.pageIndex = 0;

    this.postRequest(this.searchObj);
  },

  postRequest: function(searchObj) {

    fetch("/getlogs", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(searchObj)
      })
        .then((res) => res.json())
        .then((json) => Main.onResult(json))
        .catch((error) => Main.onError(error));
  },

  onResult: function (json) {
    this.searchButt.disabled = false;
    
    Pager.updatePagesCount(json.totalResults);
    Table.displayLogs(json.results);
  },

  onError: function (error) {
    this.searchButt.disabled = false;
    
    console.log("Fetch /getlogs failed: ", error);
  }
};

Main.init();
