pragma solidity ^0.4.13;

import './interfaces/TollBoothHolderI.sol';
import './Owned.sol';

contract TollBoothHolder is TollBoothHolderI, Owned {
    mapping(address => bool) tollBoothRecords;

    function addTollBooth(address tollBooth)
        public
        returns(bool success) {
            tollBoothRecords[tollBooth] = true;
            LogTollBoothAdded(msg.sender, tollBooth);
            return true;
    }

    function isTollBooth(address tollBooth)
        constant
        public
        returns(bool isIndeed) {
            return tollBoothRecords[tollBooth];
    }

    function removeTollBooth(address tollBooth)
        public
        returns(bool success) {
            tollBoothRecords[tollBooth] = false;
            return true;
    }

    function TollBoothHolder() {}
}
