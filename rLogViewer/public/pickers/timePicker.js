var timeObject = {
  operator: null,
  time1: null,
  time2: null
};


function timePicker(id, callback) {
  var input = document.getElementById(id);
  var timePicker = document.createElement("div");
  timePicker.classList.add("time-picker");
  input.value = "00:00:00";

  //open timepicker
  input.onclick = function () {
    timePicker.classList.toggle("open");

    this.setAttribute("disabled", "disabled");
    timePicker.innerHTML += `
     <div class="set-time">
        <div class="label">
           <a id="plusH" >+</a>
           <input class="set" type="text" id="hour" value="00">
           <a id="minusH">-</a>
        </div>
        <div class="label">
           <a id="plusM">+</a>
           <input class="set" type="text" id="minute" value="00">
           <a id="minusM">-</a>
        </div>
        <div class="label">
        <a id="plusS">+</a>
        <input class="set" type="text" id="seconde" value="00">
        <a id="minusS">-</a>
     </div>
     </div>
     <div id="submitTime">Set time</div>`;
    this.after(timePicker);
    var plusH = document.getElementById("plusH");
    var minusH = document.getElementById("minusH");
    var plusM = document.getElementById("plusM");
    var minusM = document.getElementById("minusM");
    var plusS = document.getElementById("plusS");
    var minusS = document.getElementById("minusS");
    var h = parseInt(document.getElementById("hour").value);
    var m = parseInt(document.getElementById("minute").value);
    var s = parseInt(document.getElementById("seconde").value);

    //increment hour
    plusH.onclick = function () {
      h = isNaN(h) ? 0 : h;
      if (h === 23) {
        h = -1;
      }
      h++;
      document.getElementById("hour").value = (h < 10 ? "0" : 0) + h;
    };
    //decrement hour
    minusH.onclick = function () {
      h = isNaN(h) ? 0 : h;
      if (h === 0) {
        h = 24;
      }
      h--;
      document.getElementById("hour").value = (h < 10 ? "0" : 0) + h;
    };
    //increment minute
    plusM.onclick = function () {
      m = isNaN(m) ? 0 : m;
      if (m === 59) {
        m = -1;
      }
      m = m + 1;
      document.getElementById("minute").value = (m < 10 ? "0" : 0) + m;
    };
    //decrement second
    minusM.onclick = function () {
      m = isNaN(m) ? 0 : m;
      if (m === 0) {
        m = 60;
      }
      m--;
      document.getElementById("minute").value = (m < 10 ? "0" : 0) + m;
    };
    plusS.onclick = function () {
      m = isNaN(m) ? 0 : m;
      if (m === 59) {
        m = -1;
      }
      m = m + 1;
      document.getElementById("seconde").value = (m < 10 ? "0" : 0) + m;
    };
    //decrement second
    minusS.onclick = function () {
      m = isNaN(m) ? 0 : m;
      if (m === 0) {
        m = 60;
      }
      m--;
      document.getElementById("seconde").value = (m < 10 ? "0" : 0) + m;
    };

    //submit timepicker
    var submit = document.getElementById("submitTime");
    submit.onclick = function () {
      /*function that chages timeObject is executed here
          !Between: -> click=>get timeObject
          Between: ->khass hta ysetet time1 o time2 3
          */
      input.value =
        document.getElementById("hour").value + ":" + document.getElementById("minute").value + ":" + document.getElementById("seconde").value;
      callback(input.value);

      input.removeAttribute("disabled");
      

      timePicker.classList.toggle("open");
      timePicker.innerHTML = "";
    };
  };
}



class PickerTime {

  

  //------should be written in an other file later------------------------------------
  /*
   we want this object at the end
   timeObject={
       operator:'=','>','<','BETWEEN',
       time1:'hh:mm:ss',
       time2:'hh:mm:ss',
   }
  
  */


  //should pass a variable and be implemented
  //should return a timeObject
  // a static function that should return the timeObject

  static changeTimeObject() {

    var selecter = document.getElementById("timeRange");
   

    const CHOICES = {
      Before: "<",
      After: ">",
      Between: "BETWEEN",
      At: "="
    };
    //---------------------------------------------

    function onSelect() {

      timeObject.time1 = null;
      timeObject.time2 = null;

      var choice = selecter.value;
      timeObject.operator = choice;
     
      const innerHTML1 = '<input type="text" class="picker" id="timePicker1">';
      const innerHTML2 = '<input type="text" class="picker" id="timePicker2">';
      var time1 = document.getElementById("time1");
      var time2 = document.getElementById("time2");

      switch (choice) {
        case CHOICES.Before:
        case CHOICES.After:
        case CHOICES.At:
          time1.innerHTML = innerHTML1;
          time2.innerHTML = "<p></p>";
          timePicker("timePicker1", function (result) {
            timeObject.time1 = result;
           
            
            //timeObject should be returned here
          });
          
         

          break;




        default:
          //BETWEEN
          time1.innerHTML = innerHTML1;
          time2.innerHTML = innerHTML2;
          timePicker("timePicker1", function (result) {
            timeObject.time1 = result;
          });
          timePicker("timePicker2", function (result) {
            timeObject.time2 = result;
           
            //timeObject should be returned here
          });
          

      }
      

      
    }
    //onSelect changes the value of timeObject
    //-----------------------------------------------------------------------
    selecter.addEventListener("change", onSelect );
    //what do we want?
    //on select timeObject should be changed .
    

   


  }

  static getTimeObject(){
    console.log("I'm inside getTimeObject");
    return(timeObject);
  }















}
//function that changes the value of a global variable

PickerTime.changeTimeObject();




