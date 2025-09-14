const inputWorkers = document.querySelector('input#workers')
const chipsContainer = document.querySelector('.chips-container')
const group = document.querySelector('div.group')
const groupContainer = document.querySelector('div.group-container')

inputWorkers.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault()
        const name = inputWorkers.value.trim().replace(',', '')
        if (name) {
            createChip(name)
            inputWorkers.value = ''
        }
    }
})

function createChip(name) {
    const chip = document.createElement('div')
    chip.className = 'chip'
    chip.textContent = name

    const deleteChip = document.createElement('span')
    deleteChip.className = 'delete-chip'
    deleteChip.className += ' material-symbols-outlined'
    deleteChip.innerHTML = 'close'
    deleteChip.onclick = () => chip.remove()

    chip.appendChild(deleteChip)
    chipsContainer.appendChild(chip)
}

function activeSortable(el) {
    new Sortable(el, {
        group: "restriction",
        animation: 150,

        onAdd: function (evt) {
            togglePlaceholder(evt.to)
        },
        onRemove: function (evt) {
            togglePlaceholder(evt.from)
        },
    })
    togglePlaceholder(el)
}

function togglePlaceholder(container) {
    const placeholder = container.querySelector('span.placeholder-restriction')
    if (!placeholder) return

    if (container.querySelectorAll('.chip').length > 0) {
        placeholder.style.display = 'none'
    } else {
        placeholder.style.display = 'block'
    }
}

activeSortable(chipsContainer)
activeSortable(group)

function createGroup() {
    const divGroup = document.createElement('div')
    divGroup.className = 'group'
    divGroup.innerHTML = '<span class="placeholder-restriction">Arraste aqui</span>'
    groupContainer.appendChild(divGroup)

    activeSortable(divGroup)
}