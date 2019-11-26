$(function () {
    // socket.io 서버에 접속한다
    var socket = io();
    var domain = new Array();

    // 서버로부터의 메시지가 수신되면
    socket.on("importer_enroll_seed1", function (data) {

        domain = JSON.parse(sessionStorage.getItem("domain"));

        if (domain == null) {
            domain = [data];
        } else {
            domain.push(data);
        }
        sessionStorage.setItem("domain", JSON.stringify(domain));
        $("#chatLogs").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
            .append("원두 ID : " + data.key + "</strong></div><br>")
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
        $("#chatLogs").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
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
        $("#chatLogs").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
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
        $("#chatLogs").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
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
        $("#chatLogs").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
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
        $("#chatLogs").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
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
        $("#chatLogs").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
            .append("원두ID : " + data.key + "</strong></div><br>")
            .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
            .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
            .append("status : " + data.status + "</strong></div><br><br>");

    });
    socket.on("Package_enroll_seed1", function (data) {

        domain = JSON.parse(sessionStorage.getItem("domain"));

        if (domain == null) {
            domain = [data];
        } else {
            domain.push(data);
        }
        sessionStorage.setItem("domain", JSON.stringify(domain));
        $("#chatLogs").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
            .append("원두ID : " + data.key + "</strong></div><br>")
            .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
            .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
            .append("status : " + data.status + "</strong></div><br><br>");

    });

    socket.on("Package_enroll_seed2", function (data) {

        domain = JSON.parse(sessionStorage.getItem("domain"));

        if (domain == null) {
            domain = [data];
        } else {
            domain.push(data);
        }
        sessionStorage.setItem("domain", JSON.stringify(domain));
        $("#chatLogs").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
            .append("원두ID : " + data.key + "</strong></div><br>")
            .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
            .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
            .append("status : " + data.status + "</strong></div><br><br>");

    });

    socket.on("Package_enroll_seed3", function (data) {

        domain = JSON.parse(sessionStorage.getItem("domain"));

        if (domain == null) {
            domain = [data];
        } else {
            domain.push(data);
        }
        sessionStorage.setItem("domain", JSON.stringify(domain));
        $("#chatLogs").append("-------------------" + data.from + "   " + data.job + "-------------------" + "</strong></div><br>")
            .append("원두ID : " + data.key + "</strong></div><br>")
            .append("BlockNumber : " + data.blockNumber + "</strong></div><br>")
            .append("TransaciontID : " + data.transactionId + "</strong></div><br>")
            .append("status : " + data.status + "</strong></div><br><br>");

    });

    domain = JSON.parse(sessionStorage.getItem("domain"));

    for (var i = domain.length - 1; i >= 0; i--) {
        $("#chatLogs").append("-------------------" + domain[i].from + "   " + domain[i].job + "-------------------" + "</strong></div><br>")
            .append("원두ID : " + domain[i].key + "</strong></div><br>")
            .append("BlockNumber : " + domain[i].blockNumber + "</strong></div><br>")
            .append("TransaciontID : " + domain[i].transactionId + "</strong></div><br>")
            .append("status : " + domain[i].status + "</strong></div><br><br>");
    }

});