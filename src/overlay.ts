const overlay = document.createElement('div')
overlay.style.position = 'fixed'
overlay.style.top = '0'
overlay.style.left = '0'
overlay.style.width = '100%'
overlay.style.height = '100%'
overlay.style.backgroundColor = '#333'
overlay.style.display = 'flex'
overlay.style.justifyContent = 'space-evenly'
overlay.style.alignItems = 'center'
overlay.style.zIndex = '9999'

// use default fa-b1-loader
const i = document.createElement('i')
i.className = 'fa-b1-loader'
i.style.width = '20vh'
i.style.height = '20vh'
overlay.appendChild(i)
document.documentElement.appendChild(overlay)

window.addEventListener('load', () => {
  setTimeout(() => {
    overlay.remove()
  }, 100)
})