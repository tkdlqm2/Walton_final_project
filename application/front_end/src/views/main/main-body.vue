<template>
  <div class="page">
    
    <!-- GNB -->
    <gnb id="gnb"/>
    
    <!-- BODY -->
    <section id="body" class="columns" >

      <!-- SIDE MENU -->
      <side-menu class="column is-2"></side-menu>

      <!-- MAIN BODY -->
      <section class="column is-6" id="main-body">
        <router-view/>
      </section>

      <!-- Event Log -->
      <section class="column is-3">
        <div id="eventLog">
        </div>
      </section>

    </section>

    <!-- FOOTER -->
    <main-footer></main-footer>
  </div><!-- .page END -->
</template>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script>
import gnb      from '../../components/gnb/gnb';
import menu     from '../../components/menu/side-menu';
import footer   from '../../components/footer/footer'
import io from 'socket.io-client';

console.log("socket connect");
const socket = io("0.0.0.0:8080");
console.log("socket : ", socket);
var domain = new Array();

let addDomain

const ICONS = {
    CARGO: 'https://cdn.iconscout.com/icon/premium/png-256-thumb/cargo-1434205-1215053.png',
    IMPORTER: 'https://cdn2.iconfinder.com/data/icons/shipping-and-delivery-solid-collection/60/31_-_Shipping_and_Delivery_-_Solid_-_Cargo_Ship-512.png',
    COFFEE: 'data:image/jpeg;base64,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',
    DELIVERY: 'data:image/png;base64,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'
}

window.onload = function () {
    addDomain = (domain) => {
        let imageUrl = ICONS.CARGO
        const name = String(domain.from)
        const importer = name.includes('유통')
        const container = name.includes('창고')
        const coffee = name.includes('로스팅')
        const delivery = name.includes('패키징')

        if (importer > 0) {
            imageUrl = ICONS.IMPORTER
        } else if (container > 0) {
            imageUrl = ICONS.CARGO
        } else if (coffee > 0) {
            imageUrl = ICONS.COFFEE
        } else {
            imageUrl = ICONS.DELIVERY
        }

        $("#eventLog").append(`<div class="event-title"><img width="50" height="50" src=${imageUrl} />`+ domain.from + "   " + domain.job + "</div>")
            .append("원두ID : " + domain.key + "</strong></div><br>")
            .append("BlockNumber : " + domain.blockNumber + "</strong></div><br>")
            .append("TransaciontID : " + domain.transactionId + "</strong></div><br>")
            .append("status : " + domain.status + "</strong></div><br><br>");
    }

    domain = JSON.parse(sessionStorage.getItem("domain"));
    for (var i = domain.length-1; i >=0; i--) {
        addDomain(domain[i])
    }
}


socket.on("importer_enroll_seed1", function (data) {

    console.log("importer_enroll_seed1",data);
    domain = JSON.parse(sessionStorage.getItem("domain"));

    if (domain == null) {
        domain = [data];
    } else {
        domain.push(data);
    }
    sessionStorage.setItem("domain", JSON.stringify(domain));
    ("#eventLog").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
        .append("원두ID : " + data.key + "</strong></div><br>")
        .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
        .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
        .append("status : " + data.status + "</strong></div><br><br>");
});
socket.on("importer_enroll_seed2", function (data) {
        domain = JSON.parse(sessionStorage.getItem("domain"));

        if (domain == null) {
            console.log(domain);
            domain = [data];
        } else {
            domain.push(data);
        }
        sessionStorage.setItem("domain", JSON.stringify(domain));
        ("#eventLog").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
        .append("원두ID : " + data.key + "</strong></div><br>")
        .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
        .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
        .append("status : " + data.status + "</strong></div><br><br>");

    });
