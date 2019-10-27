import v4 from 'uuid/v4';
import { LOCALSTORAGE } from './services/localstorage';

export default class Model {
  constructor(items = []) {
    this.items = items;
    this.selectedItemId = null;
    this.filteredItems = [];
  }

  filterItems(formaState) {
    const isFomaStateEmpty = Object.values(formaState).every(el => el === '');
    if (isFomaStateEmpty) {
      this.filteredItems = this.items;
    }
    if (formaState.inputValue !== '') {
      this.filteredItems = this.filteredItems.filter(item =>
        item.title.toLowerCase().includes(formaState.inputValue.toLowerCase()),
      );
    }
    if (
      formaState.selectDoneValue !== '' &&
      formaState.selectDoneValue !== 'all'
    ) {
      this.filteredItems = this.filteredItems.filter(
        item => item.done === formaState.selectDoneValue,
      );
    }

    if (
      formaState.selectPriorityValue !== '' &&
      formaState.selectPriorityValue !== 'all'
    ) {
      this.filteredItems = this.filteredItems.filter(
        item => item.priority === formaState.selectPriorityValue,
      );
    }
  }

  getItemsFromLS() {
    this.items = LOCALSTORAGE.get('items') || [];
    this.filteredItems = this.items;
  }

  findItem(id) {
    return this.items.find(item => item.id === id);
  }

  setSelectedItemId(id) {
    this.selectedItemId = id;
  }

  getSelectedItemId() {
    return this.selectedItemId;
  }

  addItem({ title, text, priority, done }) {
    const item = {
      id: v4(),
      text,
      title,
      priority,
      done,
    };
    this.items.push(item);
    return item;
  }

  // updateItem(id, { title, text, priority }) {
  // this.items.forEach(item => {
  //   if (item.id === id) {
  //     item.text = text;
  //     item.title = title;
  //     item.priority = priority;
  //     item.done;
  //   }
  // });
  // }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
  }

  // updateDoneStatus(id) {
  //   this.items.forEach(item => {
  //     if (item.id === id) {
  //       item.done === 'open' ? (item.done = 'done') : (item.done = 'open');
  //     }
  //   });
  // }
}
