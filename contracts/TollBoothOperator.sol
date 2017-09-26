pragma solidity ^0.4.13;

import './Pausable.sol';
import './RoutePriceHolder.sol';
import './MultiplierHolder.sol';
import './TollBoothHolder.sol';
import './DepositHolder.sol';
import './Regulator.sol';
import './Regulated.sol';
import './interfaces/TollBoothOperatorI.sol';


contract TollBoothOperator is Pausable, Regulated, RoutePriceHolder, MultiplierHolder, DepositHolder, TollBoothOperatorI {
    uint feesCollected;
    mapping(bytes32 => VehicleData) currentRoutes;
    mapping(address => mapping(address => PaymentData[])) pendingPayments;
    mapping(address => mapping(address => uint)) currentCount;

    struct VehicleData {
        address vehicle;
        address entryBooth;
        uint depositedWeis;
    }

    struct PaymentData {
      address vehicle;
      uint depositedWeis;
      bytes32 hashedSecret;
    }

    modifier sentFromTollBooth() {
        require(isTollBooth(msg.sender));
        _;
    }

    function hashSecret(bytes32 secret)
        constant
        public
        returns(bytes32 hashed) {
            return keccak256(secret);
    }

    function enterRoad(
            address entryBooth,
            bytes32 exitSecretHashed)
        public
        whenNotPaused
        payable
        returns (bool success) {
            require(isTollBooth(entryBooth));
            uint currentVehicleType = getRegulator().getVehicleType(msg.sender);
            require(currentVehicleType != 0);
            require(msg.value >= getDeposit() * getMultiplier(currentVehicleType));
            LogRoadEntered(msg.sender, entryBooth, exitSecretHashed, msg.value);

            currentRoutes[exitSecretHashed] = VehicleData(msg.sender, entryBooth, msg.value);
            return true;
    }

    function getVehicleEntry(bytes32 exitSecretHashed)
        constant
        public
        returns(
            address vehicle,
            address entryBooth,
            uint depositedWeis) {
                VehicleData memory response = currentRoutes[exitSecretHashed];
                return (response.vehicle, response.entryBooth, response.depositedWeis);
    }

    function reportExitRoad(bytes32 exitSecretClear)
        public
        sentFromTollBooth
        whenNotPaused
        returns (uint status) {
            uint refund;
            bytes32 secret = hashSecret(exitSecretClear);
            VehicleData memory entryData = currentRoutes[secret];

            if (routePriceSet[entryData.entryBooth][msg.sender]) {
              status = 1;
              uint defaultCost = routePrices[entryData.entryBooth][msg.sender];
              uint vehicleCode = getRegulator().getVehicleType(entryData.vehicle);
              uint multiplier = getMultiplier(vehicleCode);

              uint totalCost = defaultCost * multiplier;

              if (totalCost < entryData.depositedWeis) {
                refund += entryData.depositedWeis - totalCost;
                entryData.vehicle.transfer(refund);
                // I would recommend logging failed refunds so they don't block the transaction and handle later
                // but this interferes with testing
              } else if (totalCost > entryData.depositedWeis) {
                totalCost = entryData.depositedWeis;
              }
              LogRoadExited(msg.sender, secret, totalCost, refund);
              currentRoutes[secret] = VehicleData(entryData.vehicle, entryData.entryBooth, 0);
              feesCollected += totalCost;
            } else {
              status = 2;
              LogPendingPayment(secret, entryData.entryBooth, msg.sender);
              pendingPayments[entryData.entryBooth][msg.sender].push(PaymentData(entryData.vehicle,
                                                                                 entryData.depositedWeis,
                                                                                 secret));
            }
    }

    function getPendingPaymentCount(address entryBooth, address exitBooth)
        constant
        public
        returns (uint count) {
            return pendingPayments[entryBooth][exitBooth].length - currentCount[entryBooth][exitBooth];
    }

    function clearSomePendingPayments(
            address entryBooth,
            address exitBooth,
            uint count)
        public
        whenNotPaused
        returns (bool success) {
            require(isTollBooth(entryBooth));
            require(isTollBooth(exitBooth));
            uint pendingCount = getPendingPaymentCount(entryBooth, exitBooth);
            if (count > pendingCount) {
              return false;
            }

            // what if a rider has too expensive a fallback so the refund always fails?
            uint defaultCost = routePrices[entryBooth][exitBooth];
            for (uint i = 0; i < count; i++) {
              uint rowCount = currentCount[entryBooth][exitBooth];
              PaymentData memory firstRider = pendingPayments[entryBooth][exitBooth][rowCount];
              uint vehicleCode = getRegulator().getVehicleType(firstRider.vehicle);
              uint multiplier = getMultiplier(vehicleCode);
              uint totalCost = defaultCost * multiplier;

              uint refund = 0;
              if (firstRider.depositedWeis > totalCost) {
                refund += firstRider.depositedWeis - totalCost;
                if (!firstRider.vehicle.send(refund)) {
                  // I would log this instead of throw
                  // failedRefund(lastRider.vehicle, refund); //
                }
              }
              LogRoadExited(exitBooth, firstRider.hashedSecret, totalCost, refund);
              feesCollected += totalCost;
              delete pendingPayments[entryBooth][exitBooth][rowCount];
              currentRoutes[firstRider.hashedSecret] = VehicleData(firstRider.vehicle, entryBooth, 0);
              currentCount[entryBooth][exitBooth] += 1;
            }
            return true;
    }

    function getCollectedFeesAmount()
        constant
        public
        returns(uint amount) {
            return feesCollected;
    }

    function withdrawCollectedFees()
        public
        fromOwner
        returns(bool success) {
            require(feesCollected > 0);
            require(owner.send(feesCollected));
            feesCollected = 0;
            return true;
    }

    function setRoutePrice(
            address entryBooth,
            address exitBooth,
            uint priceWeis)
        public
        fromOwner
        returns(bool success) {
            require(isTollBooth(entryBooth));
            require(isTollBooth(exitBooth));
            require(entryBooth != 0x0);
            require(entryBooth != exitBooth);
            require(exitBooth != 0x0);
            routePrices[entryBooth][exitBooth] = priceWeis;
            routePriceSet[entryBooth][exitBooth] = true;
            LogRoutePriceSet(msg.sender, entryBooth, exitBooth, priceWeis);

            uint pendingCount = getPendingPaymentCount(entryBooth, exitBooth);
            uint defaultCost = routePrices[entryBooth][exitBooth];

            if (pendingCount > 0) {
              uint rowCount = currentCount[entryBooth][exitBooth];
              PaymentData memory firstRider = pendingPayments[entryBooth][exitBooth][rowCount];
              uint vehicleCode = getRegulator().getVehicleType(firstRider.vehicle);
              uint multiplier = getMultiplier(vehicleCode);
              uint totalCost = defaultCost * multiplier;

              uint refund = 0;
              if (firstRider.depositedWeis > totalCost) {
                refund = firstRider.depositedWeis - totalCost;
                // I would log this instead of throw in case their fallback is gas heavy
                firstRider.vehicle.transfer(refund);
              }
              LogRoadExited(exitBooth, firstRider.hashedSecret, totalCost, refund);
              feesCollected += totalCost;
              firstRider.depositedWeis = 0;
              delete pendingPayments[entryBooth][exitBooth][rowCount];
              currentRoutes[firstRider.hashedSecret] = VehicleData(firstRider.vehicle, entryBooth, 0);
              currentCount[entryBooth][exitBooth] += 1;
            }
            return true;
    }

    function TollBoothOperator(bool pausedState, uint initialDepositValue, address initialRegulator)
        Pausable(pausedState)
        DepositHolder(initialDepositValue)
        Regulated(initialRegulator) {}
}
