pragma solidity ^0.4.13;

import './interfaces/OwnedI.sol';

contract Owned is OwnedI {
    address owner;

    modifier fromOwner {
      require(msg.sender == owner);
      _;
    }

    function setOwner(address newOwner)
        fromOwner
        returns(bool success) {
        require(newOwner != owner);
        require(newOwner != 0x0);
        LogOwnerSet(owner, newOwner);
        owner = newOwner;
        return true;
    }

    function getOwner() constant returns(address) {
        return owner;
    }

    function Owned() {
       owner = msg.sender;
    }
}
