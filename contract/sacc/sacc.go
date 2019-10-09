/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

//
type SimpleAsset struct {
}

// 원두 구조체
type Data struct {
	Key      string `json:"key"` // 상품 ID
	Value11  string `json:"v11"` // 유통업체 날짜등록
	Value12  string `json:"v12"` // 유통업체 품종
	Value13  string `json:"v13"` // 유통업체 산지
	Value14  string `json:"v14"` // 유통업체 수확일
	Value15  string `json:"v15"` // 유통업체 수량
	Value16  string `json:"v16"` // 유통업체 생두 둥급
	Value18  string `json:"v17"` // 유통업체 재배 고도
	Value100 string `json:"v18"` // 유통업체 배송 목적지 등록

	Value177 string `json:"v19"` // 유통업체 출고 날짜 등록
	//
	//////////////////////////////////////////////////////////////////////////////// 수입업자
	Value19 string `json:"v20"` // 창고관리자 원두 도착 날짜 등록
	Value20 string `json:"v21"` // 창고관리자 온도
	Value21 string `json:"v22"` // 창고관리자 습도

	Value222 string `json:"v23"` // 창고관리자 출고 날짜 등록
	Value101 string `json:"v24"` // 창고관리자 배송지 등록

	Value23 string `json:"v25"` // 카페 관리자, 원두 도착 날짜 등록

	// 출발할 주소 추가 ex) 땡떙 커피 1호점, 2호점 등
	//////////////////////////////////////////////////////////////////////////////// 창고관리자

	Value25 string `json:"v26"` // 카페 관리자 (로스팅)로스팅 시간
	Value26 string `json:"v27"` // 카페 관리자  로스팅 단계 등록

	Value201 string `json:"v28"` // 로스팅 맛1
	Value202 string `json:"v29"` // 로스팅 맛2
	Value203 string `json:"v30"` // 로스팅 맛3
	Value204 string `json:"v31"` // 로스팅 맛4
	Value205 string `json:"v32"` // 로스팅 맛5
	Value206 string `json:"v33"` // 로스팅 맛6
	Value207 string `json:"v34"` // 로스팅 맛7
	Value208 string `json:"v35"` // 로스팅 맛8

	Value40  string `json:"v36"` // 상품 출발 날짜 등록
	Value102 string `json:"v37"` // 날짜 등록 (정기배송센터)
	//////////////////////////////////////////////////////////////////////////////// 카페 관리자

	Value27 string `json:"v38"` // 날짜 등록 (정기배송센터)
	Value28 string `json:"v39"` // 날짜 등록 (정기배송센터 상품 패키징.)
	Value29 string `json:"v40"` // 날짜 등록 (정기배송센터)
}

// 회원 아이디 구조체.

type OrganUser struct {
	Key         string `json:"key"`         // 유저 고유 ID 값
	ID          string `json:"id"`          // 유저 ID
	Password    string `json:"password"`    // 유저 ID
	UserName    string `json:"username"`    // 유저 Name
	PhoneNumber string `json:"phonenumber"` // 유저 번호
	UserJob     string `json:"userjob"`     // 유저 직책 : (운송, 창고관리자, 커피집)
	Email       string `json:"email"`
}

//
func (t *SimpleAsset) Init(stub shim.ChaincodeStubInterface) peer.Response {

	return shim.Success(nil)
}

//

func (t *SimpleAsset) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	// Extract the function and args from the transaction proposal
	fn, args := stub.GetFunctionAndParameters()

	var result string
	var err error
	if fn == "enroll_seedByImporter" {
		result, err = enroll_seedByImporter(stub, args)
	} else if fn == "addUser" {
		result, err = addUser(stub, args)
	} else if fn == "enroll_seedByContainer" {
		result, err = enroll_seedByContainer(stub, args)
	} else if fn == "enroll_seedByCoffee" {
		result, err = enroll_seedByCoffee(stub, args)
	} else if fn == "setarr_timeByService" {
		result, err = setarr_timeByService(stub, args)
	} else if fn == "set_timeByService2" {
		result, err = set_timeByService2(stub, args)
	} else if fn == "set_timeByService" {
		result, err = set_timeByService(stub, args)
	} else if fn == "set_timeByCoffee" {
		result, err = set_timeByCoffee(stub, args)
	} else if fn == "setarr_timeByCoffee" {
		result, err = setarr_timeByCoffee(stub, args)
	} else if fn == "set_timeByImporter" {
		result, err = set_timeByImporter(stub, args)
	} else if fn == "set_timeByContainer" {
		result, err = set_timeByContainer(stub, args)
	} else if fn == "get" {
		result, err = get(stub, args)
	} else if fn == "getAllKeys" {
		result, err = getAllKeys(stub)
	} else if fn == "readAllUser" {
		result, err = readAllUser(stub)
	} else {
		return shim.Error("Not supported chaincode function.")
	}

	if err != nil {
		return shim.Error(err.Error())
	}

	// Return the result as success payload
	return shim.Success([]byte(result))
}

