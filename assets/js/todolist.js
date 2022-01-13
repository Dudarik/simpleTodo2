let itemIconsArray = {
  0: 'far fa-edit',
  1: 'far fa-grin',
  2: 'fas fa-address-book',
  3: 'fas fa-archive',
  4: 'fas fa-glass-cheers',
  5: 'fas fa-cash-register',
  6: 'fas fa-paw',
  7: 'far fa-envelope',

  8: 'fab fa-connectdevelop',
  9: 'fas fa-bicycle',
  10: 'fas fa-bus',
  11: 'fas fa-car-side',
  12: 'fas fa-dragon',
  13: 'fas fa-child',
  14: 'fas fa-laptop',
  15: 'fab fa-accusoft',
}

let itemIconsColors = {
  0: 'icon-item__color-0',
  1: 'icon-item__color-1',
  2: 'icon-item__color-2',
  3: 'icon-item__color-3',
}

const STORE_ACCESS_RW = 'readwrite'
const STORE_ACCESS_R = 'readonly'

let defaultSettings = {
  dbCreated: false,
  outputTemplateID: '#tmpl_listOutput',
  outputID: '#listOutput',
  DB_NAME: 'todoListDB',
  DB_VERSION: 1,
  DB_STORE_NAME: 'todoListItems',
}

class ItemTodoList {
  constructor(itemText = '', itemIcon = 0, itemIconColor = 0) {

    let itemDateTime = Date.now()

    this.itemID = itemDateTime
    this.itemDateTime = itemDateTime
    this.itemText = itemText
    this.itemIcon = Number(itemIcon)
    this.itemIconColor = Number(itemIconColor)
    this.checkedItem = false
  }
}



class TodoList {

  constructor(settings) {

    if (localStorage.todoListSettings) {
      this.todoListSettings = this.loadSettingsFromLocalStorage()
    } else {
      this.todoListSettings = settings
      this.saveSettingsToLocalStorage()
    }

    if (!this.todoListSettings) {
      console.log(new Error('Ошибка загрузки настроек. Проверте localStorage, или defaultSettings'))
      return null
    }

    if (!this.todoListSettings.dbCreated) {
      this.createDB()
    }

    this.todoListInit()
  }

  todoListInit(){
    let output = document.querySelector(this.todoListSettings.outputID)
    console.log()

    output.addEventListener('click', event => {
      console.log(event.target.closest('li'))
      // switch (event.target.value) {
      //   case '':
          
      //     break;
      
      //   default:
      //     break;
      // }
    })
  }

  addTodoListItem(todoListItem){
    if (!(todoListItem instanceof ItemTodoList)) {
      console.log(new Error('Не правильный формат данных'))
    }

    if (!todoListItem.itemText){
      this.showInputError()
      return
    }

    this.todoListItems.push(todoListItem)
    this.saveToDB(todoListItem)
    this.renderList(this.todoListItems)
  }

  saveToDB(todoListItem) {
    
    let openRequest = indexedDB.open(this.todoListSettings.DB_NAME, this.todoListSettings.DB_VERSION)

    openRequest.onupgradeneeded = this.upgradeDB(openRequest)

    openRequest.onsuccess = event => {

      let db = event.target.result

      if (db) {

        let transaction = db.transaction(this.todoListSettings.DB_STORE_NAME, this.todoListSettings.STORE_ACCESS_RW)

        let objStore = transaction.objectStore(this.todoListSettings.DB_STORE_NAME)

        let request = objStore.put(todoListItem, todoListItem.itemID)

        request.onsuccess = event => {
          console.log('ok')
        }

        request.onerror = event => {
          console.log('что-то пошло не так')
        }


        transaction.onsuccess = event => {
          console.log('transaction OK')
        }

        transaction.onsuccess = event => {
          console.log('transaction NOT ok')
        }
      }
    }
    openRequest.onerror = event => {
      console.log('Ошибка открытия базы данных')
    }
  }

  upgradeDB(rq) {
    return () => {

      let db = rq.result
      
      if (!db.objectStoreNames.contains(this.todoListSettings.DB_STORE_NAME)) {
        db.createObjectStore(this.todoListSettings.DB_STORE_NAME, {
          keyPath: 'idItem'
        })
      }

    }
  }

  createDB() {
    if (!window.indexedDB || !window.IDBTransaction) return new Error('Ваш браузер не поддерживает IDB. Рекомендуемые браузеры:')

    let openRequest = indexedDB.open(this.todoListSettings.DB_NAME, this.todoListSettings.DB_VERSION)

    openRequest.onupgradeneeded = this.upgradeDB(openRequest)

    openRequest.onsuccess = event => {
      this.todoListSettings.dbCreated = true
      this.saveSettingsToLocalStorage()
    }

    openRequest.onerror = event => {
      console.log('К сожалению ваш браузер не подходит для работы с этим приложением')
    }
  }

  loadSettingsFromLocalStorage() {

    let settingsFromLS = JSON.parse(localStorage.todoListSettings)

    if (!settingsFromLS) {
      console.log(new Error('Отсуствуют данные в localStorage'))
      return null
    }

    return settingsFromLS
  }

