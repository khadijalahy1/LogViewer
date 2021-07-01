//
// filter.js v0.01
// This file is part of the rLogViewer project.  
// Copyright (c) AIAC GI17 P9 Team. All rights reserved.  
// Licensed under the MIT License. See LICENSE file in the project root for full license information.  
//

const Filters = {
    Facility: {
      icon: "assets/facility/ic_facility.svg",
      placeholder: "facility...",
      values: [
        {
          name: "kernel",
          class: "kern",
          icon: "assets/facility/ic_kern.svg"
        },
        {
          name: "user",
          class: "user",
          icon: "assets/facility/ic_user.svg"
        },
        {
          name: "mail",
          class: "mail",
          icon: "assets/facility/ic_mail.svg"
        },
        {
          name: "daemon",
          class: "daemon",
          icon: "assets/facility/ic_daemon.svg"
        },
        {
          name: "auth",
          class: "auth",
          icon: "assets/facility/ic_auth.svg"
        },
        {
          name: "syslog",
          class: "syslog",
          icon: "assets/facility/ic_syslog.svg"
        },
        {
          name: "lpr",
          class: "lpr",
          icon: "assets/facility/ic_lpr.svg"
        },
        {
          name: "cron",
          class: "cron",
          icon: "assets/facility/ic_cron.svg"
        },
        {
          name: "authpriv",
          class: "authpriv",
          icon: "assets/facility/ic_authpriv.svg"
        },
        {
          name: "ftp",
          class: "ftp",
          icon: "assets/facility/ic_ftp.svg"
        },
        {
          name: "local",
          class: "local",
          icon: "assets/facility/ic_local.svg"
        }
      ]
    },
  
    Priority: {
      icon: "assets/priority/ic_priority.svg",
      placeholder: "priority...",
      values: [
        {
          name: "emergency",
          class: "emerg",
          icon: "assets/priority/ic_emerg.svg"
        },
        {
          name: "alert",
          class: "alert",
          icon: "assets/priority/ic_alert.svg"
        },
        {
          name: "critical",
          class: "crit",
          icon: "assets/priority/ic_crit.svg"
        },
        {
          name: "error",
          class: "err",
          icon: "assets/priority/ic_err.svg"
        },
        {
          name: "warning",
          class: "warning",
          icon: "assets/priority/ic_warning.svg"
        },
        {
          name: "notice",
          class: "notice",
          icon: "assets/priority/ic_notice.svg"
        },
        {
          name: "info",
          class: "info",
          icon: "assets/priority/ic_info.svg"
        },
        {
          name: "debug",
          class: "debug",
          icon: "assets/priority/ic_debug.svg"
        }
      ]
    }
  };
  
  class FilterByTag {
    /*
    <div id="elementId" class="filter">
        <img src="filter.icon">                
        <div><span>{filter.placeholder}</span></div>
        <div>  
            <span>(empty)</span>                           
            <div class="tag ${filter.values[0].class}" title="Add"><img src="{filter.values[0].icon}">filter.values[0].name</div>
            <div class="tag ${filter.values[1].class}" title="Add"><img src="{filter.values[1].icon}">filter.values[1].name</div>
            ...
        </div>
        <div></div> // Add button
    </div>
    */
  
    /**
     *
     * @param {string} The id of the dom element.
     */
  
    /**
     *
     * @param {string} elementId The id of the dom element.
     * @param {Object} filter An object similar to Filters.Facility or Filters.Priority.
     */
    constructor(elementId, filter) {
      this.isListDropped = false;
  
      let element = document.getElementById(elementId);
  
      if (!element) throw Error(`${elementId} is not a valid id.`);
  
      element.className = "filter";
  
      let icon = document.createElement("IMG");
      icon.src = filter.icon;
  
      let selectedTagsPlacehodler = document.createElement("SPAN");
      selectedTagsPlacehodler.textContent = filter.placeholder;
  
      this.selectedTags = document.createElement("DIV");
      this.selectedTags.appendChild(selectedTagsPlacehodler);
  
      this.dropList = document.createElement("DIV");
      this.replaceValues(filter.values);
  
      this.addButt = document.createElement("DIV");
  
      element.appendChild(icon);
      element.appendChild(this.selectedTags);
      element.appendChild(this.dropList);
      element.appendChild(this.addButt);
  
      // Prevent event propagation
      element.addEventListener("click", (event) => event.stopPropagation());
  
      this.addButt.addEventListener("click", (event) => this.onAddTagsClicked(event));
  
      FilterByTag.instances.push(this);
    }
  
    getSelectedValues() {
      let classes = [];
      for (let i = 1; i < this.selectedTags.childElementCount; i++) {
        classes.push(this.selectedTags.children[i].classList[1]);
      }
      return classes;
    }
  
    replaceValues(values) {
      let placeholder = document.createElement("SPAN");
      placeholder.textContent = "(empty)";
  
      let tags = [placeholder];
  
      values.forEach((value) => {        
        let tag = FilterByTag.tagElmFromValue(value, "Add", (event) => this.onDropListTagClicked(event));
        tags.push(tag);
      });
  
      this.dropList.replaceChildren(...tags);
    }
  
    onDropListTagClicked(event) {
      if (event) event.stopPropagation();
  
      let parent = event.currentTarget.parentNode;
      let tag = parent.removeChild(event.currentTarget);
  
      if (parent === this.selectedTags) {
        if (this.dropList.childElementCount === 1) this.dropList.children[0].style.display = "none";
  
        if (this.selectedTags.childElementCount === 1) this.selectedTags.children[0].style.display = "block";
  
        tag.title = "Add";
        this.dropList.appendChild(tag);
      } else {
        if (this.dropList.childElementCount === 1) {
          this.onAddTagsClicked();
          this.dropList.children[0].style.display = "block";
        }
  
        if (this.selectedTags.childElementCount == 1) this.selectedTags.children[0].style.display = "none";
  
        tag.title = "Remove";
        this.selectedTags.appendChild(tag);
      }
    }
  
    onAddTagsClicked(event) {
      if (event) event.stopPropagation();
  
      FilterByTag.closeDropLists(this);
  
      if (this.isListDropped) {
        // Close list
        this.addButt.classList.remove("close");
        this.dropList.classList.remove("dropped");
      } else {
        // Drop list
        this.addButt.classList.add("close");
        this.dropList.classList.add("dropped");
      }
  
      this.isListDropped = !this.isListDropped;
    }
  
    closeDropList() {
      if (this.isListDropped) {
        this.onAddTagsClicked();
      }
    }

  
    static instances = [];
  
    static closeDropLists(exception) {
      FilterByTag.instances.forEach((instance) => {
        if (instance === exception) return;
        instance.closeDropList();
      });
    }
  
    static staticConstructor = (function () {
      document.addEventListener("click", () => FilterByTag.closeDropLists());
    })();


    // Utils:
    static tagElmFromValue(value, tooltip, clickListener) {
      let tag = document.createElement("DIV");
      tag.className = "tag";

      if(tooltip) {
        tag.title = tooltip;        
      }
      
      if (value.class) {
        tag.classList.add(value.class);
      }

      if(clickListener) {
        tag.addEventListener('click', clickListener);
      }

      if (value.icon) {
        let icon = document.createElement("IMG");
        icon.src = value.icon;
        tag.appendChild(icon);
      }

      tag.appendChild(document.createTextNode(value.name));
      return tag;
    }
  }
  
