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
    chip.dataset.source = "true"

    const nameSpan = document.createElement('span')
    nameSpan.className = 'chip-name'
    nameSpan.textContent = name

    const deleteChip = document.createElement('span')
    deleteChip.className = 'delete-chip material-symbols-outlined'
    deleteChip.innerHTML = 'close'

    chip.appendChild(nameSpan)
    chip.appendChild(deleteChip)
    chipsContainer.appendChild(chip)
    activeDeleteChipFonte() // <-- Adicione esta linha
}

function activeSortable(el, isSource = false) {
    new Sortable(el, {
        group: isSource
            ? { name: 'restriction', pull: 'clone', put: false }
            : { name: 'restriction', pull: true, put: true },
        animation: 150,
        sort: !isSource,

        onAdd: function (evt) {
            togglePlaceholder(evt.to)
            const chip = evt.item
            const deleteChip = chip.querySelector('.delete-chip')
            if (deleteChip) {
                deleteChip.onclick = function () {
                    chip.remove()
                    togglePlaceholder(evt.to)
                }
            }
            activeDeleteChipFonte()
        },
        onRemove: function (evt) {
            togglePlaceholder(evt.from)
        },
    })
    togglePlaceholder(el)
}
activeSortable(chipsContainer, true)
activeSortable(group)

function togglePlaceholder(container) {
    const placeholder = container.querySelector('span.placeholder-restriction')
    if (!placeholder) return

    if (container.querySelectorAll('.chip').length > 0) {
        placeholder.style.display = 'none'
    } else {
        placeholder.style.display = 'block'
    }
}

function createGroup() {
    const divGroup = document.createElement('div')
    const closeGroup = document.createElement('span')
    divGroup.className = 'group'
    divGroup.innerHTML = '<span class="placeholder-restriction">Arraste aqui</span>'
    groupContainer.appendChild(divGroup)
    closeGroup.className = 'close-group material-symbols-outlined'
    closeGroup.innerHTML = 'close'
    closeGroup.onclick = () => {
        divGroup.remove()
    }
    divGroup.appendChild(closeGroup)

    activeSortable(divGroup)
}

// Função para ativar a funcionalidade de exclusão do chip fonte
function activeDeleteChipFonte() {
    document.querySelectorAll('.chips-container .chip').forEach(chip => {
        const deleteChip = chip.querySelector('.delete-chip')
        if (deleteChip) {
            const name = chip.querySelector('.chip-name')
                ? chip.querySelector('.chip-name').textContent
                : chip.textContent.replace('close', '')
            deleteChip.onclick = function () {
                document.querySelectorAll('.group .chip').forEach(clone => {
                    const cloneName = clone.querySelector('.chip-name')
                        ? clone.querySelector('.chip-name').textContent
                        : clone.textContent.replace('close', '')
                    if (cloneName === name) clone.remove()
                })
                chip.remove()
            }
        }
    })
}