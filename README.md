# Walton_final_project
This project is upgrade version about the circle system of coffee seed.

<br><br>
# Compare with first project version


- first version <br>
Each organization has node servers, so there are only four express servers. This is very inefficient.

![version1](./images/version1.png) <br><br>

- second version <br>
Version 2 complements the inefficient configuration in version 1 by reducing the express server from four to one. In addition, real-time transaction event alarm service UI was added.


![version4](./images/version4.png)

# Getting start

1. Start Hyperledger network <br><br>
: cd network <br>
: ./start.sh <br><br>

2. Set Chaincode <br><br>
: ./cc.sh

3. Start node express server<br><br>
: cd appliaction<br>
: npm install <br>
: cd server1 <br>
: node server <br><br>

4. Start front pages<br><br>
: cd application/front_end<br>
: npm run serve <br><br>

5. Make wallet instances<br><br>
: cd application/enrollAdmin<br>
: ./power.sh <br><br>


# Webpage UI

* Login Page<br>

![version4](./images/loginPage.png) <br><br>

* Input datas about seeds<br>

![version4](./images/pages.png) <br><br>

* Show tracking datas about seeds<br>

![version4](./images/tracking.png) <br><br>
