pragma solidity ^0.4.13;

import './Owned.sol';
import './interfaces/PausableI.sol';


contract Pausable is Owned, PausableI {
    bool paused;
    address owner;

    modifier whenPaused {
        require(paused);
        _;
    }

    modifier whenNotPaused {
        require(!paused);
        _;
    }

    function setPaused(bool newState)
        fromOwner
        returns(bool) {
            paused = newState;
            return true;
    }

    function isPaused()
        constant
        returns(bool isIndeed) {
            isIndeed = paused;
    }

    function Pausable(bool pausedState) {
        paused = pausedState;
    }
}
