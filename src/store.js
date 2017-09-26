import {observable} from 'mobx';
import getWeb3 from './utils/getWeb3'


class ProjectStore {
  @observable test = 'test';
  @observable operator;
  @observable operatorAddress;
  @observable operators = [];
  @observable operatorAddress;
  @observable accounts = [];
  @observable regulator;
  @observable drivingHistory = [];
  @observable vehicle;
  @observable oldVehicle = {};
  @observable vehicleBalance;
  @observable regulatorAddress;
  @observable tollbooths = [];
  @observable currentTollbooth;
  @observable currentOperator = {address: null, deposit: null};
  @observable defaultGas = 3000000;
  @observable currentTollboothOperator;
  @observable exitMapping = {};
  @observable web3 = getWeb3.then(results => results.web3)
                            .catch(_ => console.log('Error finding web3.'))
}

const projectStore = new ProjectStore();

export default projectStore;
