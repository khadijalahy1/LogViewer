
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
    onLogin: function () {
        console.log("I'm inside fetchData")
        let hostInfos={}
        hostInfos.hostName=this.getHostName()
        hostInfos.password=this.getPassword()
        console.log(hostName + "" + password);


    },

    postRequest: function(hostInfos) {

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
      },
      init: function () {
          var toggle = document.getElementById("toggle");
          var loginButton = document.getElementById("btn");
          loginButton.addEventListener("click", this.onLogin);
          toggle.addEventListener("click",this.showOrhide)
  
      }

}
Main.init();