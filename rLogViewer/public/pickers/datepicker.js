// Converts a date into '12-Oct-1984' format
//input: date+time , output: '12-Oct-1984' format
var callendarClicked=0;
var dateObject = {
  operator: null,
  date1: null,
  date2: null
};


const CHOICES = {
  Before: "<",
  After: ">",
  Between: "BETWEEN",
  At: "="

}

function getDateString(dt) {
  console.log("input getDateString", dt);
  console.log("getDateSreing :", dt.getDate() + '-' +
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getMonth()] +
    '-' + dt.getFullYear())
  return dt.getDate() + '-' +
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getMonth()] +
    '-' + dt.getFullYear();

}

// Converts a date into 'July 2010' format
function getMonthYearString(dt) {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'][dt.getMonth()] +
    ' ' + dt.getFullYear();
}

// This is the function called when the user clicks any button
//this function is executed when choosing a date
function chooseDate(e,) {
  console.log("function ")
  var targ; // Crossbrowser way to find the target (http://www.quirksmode.org/js/events_properties.html)
  if (!e) var e = window.event;
  if (e.target) targ = e.target;
  else if (e.srcElement) targ = e.srcElement;
  if (targ.nodeType == 3) targ = targ.parentNode; // defeat Safari bug



  var div = targ.parentNode.parentNode.parentNode.parentNode.parentNode; // Find the div
  var idOfTextbox = div.getAttribute('datepickertextbox'); // Get the textbox id which was saved in the div
  var textbox = document.getElementById(idOfTextbox); // Find the textbox now
  if (targ.value == '<' || targ.value == '>' || targ.value == '<<' || targ.value == '>>') { // Do they want the change the month?

    createCalendar(div, new Date(targ.getAttribute('date')));
    return;
  }
  textbox.value = targ.getAttribute('date'); // Set the selected date

  // --------INTIBAH:hahya la date li khtarina katjina 3la had chkl : 2-Jun-2021-----------------
  console.log("date chosen iiiiiiiiiis:", textbox.value)
  console.log(dateFormat(textbox.value));
  //I'll change the object here
  if(callendarClicked==1){
    dateObject.date1=dateFormat(textbox.value);
  }
  if(callendarClicked==2){
    dateObject.date2=dateFormat(textbox.value);
  }
  
  div.parentNode.removeChild(div); // Remove the dropdown box now
  parseMyDate(textbox.value);
}







// Parse a date in d-MMM-yyyy format

//I'm not interested in
function parseMyDate(d) {

  if (d == "") return new Date('NotADate'); // For Safari
  var a = d.split('-');
  if (a.length != 3) return new Date(d); // Missing 2 dashes
  var m = -1; // Now find the month
  if (a[1] == 'Jan') m = 0;
  if (a[1] == 'Feb') m = 1;
  if (a[1] == 'Mar') m = 2;
  if (a[1] == 'Apr') m = 3;
  if (a[1] == 'May') m = 4;
  if (a[1] == 'Jun') m = 5;
  if (a[1] == 'Jul') m = 6;
  if (a[1] == 'Aug') m = 7;
  if (a[1] == 'Sep') m = 8;
  if (a[1] == 'Oct') m = 9;
  if (a[1] == 'Nov') m = 10;
  if (a[1] == 'Dec') m = 11;



  if (m < 0) return new Date(d); // Couldn't find the month

  return new Date(a[2], m, a[0], 0, 0, 0, 0);

}
// from  '2-Jun-2021' to 'YYYY-MM-DD'
function dateFormat(d){
  if (d == "") return new Date('NotADate'); // For Safari
  var a = d.split('-');
  if (a.length != 3) return new Date(d); // Missing 2 dashes
  var m = 0; // Now find the month
  if (a[1] == 'Jan') m = 1;
  if (a[1] == 'Feb') m = 2;
  if (a[1] == 'Mar') m = 3;
  if (a[1] == 'Apr') m = 4;
  if (a[1] == 'May') m = 5;
  if (a[1] == 'Jun') m = 6;
  if (a[1] == 'Jul') m = 7;
  if (a[1] == 'Aug') m = 8;
  if (a[1] == 'Sep') m = 9;
  if (a[1] == 'Oct') m = 10;
  if (a[1] == 'Nov') m = 11;
  if (a[1] == 'Dec') m = 12;
  return (a[2]+'-'+m+'-'+a[0]);


}

