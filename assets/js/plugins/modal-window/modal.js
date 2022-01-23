t.modal = function(options){

  function _createModalButtons(buttons = []){
    if (!buttons.length) return

    // let $buttons = document.createElement('div')
    // $buttons.setAttribute('id', 'modal-window__buttons')
    // $buttons.classList.add('modal-window__buttons')

    let $buttons = document.querySelector('#tmpl_modal-window__buttons').content.cloneNode(true).querySelector('#modal-window__buttons')

    if (buttons.length == 1) $buttons.classList.add('modal-window__single-button')

    buttons.forEach(button => {
      
      let b = ''
      if (button.type == 'ok'){
        b = document.querySelector('#tmpl_modal-window__button_ok').content.cloneNode(true).querySelector('.modal-window__ok-button')
      }

      if (button.type == 'cancel'){
        b = document.querySelector('#tmpl_modal-window__button_cancel').content.cloneNode(true).querySelector('.modal-window__cancel-button')
      }
      console.log(b)
      b.addEventListener('click', button.handler)

      $buttons.insertAdjacentElement('afterbegin', b) // += b
    })

    return $buttons
  }

  function _createModal(options){

    const tmpl_modal = document.querySelector('#tmpl_modal-window')
    
    const modal = tmpl_modal.content.cloneNode(true)   
    
    modal.querySelector('.modal-title').innerHTML = options.title

    modal.querySelector('.modal-body').insertAdjacentHTML('afterbegin', options.content || 'no content to display')

    modal.querySelector('#modal-footer').insertAdjacentElement('afterbegin',_createModalButtons(options.footerButtons))

    document.body.prepend(modal)
    
    return document.querySelector('#tmodal-modal')
  }

  const $modal = _createModal(options)
  const ANIMATION_SPEED = 300

  let closing = false
  let destroyed = false

  const modal = {
    open(){
      if (destroyed) return
      !closing && $modal.classList.add('modal__open')
    },
    saveData(){},

    close(){
      closing = true
      $modal.classList.remove('modal__open')
      $modal.classList.add('modal__hiding')
      setTimeout(() => {
        $modal.classList.remove('modal__hiding')
        closing = false
      }, ANIMATION_SPEED);      
    },    
  }

  const closeListener = event => {
    let cancelModal = event.target.getAttribute('id')
    // console.log(event.target.getAttribute('id'))
  }

  $modal.addEventListener('click', closeListener)

  return Object.assign(modal, {
    destroy(){
      $modal.remove()
      $modal.removeEventListener('click', closeListener)
      destroyed = true
    },
    setContent(html){
      $modal.querySelector('#modal-body').innerHTML = html
    }
  })
}