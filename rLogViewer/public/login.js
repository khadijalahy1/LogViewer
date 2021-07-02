function postRequest(hostInfos){
    
    console.log("I'm inside post request");
    console.log("hostInfos insidePost:",hostInfos);
    console.log(JSON.stringify(hostInfos));

    fetch("/Login", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            'Accept': 'application/json',
          "Content-Type": "application/json"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(hostInfos)
      })
        .then((res) => res.json())
        .then((json) => Main.onResult(json))
        .catch((error) => Main.onError(error));

}

const Main = {
    showOrhide: function () {
        let toggle = document.getElementsByClassName("toggle")[0];
        let password = document.querySelector("#password");

        console.log(toggle);

        if (password.getAttribute("type") == "password") {
            password.setAttribute("type", "text");
        } else {
            password.setAttribute("type", "password")
        }


    },
    getHostName: function () {
        let hostName = document.getElementById("hostName");
        return (hostName.value);

    },
    getPassword: function () {
        let password = document.getElementById("password");
        return (password.value);


    },
   

    ppostRequest: function(hostInfos) {
        console.log("I'm inside post request");

        fetch("/Login", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json"
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(hostInfos)
          })
            .then((res) => res.json())
            .then(() => Main.onResult())
            .catch((error) => Main.onError(error));
      },
      onLogin: function () {
        console.log("I'm inside login function")
        this.hostInfos={}
        this.hostInfos.hostName=Main.getHostName()
        this.hostInfos.password=Main.getPassword()
        console.log(hostName + "" + password);
        console.log("hostInfos",this.hostInfos);
        postRequest(this.hostInfos);


    },
    
      onResult: function (json) {
        console.log("post successufully");
        console.log(json);
      },
    
      onError: function (error) {
      
        
        console.log("Fetch /login failed: ", error);
      },
      init: function () {
          var toggle = document.getElementById("toggle");
          var loginButton = document.getElementById("btn");
          loginButton.addEventListener("click", this.onLogin);
          toggle.addEventListener("click",this.showOrhide);
       

  
      }

}
Main.init();