// 회원정보 보기
func readAllUser(stub shim.ChaincodeStubInterface) (string, error) {

	iter, err := stub.GetStateByRange("1", "100")
	if err != nil {
		return "", fmt.Errorf("Failed to get all keys with error: %s", err)
	}
	defer iter.Close()

	var buffer string
	buffer = "["

	comma := false
	for iter.HasNext() {
		res, err := iter.Next()
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		if comma == true {
			buffer += ","
		}
		buffer += string(res.Value)

		comma = true
	}
	buffer += "]"

	fmt.Println(buffer)

	return string(buffer), nil
}

// 회원 등록
func addUser(stub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) != 7 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}
	var OrganUser = OrganUser{Key: args[0], ID: args[1], Password: args[2], UserName: args[3], PhoneNumber: args[4], UserJob: args[5], Email: args[6]}
	dataAsBytes, _ := json.Marshal(OrganUser)

	err := stub.PutState(args[0], dataAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", args[0])
	}
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := stub.SetEvent("addUser", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}
	return string(dataAsBytes), nil
}

// 운송업자 - 원두 등록
func enroll_seedByImporter(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 8 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	// JSON  변환
	var data = Data{Key: args[0], Value11: args[1], Value12: args[2], Value13: args[3], Value14: args[4], Value15: args[5], Value16: args[6], Value18: args[7]}
	dataAsBytes, _ := json.Marshal(data)

	err := stub.PutState(args[0], dataAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", args[0])
	}
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := stub.SetEvent("enroll_seedByImporter", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}

	return string(dataAsBytes), nil
}

// 운송업체 - 출발 날짜 등록
func set_timeByImporter(APIstub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) != 3 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	InfoAsBytes, _ := APIstub.GetState(args[0])
	data := Data{}

	json.Unmarshal(InfoAsBytes, &data)
	data.Value177 = args[1]
	data.Value100 = args[2]
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := APIstub.SetEvent("set_timeByImporter", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}
	InfoAsBytes, _ = json.Marshal(data)
	APIstub.PutState(args[0], InfoAsBytes)

	return string(InfoAsBytes), nil
}

// 창고관리자 - 원두 등록
func enroll_seedByContainer(APIstub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) != 4 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	InfoAsBytes, _ := APIstub.GetState(args[0])
	data := Data{}

	json.Unmarshal(InfoAsBytes, &data)
	data.Value19 = args[1]
	data.Value20 = args[2]
	data.Value21 = args[3]
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := APIstub.SetEvent("enroll_seedByContainer", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}
	InfoAsBytes, _ = json.Marshal(data)
	APIstub.PutState(args[0], InfoAsBytes)

	return string(InfoAsBytes), nil
}

// 창고관리자 - 원두 출고 날짜 등록
func set_timeByContainer(APIstub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) != 3 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	InfoAsBytes, _ := APIstub.GetState(args[0])
	data := Data{}

	json.Unmarshal(InfoAsBytes, &data)
	data.Value222 = args[1]
	data.Value101 = args[2]
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := APIstub.SetEvent("set_timeByContainer", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}

	InfoAsBytes, _ = json.Marshal(data)
	APIstub.PutState(args[0], InfoAsBytes)

	return string(InfoAsBytes), nil
}

// 로스팅 원두 등록
func enroll_seedByCoffee(APIstub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) != 11 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	InfoAsBytes, _ := APIstub.GetState(args[0])
	data := Data{}

	json.Unmarshal(InfoAsBytes, &data)
	data.Value25 = args[1]
	data.Value26 = args[2]

	data.Value201 = args[3]
	data.Value202 = args[4]
	data.Value203 = args[5]
	data.Value204 = args[6]
	data.Value205 = args[7]
	data.Value206 = args[8]
	data.Value207 = args[9]
	data.Value208 = args[10]
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := APIstub.SetEvent("enroll_seedByCoffee", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}

	InfoAsBytes, _ = json.Marshal(data)
	APIstub.PutState(args[0], InfoAsBytes)

	return string(InfoAsBytes), nil
}

