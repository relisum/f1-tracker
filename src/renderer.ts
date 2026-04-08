const buttons = document.querySelectorAll(".button")
const underline = document.querySelector(".underline") as HTMLElement


const moveUnderline = (el: HTMLElement) => {
  const left = el.offsetLeft
  const width = el.offsetWidth

  underline.style.width = `${width}px`
  underline.style.transform = `translateX(${left}px)`
}

const changePage = () => {
  const container = document.getElementById('page-container')

  buttons.forEach((button, index) => {
    if (button.classList.contains('active')) {
      container.style.transform = `translateX(${index * -50}%)`
    }
  })
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"))

    btn.classList.add("active")

    changePage()
    moveUnderline(btn as HTMLElement)
  })
})


class GoonItem {
  public name: string
  private count: number = 0
  private readonly max?: number
  public icon?: string

  constructor(name: string, icon?: string, max?: number) {
    this.name = name
    this.icon = icon
    this.max = max
  }
  public add(amount: number = 1) {
    this.count += amount
    if (this.max !== undefined && this.count > this.max) {
      this.count = this.max
    }
  }
  public displayName(): string {
    return this.name
  }
  public displayCount() {
    return this.count
  }
}

const alcohol = new GoonItem("Alcohol", "./assets/beer.svg")

function renderAlcohol() {
  const container = document.getElementById("alcohol")
  if (!container) return

  container.innerHTML = `
    <p id="alcohol-count">${alcohol.displayName()}</p>
    <span>${alcohol.displayCount()}</span>
    <button id="alcohol-add">+</button>
  `

  const addBtn = document.getElementById("alcohol-add")

  addBtn?.addEventListener("click", () => {
    alcohol.add()
    renderAlcohol()
  })
}


window.addEventListener("DOMContentLoaded", () => {
  const active = document.querySelector(".button.active") as HTMLElement
  if (active) moveUnderline(active)

  renderAlcohol()
})