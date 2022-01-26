let itemIconIonic = {

}

let itemIconsFA = {
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

  lastIcon: 0,
  lastIconColor: 0,

  sortSave: false, 
  sortField: 'ci',
  sortUpDown: 'up',
  chekedDown: false,

  settingsVersion: 2,

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

      if (this.todoListSettings.settingsVersion != settings.settingsVersion) {
        this.updateSettings(settings)
      }

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

    this.filters = {
      i: 'itemIcon',
      ic: 'itemIconColor',
      dt: 'itemDateTime',
      ci: 'checkedItem'
    }

    this.todoListItems = []

    this.todoListInit()
  }

  updateSettings(settings){
    this.todoListSettings.settingsVersion = settings.settingsVersion    
    for (const key in settings) {
      if (Object.hasOwnProperty.call(settings, key)) {

        const element = settings[key];
        
        if (!Object.hasOwnProperty.call(this.todoListSettings, key)){
          this.todoListSettings[key] = element
        }
      }
    }

    this.saveSettingsToLocalStorage()
  }

  createListItem() {
    let inputValue = document.querySelector('#inputTodo')
    let itemIcon = document.querySelector('#icon-color-picker-button').getAttribute('data-item-icon')
    let itemIconColor = document.querySelector('#icon-color-picker-button').getAttribute('data-item-icon-color')

    let listItem = new ItemTodoList(inputValue.value, itemIcon, itemIconColor)

    inputValue.value = ''

    return listItem
  }

  filterList(filters, filterValue) {
    // [[i, [1,3,5,6]], [ic, [1,3]], [dt, [startDate, endDate]], [ci, [true]]]

    return this.todoListItems.filter(item => item[filters] === filterValue)

  }

  sortList(listItems, sortField = 'dt', sortUpDown = 'down') {

    switch (sortField) {
      case 'dt':
      case 'itemDateTime':
        if (sortUpDown == 'down') {
          return listItems.sort((a, b) => a.itemDateTime - b.itemDateTime)
        }
        if (sortUpDown == 'up') {
          return listItems.sort((a, b) => b.itemDateTime - a.itemDateTime)
        }
        break;

      case 'i':
        console.log('i_down', listItems)
        if (sortUpDown == 'down') {
          return listItems.sort((a, b) => a.itemIcon - b.itemIcon)
        }
        if (sortUpDown == 'up') {
          console.log('i_up', listItems)
          return listItems.sort((a, b) => b.itemIcon - a.itemIcon)
        }
        break;

      case 'ic':
        console.log('i_down', listItems)
        if (sortUpDown == 'down') {
          return listItems.sort((a, b) => a.itemIconColor - b.itemIconColor)
        }
        if (sortUpDown == 'up') {
          console.log('i_up', listItems)
          return listItems.sort((a, b) => b.itemIconColor - a.itemIconColor)
        }
        break;

      case 'ci':
        console.log('i_down', listItems)
        if (sortUpDown == 'down') {
          return listItems.sort((a, b) => a.checkedItem - b.checkedItem)
        }
        if (sortUpDown == 'up') {
          console.log('i_up', listItems)
          return listItems.sort((a, b) => b.checkedItem - a.checkedItem)
        }
        break;


      default:
        break;
    }

    return listItems
  }

  setIconColorButton(iconID, colorID) {

    let iconColorPickerButton = document.querySelector('#icon-color-picker-button')

    iconColorPickerButton.setAttribute('data-item-icon', iconID)
    iconColorPickerButton.setAttribute('data-item-icon-color', colorID)

    // *****************************************************************************************************

    let icon = iconColorPickerButton.querySelector('.save-button-icon')

    icon.removeAttribute('class')
    icon.classList.add('save-button-icon')
    icon.classList.add(itemIconsColors[colorID])

    // *****************************************************************************************************

    let icon_i = icon.querySelector('i')

    icon_i.removeAttribute('class')
    let iconClasses = itemIconsFA[iconID].split(' ')

    for (let i = 0; i < iconClasses.length; i++) {
      icon_i.classList.add(iconClasses[i])
    }
    // *****************************************************************************************************
  }

  todoListInit() {

    document.querySelector('#icon-color-picker-button').addEventListener('click', event => {
      let modal = this.iconColorPickerModalWindow()
      setTimeout(() => {
        modal.open()
      }, 0);

    })

    // this.todoListSettings.chekedDown = true
    this.saveSettingsToLocalStorage()
    // this.iconColorPickerModalWindow()

    // this.loadListFromDB().then(rs => this.renderList(this.todoListItems))

    // this.loadListFromDB().then(rs => this.renderList(this.filterList(this.filters.i, 2)))
    console.log(this.todoListSettings)

    this.loadListFromDB().then(rs => this.renderList(this.todoListItems))

    this.setIconColorButton(this.todoListSettings.lastIcon, this.todoListSettings.lastIconColor)

    let addButton = document.querySelector('#addButton')
    let inputTodo = document.querySelector('#inputTodo')

    addButton.addEventListener('click', () => {

      this.addTodoListItem(this.createListItem())

    })

    inputTodo.addEventListener('keyup', event => {

      if (event.code === 'Enter') this.addTodoListItem(this.createListItem())

    })


    let output = document.querySelector(this.todoListSettings.outputID)

    output.addEventListener('click', event => {

      let currentElement = event.target

      if (currentElement.tagName == 'I') currentElement = event.target.parentElement

      let currentElementID = currentElement.getAttribute('id')

      let itemID = currentElement.closest('li').getAttribute('data-ItemID')

      // console.log(currentElement)

      switch (currentElementID) {
        case 'delete-button':
          console.log('press delete button', itemID)
          this.deleteListItem(itemID)
          break;

        case 'edit-button':
          console.log('press edit button', itemID)
          let textItem = currentElement.closest('li').querySelector('.todolist__item-text')
          this.editListItem(textItem, itemID)
          break;

        case 'icon-item':
          console.log('press icon-item button', itemID)
          if (this.getItemFromItemsArray(itemID).checkedItem) {
            this.uncheckedListItem(itemID)
            return
          }
          this.checkedListItem(itemID)
          break;

        case 'item-text':
          console.log('press item text')
          break;

        default:
          console.log('press unknown button', itemID)
          break;
      }
    })

    output.addEventListener('dblclick', event => {
      let currentElement = event.target

      if (currentElement.tagName == 'I') currentElement = event.target.parentElement

      let currentElementID = currentElement.getAttribute('id')

      let itemID = currentElement.closest('li').getAttribute('data-ItemID')

      switch (currentElementID) {
        case 'item-text':
          console.log('press item-text-edit button', itemID)
          let textItem = currentElement.closest('li').querySelector('.todolist__item-text')
          this.editListItem(textItem, itemID)
          break;
        default:
          console.log('press unknown button', itemID)
          break;
      }
    })
  }

  uncheckedListItem(itemID) {
    let todoListItem = this.getItemFromItemsArray(itemID)

    if (!todoListItem) {
      console.log(new Error('Невозможно отредактировать элемент uncheckListItem()'))
      return
    }

    todoListItem.checkedItem = false

    this.saveListToDB(todoListItem).then(this.renderList(this.todoListItems))
  }

  checkedListItem(itemID) {
    let todoListItem = this.getItemFromItemsArray(itemID)

    if (!todoListItem) {
      console.log(new Error('Невозможно отредактировать элемент checkListItem()'))
      return
    }

    todoListItem.checkedItem = true

    this.saveListToDB(todoListItem).then(this.renderList(this.todoListItems))
  }

  editListItem(elem, itemID) {

    let ta = document.createElement('textarea')

    ta.classList.add('todolist__item-text-editor')

    ta.value = elem.innerHTML

    ta.addEventListener('keyup', ev => {
      if (ev.key == 'Enter') {
        ta.blur()
      }
    })

    let endEdit = (elem, ta) => {
      let todoListItem = this.getItemFromItemsArray(itemID)
      if (!todoListItem) {
        console.log(new Error('Невозможно отредактировать элемент'))
        return
      }
      todoListItem.itemText = ta.value
      elem.innerHTML = ta.value

      this.saveListToDB(todoListItem)
      ta.replaceWith(elem)
    }

    ta.addEventListener('blur', () => {
      endEdit(elem, ta)
    })

    elem.replaceWith(ta)
    ta.focus()
  }

  addTodoListItem(todoListItem) {

    if (!(todoListItem instanceof ItemTodoList)) {
      console.log(new Error('Не правильный формат данных'))
    }

    if (!todoListItem.itemText) {
      this.showInputError()
      return
    }

    this.saveListToDB(todoListItem).then(rs => this.renderList(this.todoListItems))
  }

  deleteListItem(itemID) {
    if (!itemID) {
      console.log('Отсутствует индентификатор записи')
      return
    }

    this.deleteItemFromDB(itemID).then(rs => this.renderList(this.todoListItems))
  }

  deleteItemFromDB(itemID) {
    return new Promise((rs, rj) => {

      let openRequest = indexedDB.open(this.todoListSettings.DB_NAME, this.todoListSettings.DB_VERSION)

      openRequest.onupgradeneeded = this.upgradeDB(openRequest)

      openRequest.onsuccess = event => {

        let db = event.target.result

        if (db) {

          let transaction = db.transaction(this.todoListSettings.DB_STORE_NAME, STORE_ACCESS_RW)

          let objStore = transaction.objectStore(this.todoListSettings.DB_STORE_NAME)

          let request = objStore.delete(Number(itemID))

          request.onsuccess = event => {

            let idItemInArray = this.todoListItems.findIndex(item => item.itemID == itemID)

            this.todoListItems.splice(idItemInArray, 1)
            rs(this.todoListItems)
          }

          request.onerror = event => {
            console.log('Данные не сохранились, ошибка запроса')
          }

          transaction.onsuccess = event => {
            console.log('transaction save OK')
          }

          transaction.onsuccess = event => {
            console.log('transaction save NOT ok')
          }

        }
      }
      openRequest.onerror = event => {
        console.log('Ошибка открытия базы данных')
      }
    })
  }

  clearDB() {
    return new Promise((rs, rj) => {

      let openRequest = indexedDB.open(this.todoListSettings.DB_NAME, this.todoListSettings.DB_VERSION)

      openRequest.onupgradeneeded = this.upgradeDB(openRequest)

      openRequest.onsuccess = event => {

        let db = event.target.result

        if (db) {

          let transaction = db.transaction(this.todoListSettings.DB_STORE_NAME, STORE_ACCESS_RW)

          let objStore = transaction.objectStore(this.todoListSettings.DB_STORE_NAME)

          let request = objStore.clear()

          request.onsuccess = event => {
            this.todoListItems = []
            console.log('clear db')
          }

          request.onerror = event => {
            console.log('Ошибка очистки store DB')
          }


          transaction.onsuccess = event => {
            console.log('transaction clearDB OK')
          }

          transaction.onsuccess = event => {
            console.log('transaction clearDB ok')
          }

        }
      }
      openRequest.onerror = event => {
        console.log('Ошибка открытия базы данных')
      }
    })
  }

  loadListFromDB() {
    return new Promise((rs, rj) => {
      let openRequest = indexedDB.open(this.todoListSettings.DB_NAME, this.todoListSettings.DB_VERSION)

      openRequest.onupgradeneeded = this.upgradeDB(openRequest)

      openRequest.onsuccess = event => {
        let db = event.target.result

        if (db) {
          let transaction = db.transaction(this.todoListSettings.DB_STORE_NAME, STORE_ACCESS_R)

          let objStore = transaction.objectStore(this.todoListSettings.DB_STORE_NAME)

          let request = objStore.getAll()

          request.onsuccess = event => {
            // console.log(request.result)
            this.todoListItems = request.result
            rs(request.result)
          }

          request.onerror = event => {
            console.log('Обшибка запроса загрузки данных')
          }

          transaction.onsuccess = event => {
            console.log('transaction read OK')
          }

          transaction.onsuccess = event => {
            console.log('transaction read NOT ok')
          }
        }
      }

      openRequest.onerror = event => {
        console.log('Ошибка открытия базы данных')
      }

    })
  }

  saveListToDB(todoListItem) {
    return new Promise((rs, rj) => {

      let openRequest = indexedDB.open(this.todoListSettings.DB_NAME, this.todoListSettings.DB_VERSION)

      openRequest.onupgradeneeded = this.upgradeDB(openRequest)

      openRequest.onsuccess = event => {

        let db = event.target.result

        if (db) {

          // console.log(this.todoListSettings.DB_STORE_NAME)

          let transaction = db.transaction(this.todoListSettings.DB_STORE_NAME, STORE_ACCESS_RW)

          let objStore = transaction.objectStore(this.todoListSettings.DB_STORE_NAME)

          let request = objStore.put(todoListItem)

          request.onsuccess = event => {
            this.todoListItems = this.loadListFromDB()
            // this.todoListItems.push(todoListItem)
            rs(this.todoListItems)
          }

          request.onerror = event => {
            console.log('Данные не сохранились, ошибка запроса')
          }


          transaction.onsuccess = event => {
            console.log('transaction save OK')
          }

          transaction.onsuccess = event => {
            console.log('transaction save NOT ok')
          }

        }
      }
      openRequest.onerror = event => {
        console.log('Ошибка открытия базы данных')
      }
    })
  }

  upgradeDB(rq) {
    return () => {

      let db = rq.result

      if (!db.objectStoreNames.contains(this.todoListSettings.DB_STORE_NAME)) {
        db.createObjectStore(this.todoListSettings.DB_STORE_NAME, {
          keyPath: 'itemID'
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

    if (!Array.isArray(listItems)) {
      console.log(new Error('renderList(): Отсутствуют данные для вывода или имеют не верный формат, ожидается массив.'))
      return
    }

    let output = document.querySelector(outputID)
    let tmpl = document.querySelector(templateID)

    if (!output || !tmpl) {
      console.log(new Error('renderList(): Не верно указаны идентификаторы для вывода или шаблона: outputID или templateID'))
      return
    }

    output.innerHTML = ''

    if (listItems.length == 0) {
      console.log(this.todoListItems.length)
      let noData = document.createElement('p')
      noData.innerHTML = 'Пока что нет ни одной записи! Введите текст и нажмите сохранить!'
      output.appendChild(noData)
      return
    }

    // console.log('items', listItems)      

    listItems = this.sortList(listItems, this.todoListSettings.sortField, this.todoListSettings.sortUpDown)
    // listItems = this.sortList(listItems, 'dt', 'up')

    if (this.todoListSettings.chekedDown) { 
      listItems = this.sortList(listItems, 'ci', 'up')
    }


    for (let i = listItems.length - 1; i >= 0; i--) {

      let cloneTmpl = tmpl.content.cloneNode(true)
      let li = cloneTmpl.querySelector('li')
      let iconDiv = cloneTmpl.querySelector('.icon-item')
      let iconItem = cloneTmpl.querySelector('.icon-item i')
      let itemText = cloneTmpl.querySelector('.todolist__item-text')
      let itemDate = cloneTmpl.querySelector('.todolist__item-date')

      // console.log(listItems[i], listItems.length,i)

      li.setAttribute('data-itemID', listItems[i].itemID)

      if (listItems[i].checkedItem) {
        li.classList.add('checked')
        let checkedIcon = document.createElement('i')
        checkedIcon.classList.add('check')
        checkedIcon.classList.add('fas')
        checkedIcon.classList.add('fa-check')
        iconDiv.appendChild(checkedIcon)
      }

      iconDiv.classList.add(itemIconsColors[listItems[i].itemIconColor])

      let iconClassArray = itemIconsFA[listItems[i].itemIcon].split(' ')

      for (let i = 0; i < iconClassArray.length; i++) {
        iconItem.classList.add(iconClassArray[i])
      }

      itemText.innerText = listItems[i].itemText
      itemDate.innerText = this.formatDate(listItems[i].itemDateTime)

      output.appendChild(cloneTmpl)
    }
  }

  focusOnInput() {
    const inputTodo = document.getElementById('inputTodo')
    console.log(inputTodo)
    inputTodo.focus()
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

  getItemFromItemsArray(itemID) {
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

  createIconPicker() {
    let icons = document.createElement('div')
    icons.classList.add('icon-color-picker__icons')

    for (let i = 0; i < Object.keys(itemIconsFA).length; i++) {

      let icon = document.createElement('i')
      let cl = itemIconsFA[i].split(' ')

      icon.setAttribute('data-icon-id', Object.keys(itemIconsFA)[i])

      for (let j = 0; j < cl.length; j++) {

        icon.classList.add(cl[j])

      }
      if (i == this.todoListSettings.lastIcon) icon.classList.add('icon__active')

      icons.appendChild(icon)
    }

    return icons
  }

  createColorPicker() {
    let colors = document.createElement('div')
    colors.classList.add('icon-color-picker__colors')

    for (let i = 0; i < Object.keys(itemIconsColors).length; i++) {

      let color = document.createElement('i')

      color.classList.add('fas')
      color.classList.add('fa-fill-drip')
      color.classList.add(itemIconsColors[i])


      color.setAttribute('data-icon-color-id', Object.keys(itemIconsColors)[i])

      if (i == this.todoListSettings.lastIconColor) color.classList.add('icon-color__active')

      colors.appendChild(color)
    }

    return colors
  }

  iconColorPickerModalWindow() {
    let thisTodo = this

    let options = {
      title: 'Выбери иконку и цвет записи',
      modalOverlayClose: true,
      picker: true,
      multiPicker: true,
      footerButtons: [{
          type: 'ok',
          handler() {

            thisTodo.todoListSettings.lastIcon = currentIconColor[0]
            thisTodo.todoListSettings.lastIconColor = currentIconColor[1]

            thisTodo.setIconColorButton(thisTodo.todoListSettings.lastIcon, thisTodo.todoListSettings.lastIconColor)

            thisTodo.saveSettingsToLocalStorage()

            modal.close()

          }
        },
        {
          type: 'cancel',
          handler() {
            modal.close()
          }
        },
      ],
      content: ''
    }

    let currentIconColor = [this.todoListSettings.lastIcon, this.todoListSettings.lastIconColor]

    const icons = this.createIconPicker()
    const colors = this.createColorPicker()

    icons.addEventListener('click', event => {

      if (currentIconColor[0] != this.todoListSettings.lastIcon) icons.querySelector(`[data-icon-id="${currentIconColor[0]}"]`).classList.remove('icon__active')

      currentIconColor[0] = event.target.getAttribute('data-icon-id')

      icons.querySelector(`[data-icon-id="${this.todoListSettings.lastIcon}"]`).classList.remove('icon__active')

      event.target.classList.add('icon__active')
    })

    colors.addEventListener('click', event => {

      if (currentIconColor[1] != this.todoListSettings.lastIconColor) colors.querySelector(`[data-icon-color-id="${currentIconColor[1]}"]`).classList.remove('icon-color__active')

      currentIconColor[1] = event.target.getAttribute('data-icon-color-id')
      colors.querySelector(`[data-icon-color-id="${this.todoListSettings.lastIconColor}"]`).classList.remove('icon-color__active')
      event.target.classList.add('icon-color__active')
    })

    options.content = [icons, colors]

    let modal = new t.modal(options)
    return modal
  }
}

// ***************************************tests***************************************


console.time()
let tdl = new TodoList(defaultSettings);
// indexedDB.deleteDatabase('todoListDB')
// tdl.iconColorPickerModalWindow()

// modal.open()

// setTimeout(() => {
//   modal.close()
// }, 2000)

console.timeEnd()

// console.log(tdl);


// ***************************************tests***************************************