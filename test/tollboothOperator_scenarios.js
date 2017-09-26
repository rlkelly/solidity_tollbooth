const expectedExceptionPromise = require("../utils/expectedException.js");
web3.eth.getTransactionReceiptMined = require("../utils/getTransactionReceiptMined.js");
Promise = require("bluebird");
Promise.allNamed = require("../utils/sequentialPromiseNamed.js");
const randomIntIn = require("../utils/randomIntIn.js");
const toBytes32 = require("../utils/toBytes32.js");

if (typeof web3.eth.getAccountsPromise === "undefined") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

const Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");

contract('TollBoothOperator', function(accounts) {

    let owner0, owner1,
        booth0, booth1, booth2, booth3,
        vehicle0, vehicle1,
        regulator, operator,
        vehicle0InitBal;
    const price01 = randomIntIn(1, 1000);
    const deposit0 = price01 + randomIntIn(1, 1000);
    const deposit1 = deposit0 + randomIntIn(1, 1000);
    const vehicleType0 = randomIntIn(1, 1000);
    const vehicleType1 = vehicleType0 + randomIntIn(1, 1000);
    const multiplier0 = randomIntIn(1, 1000);
    const multiplier1 = multiplier0 + randomIntIn(1, 1000);
    const tmpSecret = randomIntIn(1, 1000);
    const secret0 = toBytes32(tmpSecret);
    const secret1 = toBytes32(tmpSecret + randomIntIn(1, 1000));
    let hashed0, hashed1;

    before("should prepare", function() {
        assert.isAtLeast(accounts.length, 8);
        owner0 = accounts[0];
        owner1 = accounts[1];
        booth0 = accounts[2];
        booth1 = accounts[3];
        booth2 = accounts[4];
        booth3 = accounts[5];
        vehicle0 = accounts[6];
        vehicle1 = accounts[7];
        return web3.eth.getBalancePromise(owner0)
            .then(balance => assert.isAtLeast(web3.fromWei(balance).toNumber(), 10))
            .then(_ => web3.eth.getBalancePromise(vehicle0))
            .then(balance => vehicle0InitBal = balance);
    });

    describe("Vehicle Operations", function() {

        beforeEach("should deploy regulator and operator", function() {
            return Regulator.new({ from: owner0 })
                .then(instance => regulator = instance)
                .then(() => regulator.setVehicleType(vehicle0, vehicleType0, { from: owner0 }))
                .then(tx => regulator.setVehicleType(vehicle1, vehicleType1, { from: owner0 }))
                .then(tx => regulator.createNewOperator(owner1, deposit0, { from: owner0 }))
                .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
                .then(() => operator.addTollBooth(booth0, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth3, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType0, multiplier0, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType1, multiplier1, { from: owner1 }))
                .then(tx => operator.setRoutePrice(booth0, booth1, price01, { from: owner1 }))
                .then(tx => operator.setPaused(false, { from: owner1 }))
                .then(tx => operator.hashSecret(secret0))
                .then(hash => hashed0 = hash)
                .then(tx => operator.hashSecret(secret1))
                .then(hash => hashed1 = hash);
        });

        describe("road scenarios", function() {

            it("should pass Scenario 1", function() {
                return operator.setRoutePrice(booth0, booth2, deposit0 + 5, { from: owner1 })
                    .then(_ => {
                      return operator.enterRoad(
                        booth0, hashed0, { from: vehicle0, value: ((deposit0 + 5) * multiplier0) })
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logEntered = tx.logs[0];
                        assert.strictEqual(logEntered.event, "LogRoadEntered");
                        assert.strictEqual(logEntered.args.vehicle, vehicle0);
                        assert.strictEqual(logEntered.args.entryBooth, booth0);
                        assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 + 5) * multiplier0);
                        // console.log(tx.receipt.gasUsed);
                        return operator.getVehicleEntry(hashed0);
                    })
                    .then(info => {
                        assert.strictEqual(info[0], vehicle0);
                        assert.strictEqual(info[1], booth0);
                        assert.strictEqual(info[2].toNumber(), (deposit0 + 5) * multiplier0);
                        return web3.eth.getBalancePromise(operator.address);
                    })
                    .then(balance => assert.strictEqual(balance.toNumber(), (deposit0 + 5) * multiplier0))
                    .then(() => operator.reportExitRoad(secret0, { from: booth2 }))
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logExited = tx.logs[0];
                        assert.strictEqual(logExited.event, "LogRoadExited");
                        assert.strictEqual(logExited.args.exitBooth, booth2);
                        assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logExited.args.finalFee.toNumber(), (deposit0 + 5) * multiplier0);
                        assert.strictEqual(logExited.args.refundWeis.toNumber(), 0);
                        return Promise.allNamed({
                            hashed0: () => operator.getVehicleEntry(hashed0),
                            pendingCount: () => operator.getPendingPaymentCount(booth0, booth2)
                        });
                    })
                    .then(info => {
                        assert.strictEqual(info.hashed0[0], vehicle0);
                        assert.strictEqual(info.hashed0[1], booth0);
                        assert.strictEqual(info.hashed0[2].toNumber(), 0);
                        assert.strictEqual(info.pendingCount.toNumber(), 0);
                        return Promise.allNamed({
                            vehicle0: () => web3.eth.getBalance(vehicle0)
                        });
                    })
            });

            it("should pass Scenario 2", function() {
                return operator.enterRoad.call(
                        booth0, hashed0, { from: vehicle0, value: ((deposit0 + 6) * multiplier0)})
                    .then(success => {
                      return assert.isTrue(success)
                    })
                    .then(() => {
                      return operator.setRoutePrice(booth0, booth2, deposit0 + 10, { from: owner1 })
                    })
                    .then(() => {
                      return operator.enterRoad(
                        booth0, hashed0, { from: vehicle0, value: ((deposit0 + 6) * multiplier0) })
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logEntered = tx.logs[0];
                        assert.strictEqual(logEntered.event, "LogRoadEntered");
                        assert.strictEqual(logEntered.args.vehicle, vehicle0);
                        assert.strictEqual(logEntered.args.entryBooth, booth0);
                        assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 + 6) * multiplier0);
                        // console.log(tx.receipt.gasUsed);
                        return operator.getVehicleEntry(hashed0);
                    })
                    .then(info => {
                        assert.strictEqual(info[0], vehicle0);
                        assert.strictEqual(info[1], booth0);
                        assert.strictEqual(info[2].toNumber(), (deposit0 + 6) * multiplier0);
                        return web3.eth.getBalancePromise(operator.address);
                    })
                    .then(balance => assert.strictEqual(balance.toNumber(), (deposit0 + 6) * multiplier0))
                    .then(() => operator.reportExitRoad(secret0, { from: booth2 }))
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logExited = tx.logs[0];
                        assert.strictEqual(logExited.event, "LogRoadExited");
                        assert.strictEqual(logExited.args.exitBooth, booth2);
                        assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logExited.args.finalFee.toNumber(), (deposit0 + 6) * multiplier0);
                        assert.strictEqual(logExited.args.refundWeis.toNumber(), 0);
                        return Promise.allNamed({
                            hashed0: () => operator.getVehicleEntry(hashed0),
                            pendingCount: () => operator.getPendingPaymentCount(booth0, booth2)
                        });
                    })
                    .then(info => {
                        assert.strictEqual(info.hashed0[0], vehicle0);
                        assert.strictEqual(info.hashed0[1], booth0);
                        assert.strictEqual(info.hashed0[2].toNumber(), 0);
                        assert.strictEqual(info.pendingCount.toNumber(), 0);
                        return Promise.allNamed({
                            vehicle0: () => web3.eth.getBalance(vehicle0)
                        });
                    })
            });

            it("should pass Scenario 3", function() {
                return operator.enterRoad.call(
                        booth0, hashed0, { from: vehicle0, value: (deposit0 * multiplier0)})
                    .then(success => {
                      return assert.isTrue(success)
                    })
                    .then(() => {
                      return operator.enterRoad(
                        booth0, hashed0, { from: vehicle0, value: (deposit0 * multiplier0) })
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logEntered = tx.logs[0];
                        assert.strictEqual(logEntered.event, "LogRoadEntered");
                        assert.strictEqual(logEntered.args.vehicle, vehicle0);
                        assert.strictEqual(logEntered.args.entryBooth, booth0);
                        assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 * multiplier0));
                        // console.log(tx.receipt.gasUsed);
                        return operator.getVehicleEntry(hashed0);
                    })
                    .then(info => {
                        assert.strictEqual(info[0], vehicle0);
                        assert.strictEqual(info[1], booth0);
                        assert.strictEqual(info[2].toNumber(), (deposit0 * multiplier0));
                        return web3.eth.getBalancePromise(operator.address);
                    })
                    .then(balance => assert.strictEqual(balance.toNumber(), deposit0 * multiplier0))
                    .then(() => {
                      return operator.setRoutePrice(booth0, booth2, deposit0 - 10, { from: owner1 })
                    })
                    .then(() => operator.reportExitRoad(secret0, { from: booth2 }))
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logExited = tx.logs[0];
                        assert.strictEqual(logExited.event, "LogRoadExited");
                        assert.strictEqual(logExited.args.exitBooth, booth2);
                        assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logExited.args.finalFee.toNumber(), (deposit0 - 10) * multiplier0);
                        assert.strictEqual(logExited.args.refundWeis.toNumber(), 10 * multiplier0);
                        return Promise.allNamed({
                            hashed0: () => operator.getVehicleEntry(hashed0),
                            pendingCount: () => operator.getPendingPaymentCount(booth0, booth2)
                        });
                    })
                    .then(info => {
                        assert.strictEqual(info.hashed0[0], vehicle0);
                        assert.strictEqual(info.hashed0[1], booth0);
                        assert.strictEqual(info.hashed0[2].toNumber(), 0);
                        assert.strictEqual(info.pendingCount.toNumber(), 0);
                        return Promise.allNamed({
                            vehicle0: () => web3.eth.getBalance(vehicle0)
                        });

                 });

            });

            it("should pass Scenario 4", function() {
                return operator.enterRoad.call(
                        booth0, hashed0, { from: vehicle0, value: (deposit0 * multiplier0 * 3)})
                    .then(success => {
                      return assert.isTrue(success)
                    })
                    .then(() => {
                      return operator.enterRoad(
                        booth0, hashed0, { from: vehicle0, value: (deposit0 * multiplier0 * 3) })
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logEntered = tx.logs[0];
                        assert.strictEqual(logEntered.event, "LogRoadEntered");
                        assert.strictEqual(logEntered.args.vehicle, vehicle0);
                        assert.strictEqual(logEntered.args.entryBooth, booth0);
                        assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 * multiplier0 * 3));
                        // console.log(tx.receipt.gasUsed);
                        return operator.getVehicleEntry(hashed0);
                    })
                    .then(info => {
                        assert.strictEqual(info[0], vehicle0);
                        assert.strictEqual(info[1], booth0);
                        assert.strictEqual(info[2].toNumber(), (deposit0 * multiplier0 * 3));
                        return web3.eth.getBalancePromise(operator.address);
                    })
                    .then(balance => assert.strictEqual(balance.toNumber(), deposit0 * multiplier0 * 3))
                    .then(() => {
                      return operator.setRoutePrice(booth0, booth2, deposit0, { from: owner1 })
                    })
                    .then(() => operator.reportExitRoad(secret0, { from: booth2 }))
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logExited = tx.logs[0];
                        assert.strictEqual(logExited.event, "LogRoadExited");
                        assert.strictEqual(logExited.args.exitBooth, booth2);
                        assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logExited.args.finalFee.toNumber(), deposit0 * multiplier0);
                        assert.strictEqual(logExited.args.refundWeis.toNumber(), deposit0 * multiplier0 * 2);
                        return Promise.allNamed({
                            hashed0: () => operator.getVehicleEntry(hashed0),
                            pendingCount: () => operator.getPendingPaymentCount(booth0, booth2)
                        });
                    })
                    .then(info => {
                        assert.strictEqual(info.hashed0[0], vehicle0);
                        assert.strictEqual(info.hashed0[1], booth0);
                        assert.strictEqual(info.hashed0[2].toNumber(), 0);
                        assert.strictEqual(info.pendingCount.toNumber(), 0);
                        return Promise.allNamed({
                            vehicle0: () => web3.eth.getBalance(vehicle0)
                        });

                 });

            });

            it("should pass Scenario 5", function() {
                return operator.enterRoad.call(
                        booth0, hashed0, { from: vehicle0, value: ((deposit0 + 5) * multiplier0)})
                    .then(success => {
                      return assert.isTrue(success)
                    })
                    .then(() => {
                      return operator.enterRoad(
                        booth0, hashed0, { from: vehicle0, value: ((deposit0 + 5) * multiplier0) })
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logEntered = tx.logs[0];
                        assert.strictEqual(logEntered.event, "LogRoadEntered");
                        assert.strictEqual(logEntered.args.vehicle, vehicle0);
                        assert.strictEqual(logEntered.args.entryBooth, booth0);
                        assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logEntered.args.depositedWeis.toNumber(), ((deposit0 + 5) * multiplier0));
                        // console.log(tx.receipt.gasUsed);
                        return operator.getVehicleEntry(hashed0);
                    })
                    .then(info => {
                        assert.strictEqual(info[0], vehicle0);
                        assert.strictEqual(info[1], booth0);
                        assert.strictEqual(info[2].toNumber(), ((deposit0 + 5) * multiplier0 ));
                        return web3.eth.getBalancePromise(operator.address);
                    })
                    .then(balance => assert.strictEqual(balance.toNumber(), (deposit0 + 5) * multiplier0))
                    .then(() => operator.reportExitRoad(secret0, { from: booth3 }))
                    .then(() => {
                      return operator.setRoutePrice(booth0, booth3, deposit0 + 2, { from: owner1 })
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 2);
                        assert.strictEqual(tx.logs.length, 2);
                        const logExited = tx.logs[1];
                        assert.strictEqual(logExited.event, "LogRoadExited");
                        assert.strictEqual(logExited.args.exitBooth, booth3);
                        assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logExited.args.finalFee.toNumber(), (deposit0 + 2) * multiplier0);
                        assert.strictEqual(logExited.args.refundWeis.toNumber(), 3 * multiplier0);
                        return Promise.allNamed({
                            hashed0: () => operator.getVehicleEntry(hashed0),
                            pendingCount: () => operator.getPendingPaymentCount(booth0, booth2)
                        });
                    })
                    .then(info => {
                        assert.strictEqual(info.hashed0[0], vehicle0);
                        assert.strictEqual(info.hashed0[1], booth0);
                        assert.strictEqual(info.hashed0[2].toNumber(), 0);
                        assert.strictEqual(info.pendingCount.toNumber(), 0);
                        return Promise.allNamed({
                            vehicle0: () => web3.eth.getBalance(vehicle0)
                        });

                 });

            });

            it("should pass Scenario 6", function() {
                return operator.enterRoad.call(
                        booth0, hashed0, { from: vehicle0, value: ((deposit0 + 5) * multiplier0)})
                    .then(success => {
                      return assert.isTrue(success)
                    })
                    .then(() => {
                      return operator.enterRoad(
                        booth0, hashed0, { from: vehicle0, value: ((deposit0 + 5) * multiplier0) })
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logEntered = tx.logs[0];
                        assert.strictEqual(logEntered.event, "LogRoadEntered");
                        assert.strictEqual(logEntered.args.vehicle, vehicle0);
                        assert.strictEqual(logEntered.args.entryBooth, booth0);
                        assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logEntered.args.depositedWeis.toNumber(), ((deposit0 + 5) * multiplier0));
                        // console.log(tx.receipt.gasUsed);
                        return operator.getVehicleEntry(hashed0);
                    })
                    .then(info => {
                        assert.strictEqual(info[0], vehicle0);
                        assert.strictEqual(info[1], booth0);
                        assert.strictEqual(info[2].toNumber(), ((deposit0 + 5) * multiplier0 ));
                        return web3.eth.getBalancePromise(operator.address);
                    })
                    .then(balance => assert.strictEqual(balance.toNumber(), (deposit0 + 5) * multiplier0))
                    .then(() => operator.reportExitRoad(secret0, { from: booth3 }))
                    .then(() => {
                      return operator.enterRoad(
                        booth0, hashed1, { from: vehicle1, value: ((deposit0) * multiplier1) })
                    })
                    .then(() => operator.reportExitRoad(secret1, { from: booth3 }))
                    .then(() => {
                      return operator.setRoutePrice(booth0, booth3, deposit0 - 2, { from: owner1 })
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 2);
                        assert.strictEqual(tx.logs.length, 2);
                        const logExited = tx.logs[1];
                        assert.strictEqual(logExited.event, "LogRoadExited");
                        assert.strictEqual(logExited.args.exitBooth, booth3);
                        assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
                        assert.strictEqual(logExited.args.finalFee.toNumber(), (deposit0 - 2) * multiplier0);
                        assert.strictEqual(logExited.args.refundWeis.toNumber(), 7 * multiplier0);
                        return Promise.allNamed({
                            hashed0: () => operator.getVehicleEntry(hashed0),
                            pendingCount: () => operator.getPendingPaymentCount(booth0, booth3)
                        })
                        .then(info => {
                            assert.strictEqual(info.hashed0[0], vehicle0);
                            assert.strictEqual(info.hashed0[1], booth0);
                            assert.strictEqual(info.hashed0[2].toNumber(), 0);
                            assert.strictEqual(info.pendingCount.toNumber(), 1);
                        })
                        .then(() => {
                          return operator.clearSomePendingPayments(booth0, booth3, 1);
                        })
                        .then(tx => {
                            assert.strictEqual(tx.receipt.logs.length, 1);
                            assert.strictEqual(tx.logs.length, 1);
                            const logExited = tx.logs[0];
                            assert.strictEqual(logExited.event, "LogRoadExited");
                            assert.strictEqual(logExited.args.exitBooth, booth3);
                            assert.strictEqual(logExited.args.exitSecretHashed, hashed1);
                            assert.strictEqual(logExited.args.finalFee.toNumber(), (deposit0 - 2) * multiplier1);
                            assert.strictEqual(logExited.args.refundWeis.toNumber(), 2 * multiplier1);
                            return Promise.allNamed({
                                hashed1: () => operator.getVehicleEntry(hashed1),
                                pendingCount: () => operator.getPendingPaymentCount(booth0, booth3)
                            })
                            .then(info => {
                                assert.strictEqual(info.hashed1[0], vehicle1);
                                assert.strictEqual(info.hashed1[1], booth0);
                                assert.strictEqual(info.hashed1[2].toNumber(), 0);
                                assert.strictEqual(info.pendingCount.toNumber(), 0);
                            })

                      });

                  });

            });

        });

    });

});
