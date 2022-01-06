class ItemTodoList {
  constructor(itemText = '', itemIcon = 0, itemIconColor = 0, itemDateTime = 0) {
    if (!itemDateTime) {
      itemDateTime = Date.now()
    }
    
    this.itemDateTime = itemDateTime
    this.itemText = itemText
    this.itemIcon = Number(itemIcon)
    this.itemIconColor = Number(itemIconColor)
    this.checkedItem = false
  }
}


(function(){
  let modal = document.querySelector('.icon-color-picker__modal-container');
  let closeButton = document.querySelector('.icon-color-picker__close-button ');
  let modalTriggers = document.querySelectorAll('[data-trigger]');

  let isModalOpen = false;
  let pageYOffset = 0;

  let openModal = function() {
    pageYOffset = window.pageYOffset;
    modal.classList.add('icon-color-picker__is-open');
    isModalOpen = true;
    document.querySelector('body').classList.add('stop-scrolling')
    document.querySelector('html').classList.add('stop-scrolling')
  }

  let closeModal = function() {
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

  modalTriggers.forEach(function(item) { 
    item.addEventListener('click', openModal);
  })

  //document.addEventListener('scroll', onScroll);
  document.querySelector('.icon-color-picker__modal-container').addEventListener('click', e => {
    console.log(e.target.classList)
    closeModal()
  });
  closeButton.addEventListener('click', closeModal);
})();