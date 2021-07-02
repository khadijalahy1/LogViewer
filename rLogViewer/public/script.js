//
// script.js v0.01
// This file is part of the rLogViewer project.  
// Copyright (c) AIAC GI17 P9 Team. All rights reserved.  
// Licensed under the MIT License. See LICENSE file in the project root for full license information.  
//

const Pager = {    
  pageSelector: null,
  pageSummary: null,
  pageIndex: 0,
  pageSize: 10,

  init: function (pageChangedListener) {    
    
    this.pageSelector = document.getElementById("select-page-index");
    this.pageSummary = document.getElementById("page-result-summary");

    this.pageSelector.addEventListener("change", (e) => {
      Pager.pageIndex = this.pageSelector.selectedIndex;
      pageChangedListener(Pager.pageIndex);
    });

    let pageSizeSelector = document.getElementById("select-page-size");
    pageSizeSelector.addEventListener("change", (e) => {
      Pager.pageSize = parseInt(e.target.value, 10);
    });

    this.pageSize = parseInt(pageSizeSelector.value, 10);
  },

  updatePageInfo: function (totalResults, summary) {        
    
    // This function gets called when a new result is displayed. The page index must be reset.
    this.pageSelector.selectedIndex = 0;

    let pagesCount = Math.floor(totalResults / this.pageSize);
    if( totalResults % this.pageSize > 0 ) {
        pagesCount ++;
    }

    let currentPagesCount = this.pageSelector.childElementCount;

    if(pagesCount < currentPagesCount) {
      for(let i = 0; i < currentPagesCount - pagesCount; i++) {
        this.pageSelector.lastChild.remove();
      }
    } 
    else if(pagesCount > currentPagesCount) {
      for(let i = currentPagesCount + 1; i <= pagesCount; i++) {
        var option = document.createElement("OPTION");
        option.text = i.toString();
        this.pageSelector.add(option);
      }          
    }
      
    this.pageSummary.textContent = summary;
  },
};

const Table = {
  table: document.getElementById("table"),
  body: document.getElementById("table-body"),
  placehoder: document.getElementById("table-placeholder"),

  displayLogs: function (logs) {
    this.body.innerHTML = "";

    logs.forEach((log) => {
        let row = this.body.insertRow();
        row.insertCell().appendChild(FilterByTag.tagElmFromValue({'name': log.ReceivedAt.slice(0, -5), 'class': 'time'}));
        row.insertCell().appendChild(FilterByTag.tagElmFromValue({'name': log.Host, 'class': 'host'}));

        row.insertCell().appendChild(FilterByTag.tagElmFromValue(Filters.Facility.values[log.Facility], 'Add to filter'));
        row.insertCell().appendChild(FilterByTag.tagElmFromValue(Filters.Priority.values[log.Priority], 'Add to filter'));

        row.insertCell().appendChild(document.createTextNode(log.Message));
        row.insertCell().appendChild(FilterByTag.tagElmFromValue({'name': log.SysLogTag, 'class': 'systag'}));
        row.insertCell().appendChild(FilterByTag.tagElmFromValue({'name': log.DeviceReportedTime.slice(0, -5), 'class': 'time'}));
  
        Main.addHost(log.Host);
    });

    this.placehoder.style.display = 'none';
    this.table.style.display = 'table';
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
      //enforceWhitelist: true,
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
          this.hosts.whitelist.push(hostname);
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
    this.searchObj.date=PickerDate.getDateObject();
    console.log(this.searchObj.date);

    // Time...
    this.searchObj.time=PickerTime.getTimeObject();
    console.log(this.searchObj.time);

    // Page size / index
    this.searchObj.pageSize = Pager.pageSize;
    this.searchObj.pageIndex = 0;

    this.postRequest(this.searchObj);
  },

  postRequest: function(searchObj) {

    this.fetchTimestamp = Date.now();

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

    Pager.updatePageInfo(json.totalResults, `Fetched ${json.totalResults} logs in ${Math.floor((Date.now() - this.fetchTimestamp)/1000)} seconds.`);
    Table.displayLogs(json.results);
  },

  onError: function (error) {
    this.searchButt.disabled = false;
    
    alert("Oops, something went wrong.\nCheck the devtools console for more information.");
    console.log(error);
  }
};

Main.init();
