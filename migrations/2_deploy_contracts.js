var Regulator = artifacts.require("./Regulator.sol");
var TollBoothOperator = artifacts.require("./TollBoothOperator.sol");


module.exports = function(deployer, network, accounts) {
  deployer.then(function() {
    return Regulator.new({from: accounts[0]});
  }).then(function(instance) {
      return instance.createNewOperator(accounts[1], 1);
    }).then(function(tx) {
      const newOperator = tx.logs[1].args.newOperator;
      operator = TollBoothOperator.at(newOperator);
      return operator;
    }).then(() => {
      return operator.setPaused(false, {from: accounts[1]});
    })
};
