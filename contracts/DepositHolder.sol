pragma solidity ^0.4.13;

import './interfaces/DepositHolderI.sol';
import './Owned.sol';


contract DepositHolder is Owned, DepositHolderI {
    uint depositValue;

    function setDeposit(uint depositWeis)
        public
        fromOwner
        returns(bool success) {
            require(depositWeis != 0);
            require(depositWeis != depositValue);
            depositValue = depositWeis;
            LogDepositSet(msg.sender, depositWeis);
            return true;
    }

    function getDeposit()
        constant
        public
        returns(uint weis) {
            return depositValue;
    }

    function DepositHolder(uint initialDepositValue) {
        require(initialDepositValue != 0);
        depositValue = initialDepositValue;
    }
}
