pragma solidity ^0.4.13;

import './interfaces/RoutePriceHolderI.sol';
import './Owned.sol';
import './TollBoothHolder.sol';


contract RoutePriceHolder is RoutePriceHolderI, TollBoothHolder {
    mapping(address => mapping(address => uint)) routePrices;
    mapping(address => mapping(address => bool)) routePriceSet;

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
            return true;
    }

    function getRoutePrice(
            address entryBooth,
            address exitBooth)
        constant
        public
        returns(uint priceWeis) {
            return routePrices[entryBooth][exitBooth];
    }

    function RoutePriceHolder() {}
}
