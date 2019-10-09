#chaincode insall
docker exec cli peer chaincode install -n sacc -v 1.7 -p github.com/sacc
docker exec cli2 peer chaincode install -n sacc -v 1.7 -p github.com/sacc
docker exec cli3 peer chaincode install -n sacc -v 1.7 -p github.com/sacc
docker exec cli4 peer chaincode install -n sacc -v 1.7 -p github.com/sacc

#chaincode instatiate
docker exec cli peer chaincode instantiate -n sacc -v 1.7 -C mychannel -c '{"Args":["0","100"]}' -P 'OR ("Org2MSP.member", "Org1MSP.member","Org3MSP.member","Org4MSP.member")'
sleep 10
# docker exec cli2 peer chaincode instantiate -n sacc -v 1.2 -C mychannel -c '{"Args":["a","100"]}' -P 'OR ("Org2MSP.member", "Org1MSP.member","Org3MSP.member")'
# docker exec cli3 peer chaincode instantiate -n sacc -v 1.2 -C mychannel -c '{"Args":["a","100"]}' -P 'OR ("Org2MSP.member", "Org1MSP.member","Org3MSP.member")'

# #chaincode query a
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["get","a"]}'
# #chaincode invoke b
# docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["set","b","200"]}'
# docker exec cli2 peer chaincode invoke -n sacc -C mychannel -c '{"Args":["set","c","200"]}'
# docker exec cli3 peer chaincode invoke -n sacc -C mychannel -c '{"Args":["set","d","200"]}'

# sleep 5
#chaincode query b
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["get","b"]}'

echo '-------------------------------------END-------------------------------------'