  saveSettingsToLocalStorage() {

    localStorage.todoListSettings = JSON.stringify(this.todoListSettings)

  }

  renderList(listItems, templateID = this.todoListSettings.outputTemplateID, outputID = this.todoListSettings.outputID) {

    if (!Array.isArray(listItems) || !listItems.length) {
      console.log(new Error('renderList(): Отсутствуют данные для вывода или имеют не верный формат, ожидается массив.'))
      return
    }

    let output = document.querySelector(outputID)
    let tmpl = document.querySelector(templateID)

    if (!output || !tmpl) {
      console.log(new Error('renderList(): Не верно указаны идентификаторы для вывода или шаблона: outputID или templateID'))
      return
    }

    for (let i = 0; i < listItems.length; i++) {

      let cloneTmpl = tmpl.content.cloneNode(true)
      let li = cloneTmpl.querySelector('li')
      let iconDiv = cloneTmpl.querySelector('.icon-item')
      let iconItem = cloneTmpl.querySelector('.icon-item i')
      let itemText = cloneTmpl.querySelector('.todolist__item-text')
      let itemDate = cloneTmpl.querySelector('.todolist__item-date')

      li.setAttribute('data-itemID', listItems[i].itemID)

      iconDiv.classList.add(itemIconsColors[listItems[i].itemIconColor])

      let iconClassArray = itemIconsArray[listItems[i].itemIcon].split(' ')

      for (let i = 0; i < iconClassArray.length; i++) {
        iconItem.classList.add(iconClassArray[i])
      }

      itemText.innerText = listItems[i].itemText
      itemDate.innerText = this.formatDate(listItems[i].itemDateTime)

      output.appendChild(cloneTmpl)
    }
  }

  showInputError() {
    const error = document.querySelector('#inputTodo')
    let i = 0
    let h = setInterval(() => {
      i++
      error.classList.toggle('error')
      if (i == 7) {
        clearInterval(h)
        error.classList.remove('error')
        this.focusOnInput()
      }
    }, 300)
  }

  getItemFromItemsArray(itemID){
    return this.todoListItems.filter(item => item.itemID == itemID)[0]
  }

  formatDate(date) {
    let diff = new Date() - date; 

    if (diff < 1000) { 
      return 'прямо сейчас';
    }

    let sec = Math.floor(diff / 1000);

    if (sec < 60) {
      return sec + ' сек. назад';
    }

    let min = Math.floor(diff / 60000);
    if (min < 60) {
      return min + ' мин. назад';
    }

    if (new Date().toLocaleDateString() == new Date(date).toLocaleDateString()) {
      let options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      };
      return `сегодня в ${new Date(date).toLocaleTimeString('RU-ru', options)}`
    }

    let d = new Date(date);
    d = [
      '0' + d.getDate(),
      '0' + (d.getMonth() + 1),
      '' + d.getFullYear(),
      '0' + d.getHours(),
      '0' + d.getMinutes()
    ].map(component => component.slice(-2));

    return d.slice(0, 3).join('.') + ' ' + d.slice(3).join(':');
  }
}

// const addButton = document.querySelector('#todolistform #addButton')

// addButton.addEventListener('click', () => {
//   let inputValue = document.querySelector('#inputTodo')
//   // let listIconItem = document.querySelector('#listIconItem')
//   myTodo.addListItem(new TodoListItem(inputValue.value, listIconItem.value))
//   inputValue.value = ''
// })


// ***************************************tests***************************************

indexedDB.deleteDatabase('todoListDB')

let tdl = new TodoList(defaultSettings);
console.log(tdl);


// ***************************************tests***************************************




(function () {
  let modal = document.querySelector('.icon-color-picker__modal-container');
  let closeButton = document.querySelector('.icon-color-picker__close-button ');
  let modalTriggers = document.querySelectorAll('[data-trigger]');

  let isModalOpen = false;
  let pageYOffset = 0;

  let openModal = function () {
    pageYOffset = window.pageYOffset;
    modal.classList.add('icon-color-picker__is-open');
    isModalOpen = true;
    document.querySelector('body').classList.add('stop-scrolling')
    document.querySelector('html').classList.add('stop-scrolling')
  }

  let closeModal = function () {
    modal.classList.remove('icon-color-picker__is-open');
    isModalOpen = false;
    document.querySelector('body').classList.remove('stop-scrolling')
    document.querySelector('html').classList.remove('stop-scrolling')
  }

  // let onScroll = function(e) {
  //   if (isModalOpen) {
  //     e.preventDefault();
  //     window.scrollTo(0, pageYOffset);
  //   }
  // }

  modalTriggers.forEach(function (item) {
    item.addEventListener('click', openModal);
  })

  //document.addEventListener('scroll', onScroll);
  document.querySelector('.icon-color-picker__modal-container').addEventListener('click', e => {
    console.log(e.target.classList)
    closeModal()
  });
  //closeButton.addEventListener('click', closeModal);
})();