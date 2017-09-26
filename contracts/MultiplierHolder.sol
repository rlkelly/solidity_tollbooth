pragma solidity ^0.4.13;

import './Owned.sol';
import './interfaces/MultiplierHolderI.sol';


contract MultiplierHolder is Owned, MultiplierHolderI {
    mapping(uint => uint) vehicleMultiplier;

    function setMultiplier(
            uint vehicleType,
            uint multiplier)
        public
        fromOwner
        returns(bool success) {
            require(vehicleType != 0);
            require(vehicleMultiplier[vehicleType] != multiplier);
            vehicleMultiplier[vehicleType] = multiplier;
            LogMultiplierSet(msg.sender, vehicleType, multiplier);
            return true;
    }

    function getMultiplier(uint vehicleType)
        constant
        public
        returns(uint multiplier) {
            return vehicleMultiplier[vehicleType];
    }

    function MultiplierHolder() {}
}