// 로스팅 원두 출고 날짜 등록
func set_timeByCoffee(APIstub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) != 3 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	InfoAsBytes, _ := APIstub.GetState(args[0])
	data := Data{}

	json.Unmarshal(InfoAsBytes, &data)
	data.Value40 = args[1]
	data.Value102 = args[2]
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := APIstub.SetEvent("set_timeByCoffee", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}
	InfoAsBytes, _ = json.Marshal(data)
	APIstub.PutState(args[0], InfoAsBytes)

	return string(InfoAsBytes), nil
}

// 로스팅 원두 도착 날짜 등록
func setarr_timeByCoffee(APIstub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) != 2 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	InfoAsBytes, _ := APIstub.GetState(args[0])
	data := Data{}

	json.Unmarshal(InfoAsBytes, &data)
	data.Value23 = args[1]
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := APIstub.SetEvent("setarr_timeByCoffee", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}

	InfoAsBytes, _ = json.Marshal(data)
	APIstub.PutState(args[0], InfoAsBytes)

	return string(InfoAsBytes), nil
}

// 정기배송업체 원두 도착 날짜 등록
func setarr_timeByService(APIstub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) != 2 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	InfoAsBytes, _ := APIstub.GetState(args[0])
	data := Data{}

	json.Unmarshal(InfoAsBytes, &data)
	data.Value27 = args[1]
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := APIstub.SetEvent("setarr_timeByService", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}

	InfoAsBytes, _ = json.Marshal(data)
	APIstub.PutState(args[0], InfoAsBytes)

	return string(InfoAsBytes), nil
}

// 정기배송업체 패키징 날짜 등록
func set_timeByService(APIstub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) != 2 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	InfoAsBytes, _ := APIstub.GetState(args[0])
	data := Data{}

	json.Unmarshal(InfoAsBytes, &data)
	data.Value28 = args[1]
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := APIstub.SetEvent("set_timeByService", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}

	InfoAsBytes, _ = json.Marshal(data)
	APIstub.PutState(args[0], InfoAsBytes)

	return string(InfoAsBytes), nil
}

func set_timeByService2(APIstub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) != 2 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	InfoAsBytes, _ := APIstub.GetState(args[0])
	data := Data{}

	json.Unmarshal(InfoAsBytes, &data)
	data.Value29 = args[1]
	eventPayload := ""
	payloadAsBytes := []byte(eventPayload)
	eventErr := APIstub.SetEvent("set_timeByService2", payloadAsBytes)
	if eventErr != nil {
		return "", fmt.Errorf("Event Errors")
	}
	InfoAsBytes, _ = json.Marshal(data)
	APIstub.PutState(args[0], InfoAsBytes)

	return string(InfoAsBytes), nil
}

// Get returns the value of the specified asset key
func get(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key")
	}

	value, err := stub.GetState(args[0])
	if err != nil {
		return "", fmt.Errorf("Failed to get asset: %s with error: %s", args[0], err)
	}
	if value == nil {
		return "", fmt.Errorf("Asset not found: %s", args[0])
	}

	return string(value), nil
}

// Get returns the value of the specified asset key
func getAllKeys(stub shim.ChaincodeStubInterface) (string, error) {

	iter, err := stub.GetStateByRange("100", "9999")
	if err != nil {
		return "", fmt.Errorf("Failed to get all keys with error: %s", err)
	}
	defer iter.Close()

	var buffer string
	buffer = "["

	comma := false
	for iter.HasNext() {
		res, err := iter.Next()
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		if comma == true {
			buffer += ","
		}
		buffer += string(res.Value)

		comma = true
	}
	buffer += "]"

	fmt.Println(buffer)

	return string(buffer), nil
}

// 카우치 DB 인덱스 독타입

// main function starts up the chaincode in the container during instantiate
func main() {
	if err := shim.Start(new(SimpleAsset)); err != nil {
		fmt.Printf("Error starting SimpleAsset chaincode: %s", err)
	}
}