socket.on("container_enroll_seed1", function (data) {

    domain = JSON.parse(sessionStorage.getItem("domain"));

    if (domain == null) {
        domain = [data];
    } else {
        domain.push(data);
    }
    sessionStorage.setItem("domain", JSON.stringify(domain));
    ("#eventLog").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
        .append("원두ID : " + data.key + "</strong></div><br>")
        .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
        .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
        .append("status : " + data.status + "</strong></div><br><br>");
});
socket.on("container_enroll_seed2", function (data) {

    domain = JSON.parse(sessionStorage.getItem("domain"));

    if (domain == null) {
        domain = [data];
    } else {
        domain.push(data);
    }
    sessionStorage.setItem("domain", JSON.stringify(domain));
    ("#eventLog").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
        .append("원두ID : " + data.key + "</strong></div><br>")
        .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
        .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
        .append("status : " + data.status + "</strong></div><br><br>");

});
socket.on("Roast_enroll_seed1", function (data) {

    domain = JSON.parse(sessionStorage.getItem("domain"));

    if (domain == null) {
        domain = [data];
    } else {
        domain.push(data);
    }
    sessionStorage.setItem("domain", JSON.stringify(domain));
    ("#eventLog").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
        .append("원두ID : " + data.key + "</strong></div><br>")
        .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
        .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
        .append("status : " + data.status + "</strong></div><br><br>");

});
socket.on("Roast_enroll_seed2", function (data) {

    domain = JSON.parse(sessionStorage.getItem("domain"));

    if (domain == null) {
        domain = [data];
    } else {
        domain.push(data);
    }
    sessionStorage.setItem("domain", JSON.stringify(domain));
    ("#eventLog").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
        .append("원두ID : " + data.key + "</strong></div><br>")
        .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
        .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
        .append("status : " + data.status + "</strong></div><br><br>");

});
socket.on("Roast_enroll_seed3", function (data) {

    domain = JSON.parse(sessionStorage.getItem("domain"));

    if (domain == null) {
        domain = [data];
    } else {
        domain.push(data);
    }
    sessionStorage.setItem("domain", JSON.stringify(domain));
    ("#eventLog").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
        .append("원두ID : " + data.key + "</strong></div><br>")
        .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
        .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
        .append("status : " + data.status + "</strong></div><br><br>");

});
socket.on("Package_enroll_seed1", function (data) {

    console.log("Package_enroll_seed1", data);
    domain = JSON.parse(sessionStorage.getItem("domain"));

    if (domain == null) {
        domain = [data];
    } else {
        domain.push(data);
    }
    sessionStorage.setItem("domain", JSON.stringify(domain));
    ("#eventLog").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
        .append("원두ID : " + data.key + "</strong></div><br>")
        .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
        .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
        .append("status : " + data.status + "</strong></div><br><br>");

});

socket.on("Package_enroll_seed2", function (data) {
    console.log("Package_enroll_seed2: ", data);

    domain = JSON.parse(sessionStorage.getItem("domain"));

    if (domain == null) {
        domain = [data];
    } else {
        domain.push(data);
    }
    sessionStorage.setItem("domain", JSON.stringify(domain));
    ("#eventLog").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
        .append("원두ID : " + data.key + "</strong></div><br>")
        .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
        .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
        .append("status : " + data.status + "</strong></div><br><br>");

});

socket.on("Package_enroll_seed3", function (data) {

    console.log("Package_enroll_seed3: ", data);
    domain = JSON.parse(sessionStorage.getItem("domain"));

    if (domain == null) {
        domain = [data];
    } else {
        domain.push(data);
    }
    sessionStorage.setItem("domain", JSON.stringify(domain));
    addDomain(domain)
});

export default {
  components : { 
    gnb,
    'side-menu'  : menu,
    'main-footer': footer,
  },
  
  data () { return {} }, 
  methods: {
  }
}
</script>

<style scoped>
#body { margin : 0; }
#main-body {min-height: 400px;}
#chatLogs {min-height: 800px;}
</style>

<style>

.event-title {
    text-align: center;
}
</style>