pragma solidity ^0.4.13;

import './interfaces/RegulatedI.sol';
import './interfaces/RegulatorI.sol';


contract Regulated is RegulatedI {
    address contractRegulator;

    function setRegulator(address newRegulator)
        public
        returns(bool success) {
            require(msg.sender == contractRegulator);
            require(newRegulator != 0x0);
            require(newRegulator != contractRegulator);
            LogRegulatorSet(contractRegulator, newRegulator);
            contractRegulator = newRegulator;
            return true;
    }

    function getRegulator()
        constant
        public
        returns(RegulatorI regulator) {
            return RegulatorI(contractRegulator);
    }

    function Regulated(address newRegulator) {
        require(newRegulator != 0x0);
        contractRegulator = newRegulator;
    }
}
