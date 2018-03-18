pragma solidity ^0.4.13;

import './interfaces/RegulatorI.sol';
import './Owned.sol';
import './TollBoothOperator.sol';
import './interfaces/TollBoothOperatorI.sol';


contract Regulator is RegulatorI, Owned {
    address[] approvedOperators;
    mapping(address => bool) approvedOperatorsMapping;
    mapping(address => uint) vehicleRegistry;

    function setVehicleType(address vehicle, uint vehicleType)
        public
        fromOwner
        returns(bool success) {
          require(vehicleRegistry[vehicle] != vehicleType);
          require(vehicle != 0x0);
          vehicleRegistry[vehicle] = vehicleType;
          LogVehicleTypeSet(msg.sender, vehicle, vehicleType);
          return true;
    }

    function getVehicleType(address vehicle)
      constant
      public
      returns(uint vehicleType) {
          return vehicleRegistry[vehicle];
    }

    function createNewOperator(
            address owner,
            uint deposit)
        public
        fromOwner
        returns(TollBoothOperatorI newOperator) {
            require(owner != getOwner());
            TollBoothOperator myOperator = new TollBoothOperator(false, deposit, this);
            approvedOperators.push(myOperator);
            approvedOperatorsMapping[myOperator] = true;
            myOperator.setOwner(owner);
            LogTollBoothOperatorCreated(msg.sender, myOperator, owner, deposit);
            return myOperator;
    }

    function removeOperator(address operator)
        public
        fromOwner
        returns(bool success) {
            require(approvedOperatorsMapping[operator]);
            delete approvedOperatorsMapping[operator];
            for (uint i = 0; i < approvedOperators.length; i++) {
                if (approvedOperators[i] == operator) {
                    approvedOperators[i] = approvedOperators[approvedOperators.length - 1];
                    approvedOperators.length--;
                    break;
                }
            }
            LogTollBoothOperatorRemoved(msg.sender, operator);
            return true;
    }

    function isOperator(address operator)
        constant
        public
        returns(bool indeed) {
            return approvedOperatorsMapping[operator];
    }

    function getOperators() public constant returns(address[]) {
      return approvedOperators;
    }

    function Regulator() {}
}
