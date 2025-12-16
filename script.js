const taskInput = document.getElementById('taskInput')
const addBtn = document.getElementById('addBtn')
const toggleThemeBtn = document.getElementById('toggleTheme')

let tasks = JSON.parse(localStorage.getItem('KanbanTasks')) || []
let chart

addBtn.addEventListener('click', addTask)
taskInput.addEventListener('keydown', e => e.key === 'Enter' && addTask())

function addTask() {
    const text = taskInput.value.trim()
    if (!text) return

    tasks.push({
        id: Date.now(),
        title: text,
        status: 'todo'
    })

    taskInput.value = ''
    save()
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id)
    save()
}

function moveTask(id, status) {
    const task = tasks.find(t => t.id === id)
    task.status = status
    save()
}

function save() {
    localStorage.setItem('KanbanTasks', JSON.stringify(tasks))
    render()
    updateDashboard()
}

function render() {
    const cols = {
        todo: document.getElementById('col-todo'),
        doing: document.getElementById('col-doing'),
        done: document.getElementById('col-done')
    }

    Object.values(cols).forEach(c => c.innerHTML = '')

    tasks.forEach(task => {
        const card = document.createElement('div')
        card.className =
            'bg-gray-100 dark:bg-gray-700 p-3 rounded shadow flex justify-between items-center cursor-grab transition-colors'
        card.draggable = true

        card.innerHTML = `
      <span>${task.title}</span>
      <button onclick="deleteTask(${task.id})" class="text-red-400 font-bold">✕</button>
    `

        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('id', task.id)
        })

        cols[task.status].appendChild(card)
    })
}

document.querySelectorAll('[id^="col-"]').forEach(col => {
    col.addEventListener('dragover', e => e.preventDefault())
    col.addEventListener('drop', e => {
        const id = Number(e.dataTransfer.getData('id'))
        moveTask(id, col.id.replace('col-', ''))
    })
})

function updateDashboard() {
    const counts = {
        todo: tasks.filter(t => t.status === 'todo').length,
        doing: tasks.filter(t => t.status === 'doing').length,
        done: tasks.filter(t => t.status === 'done').length
    }

    document.getElementById('count-todo').textContent = counts.todo
    document.getElementById('count-doing').textContent = counts.doing
    document.getElementById('count-done').textContent = counts.done

    const data = {
        labels: ['A Fazer', 'Fazendo', 'Concluído'],
        datasets: [{
            data: [counts.todo, counts.doing, counts.done],
            backgroundColor: ['#3b82f6', '#facc15', '#22c55e']
        }]
    }

    if (chart) chart.destroy()

    chart = new Chart(document.getElementById('taskChart'), {
        type: 'doughnut',
        data
    })
}


const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
    toggleThemeBtn.textContent = '☀️ Light'
}

toggleThemeBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark')

    const theme = document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light'

    localStorage.setItem('theme', theme)
    toggleThemeBtn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark'
})

render()
updateDashboard()