// This creates the calendar for a given month
function createCalendar(div, month) {
  console.log("function createCalendar is called !")
  var idOfTextbox = div.getAttribute('datepickertextbox'); // Get the textbox id which was saved in the div
  var textbox = document.getElementById(idOfTextbox); // Find the textbox now
  var tbl = document.createElement('table');
  var topRow = tbl.insertRow(-1);
  var td = topRow.insertCell(-1);
  var lastYearBn = document.createElement('input');
  lastYearBn.type = 'button'; // Have to immediately set the type due to IE
  td.appendChild(lastYearBn);
  lastYearBn.value = '<<';
  lastYearBn.onclick = chooseDate;
  lastYearBn.setAttribute('date', new Date(month.getFullYear(), month.getMonth() - 12, 1, 0, 0, 0, 0).toString());
  var td = topRow.insertCell(-1);
  var lastMonthBn = document.createElement('input');
  lastMonthBn.type = 'button'; // Have to immediately set the type due to IE
  td.appendChild(lastMonthBn);
  lastMonthBn.value = '<';
  lastMonthBn.onclick = chooseDate;
  lastMonthBn.setAttribute('date', new Date(month.getFullYear(), month.getMonth() - 1, 1, 0, 0, 0, 0).toString());
  var td = topRow.insertCell(-1);
  td.colSpan = 3;
  var mon = document.createElement('input');
  mon.type = 'text';
  td.appendChild(mon);
  mon.value = getMonthYearString(month);
  mon.size = 15;
  mon.disabled = 'disabled';
  mon.className = 'monthDsp';
  var td = topRow.insertCell(-1);
  var nextMonthBn = document.createElement('input');
  nextMonthBn.type = 'button';
  td.appendChild(nextMonthBn);
  nextMonthBn.value = '>';
  nextMonthBn.onclick = chooseDate;
  nextMonthBn.setAttribute('date', new Date(month.getFullYear(), month.getMonth() + 1, 1, 0, 0, 0, 0).toString());
  var td = topRow.insertCell(-1);
  var nextYearBn = document.createElement('input');
  nextYearBn.type = 'button'; // Have to immediately set the type due to IE
  td.appendChild(nextYearBn);
  nextYearBn.value = '>>';
  nextYearBn.onclick = chooseDate;
  nextYearBn.setAttribute('date', new Date(month.getFullYear(), month.getMonth() + 12, 1, 0, 0, 0, 0).toString());
  var daysRow = tbl.insertRow(-1);
  daysRow.insertCell(-1).innerHTML = "Mon";
  daysRow.insertCell(-1).innerHTML = "Tue";
  daysRow.insertCell(-1).innerHTML = "Wed";
  daysRow.insertCell(-1).innerHTML = "Thu";
  daysRow.insertCell(-1).innerHTML = "Fri";
  daysRow.insertCell(-1).innerHTML = "Sat";
  daysRow.insertCell(-1).innerHTML = "Sun";
  daysRow.className = 'daysRow';
  // Make the calendar
  var selected = parseMyDate(textbox.value); // Try parsing the date
  var today = new Date();
  date = new Date(month.getFullYear(), month.getMonth(), 1, 0, 0, 0, 0); // Starting at the 1st of the month
  var extras = (date.getDay() + 6) % 7; // How many days of the last month do we need to include?
  date.setDate(date.getDate() - extras); // Skip back to the previous monday
  while (1) { // Loop for each week
    var tr = tbl.insertRow(-1);
    for (i = 0; i < 7; i++) { // Loop each day of this week
      var td = tr.insertCell(-1);
      var inp = document.createElement('input');
      inp.type = 'button';
      td.appendChild(inp);
      inp.value = date.getDate();
      inp.onclick = chooseDate;
      inp.setAttribute('date', getDateString(date));
      if (date.getMonth() != month.getMonth()) {
        if (inp.className) inp.className += ' ';
        inp.className += 'othermonth';
      }
      if (date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()) {
        if (inp.className) inp.className += ' ';
        inp.className += 'today';
      }
      if (!isNaN(selected) && date.getDate() == selected.getDate() && date.getMonth() == selected.getMonth() && date.getFullYear() == selected.getFullYear()) {
        if (inp.className) inp.className += ' ';
        inp.className += 'selected';
      }
      date.setDate(date.getDate() + 1); // Increment a day
    }
    // We are done if we've moved on to the next month
    if (date.getMonth() != month.getMonth()) {
      break;
    }
  }

  // At the end, we do a quick insert of the newly made table, hopefully to remove any chance of screen flicker
  if (div.hasChildNodes()) { // For flicking between months
    div.replaceChild(tbl, div.childNodes[0]);

  } else { // For creating the calendar when we click the icon first time
    console.log("For creating the calendar when they first click the icon !")


    div.appendChild(tbl);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This is called when they click the icon next to the date inputbox
//had la fonction hya lms2oola 3la dohor oL2ikhfa2 dyal date picker
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function showDatePicker(idOfTextbox) {
  if (idOfTextbox=="date1"){
    callendarClicked=1;

  }
  else{
    callendarClicked=2;
  }
  var textbox = document.getElementById(idOfTextbox);


  // See if the date picker is already there, if so, remove it
  x = textbox.parentNode.getElementsByTagName('div');
  for (i = 0; i < x.length; i++) {
    if (x[i].getAttribute('class') == 'datepickerdropdown') {
      textbox.parentNode.removeChild(x[i]);
      console.log("hide date picker");
      return false;
    }
  }

  // Grab the date, or use the current date if not valid
  var date = parseMyDate(textbox.value);
  if (isNaN(date)) date = new Date();

  // Create the box
  var div = document.createElement('div');
  div.className = 'datepickerdropdown';
  div.setAttribute('datepickertextbox', idOfTextbox); // Remember the textbox id in the div
  createCalendar(div, date); // Create the calendar
  insertAfter(div, textbox); // Add the box to screen just after the textbox
  console.log("next Month");
  return false;
}

// Adds an item after an existing one
//hadi facultatif
function insertAfter(newItem, existingItem) {
  if (existingItem.nextSibling) { // Find the next sibling, and add newItem before it
    existingItem.parentNode.insertBefore(newItem, existingItem.nextSibling);
  } else { // In case the existingItem has no sibling after itself, append it
    existingItem.parentNode.appendChild(newItem);
  }
}

/*
 * onDOMReady
 * Copyright (c) 2009 Ryan Morr (ryanmorr.com)
 * Licensed under the MIT license.
 */
function onDOMReady(fn, ctx) {
  var ready, timer;
  var onStateChange = function (e) {

    if (e && e.type == "DOMContentLoaded") {
      fireDOMReady()
    }
    else if (e && e.type == "load") {
      fireDOMReady()
    }
    else if (document.readyState) {

      if ((/loaded|complete/).test(document.readyState)) {
        fireDOMReady()
      }
      else if (!!document.documentElement.doScroll) {

        try { ready || document.documentElement.doScroll('left') }
        catch (e) { return } fireDOMReady()

      }
    }

  };
  var fireDOMReady = function () {
    if (!ready) {
      ready = true;
      fn.call(ctx || window);
      if (document.removeEventListener) document.removeEventListener("DOMContentLoaded", onStateChange, false);
      document.onreadystatechange = null;
      window.onload = null; clearInterval(timer); timer = null
    }
  };

  if (document.addEventListener) document.addEventListener("DOMContentLoaded", onStateChange, false);
  document.onreadystatechange = onStateChange; timer = setInterval(onStateChange, 5);
  window.onload = onStateChange

};
function showCallendar1() {


  var dateContainer = document.getElementById("date1");
  // Found one! Now lets add a datepicker next to it  
  var a = document.createElement('a');
  a.href = '#';
  a.className = "datepickershow";

  a.setAttribute('onclick', 'return showDatePicker("date1")');
  var img = document.createElement('img');
  img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABGdBTUEAAK/INwWK6QAAABh0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjM2qefiJQAAAdtJREFUOE+Vj+9PUnEUxvPvar3xja96Q1hGEKG0ubZqbfHCNqIVA4eYLAwFp0LYD4iIJEdeRGGZwDAEcUOn9oNIvPcGgjBQfHE69/YFihe1zs59du7d83nOuR0AcOq/CgEqWbaHDqaD+clF1rLAmija6MsZ5vb0s9nB1xm168s9x67y6Y7q2TaXjo8tVKjUTv7Zt61pAkwt/UA3zFwFuxysV2BKAuYeMAnBcBaGukDdCaozaLg5sUGAiQDLA3IIDIBfAfO34N118PaDRwYvRfBcCMrTaLg2liTAOEW3NjzpBZsMpqUwKQaLCMYvwGMhjArQIDfGCTDqy3EAX47lfVTnCo3qCnOzJ8IpW6pJR2IEGHn7/bBaR5MLO8y8CtPuKO2J0nMfGdKr+5uZ4kVdhAD6N99K1bo7ynB5vHpj3AZ0NxWBbs0KAbTur8VKfTbGeFcbkc1sfnBHuA1CzTIB7js/H5SPffFW3q9sau2PDdLhxkl3X+wiQCVYf4Jt3h1Itmb8iBvEusZJd2a2CuXjxXUWU5dSnAZ5/b0QkOobgMKWzh8eMcXaXr6aYSqfcuXtbAkdbS3RfSD/MGDfvGFO9ZuSfY/ilx/GLumi57Vhgfp9W597ECJA2/a/v/4ENLpYKsDo3kgAAAAASUVORK5CYII=';
  img.title = 'Show calendar';
  a.appendChild(img);
  insertAfter(a, dateContainer);



}
function showCallendar2() {
  var dateContainer = document.getElementById("date2");
  // Found one! Now lets add a datepicker next to it  
  var a = document.createElement('a');
  a.href = '#';
  a.className = "datepickershow";

  a.setAttribute('onclick', 'return showDatePicker("date2")');
  var img = document.createElement('img');
  img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABGdBTUEAAK/INwWK6QAAABh0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjM2qefiJQAAAdtJREFUOE+Vj+9PUnEUxvPvar3xja96Q1hGEKG0ubZqbfHCNqIVA4eYLAwFp0LYD4iIJEdeRGGZwDAEcUOn9oNIvPcGgjBQfHE69/YFihe1zs59du7d83nOuR0AcOq/CgEqWbaHDqaD+clF1rLAmija6MsZ5vb0s9nB1xm168s9x67y6Y7q2TaXjo8tVKjUTv7Zt61pAkwt/UA3zFwFuxysV2BKAuYeMAnBcBaGukDdCaozaLg5sUGAiQDLA3IIDIBfAfO34N118PaDRwYvRfBcCMrTaLg2liTAOEW3NjzpBZsMpqUwKQaLCMYvwGMhjArQIDfGCTDqy3EAX47lfVTnCo3qCnOzJ8IpW6pJR2IEGHn7/bBaR5MLO8y8CtPuKO2J0nMfGdKr+5uZ4kVdhAD6N99K1bo7ynB5vHpj3AZ0NxWBbs0KAbTur8VKfTbGeFcbkc1sfnBHuA1CzTIB7js/H5SPffFW3q9sau2PDdLhxkl3X+wiQCVYf4Jt3h1Itmb8iBvEusZJd2a2CuXjxXUWU5dSnAZ5/b0QkOobgMKWzh8eMcXaXr6aYSqfcuXtbAkdbS3RfSD/MGDfvGFO9ZuSfY/ilx/GLumi57Vhgfp9W597ECJA2/a/v/4ENLpYKsDo3kgAAAAASUVORK5CYII=';
  img.title = 'Show calendar';
  a.appendChild(img);
  insertAfter(a, dateContainer);

}

// This is called when the page loads, it searches for inputs where the class is 'datepicker'


class PickerDate {


  //------should be written in an other file later------------------------------------
  /*
     we want this object at the end
     dateObject={
         operator:'=','>','<','BETWEEN',
         date1:'YYYY-MM-DD',
         date2:'YYYY-MM-DD',
     }
    
  */


  //--------------------------------------------------------------------------------------------------------------------------------------------




  static changeDateObject() {
    var selecter = document.getElementById("dateRange");

    function onSelect() {
      console.log("I'm inside the function onSelect");

      dateObject.date1 = null;
      dateObject.date2 = null;

      var choice = selecter.value;
      dateObject.operator = choice;
     
      const innerHTML1 = '<input type="text" class="picker" id="date1">';
      const innerHTML2 = '<input type="text" class="picker" id="date2">';
      var date1 = document.getElementById("date1Container");
      var date2 = document.getElementById("date2Container");

      switch (choice) {
        case CHOICES.Before:
        case CHOICES.After:
        case CHOICES.At:
          date1.innerHTML = innerHTML1;
          date2.innerHTML = "<p></p>";
          showCallendar1();
        
          
         //dateObject should be returned here

          break;




        default:
          //BETWEEN
          date1.innerHTML = innerHTML1;
          date2.innerHTML = innerHTML2;
          showCallendar1();
          showCallendar2();
          //dateObject should be changed here
         
          

      }
 



  }
  selecter.addEventListener("change",onSelect);
}
static getDateObject(){
  console.log("there is the date object that will be fetched",dateObject);
  return(dateObject);
}











}

PickerDate.changeDateObject();









