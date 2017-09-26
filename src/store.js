import {observable} from 'mobx';

class ProjectStore {
  @observable test = 'test';
}

const projectStore = new ProjectStore();

export default projectStore;
