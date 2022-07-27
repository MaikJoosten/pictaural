const preset = _tone_0253_Acoustic_Guitar_sf2_file
const ac = new (window.AudioContext || window.webkitAudioContext)()
const player = new WebAudioFontPlayer()
player.adjustPreset(ac, preset)
let notes = []
let queue = []
const maxRgb = (256 * 256 * 256) - 1
const octave = 12
const lowestNote = octave * 3
const tonalRange = octave * 2
const noteLength = 0.5

const pushToQueue = (pitch) => {
  const delay = 0.2
  const prevNote = notes[notes.length - 1]
  const start = prevNote ? prevNote.start + noteLength + delay : 0
  queue.push({
    pitch,
    duration: noteLength,
    start,
  })
}

const playQueue = () => {
  queue.forEach((item) => {
    player.queueWaveTable(
      ac,
      ac.destination,
      preset,
      ac.currentTime + item.start,
      item.pitch,
      item.duration,
    )
  })
  queue = []
}

const sortNotes = () => {
  notes.sort()
  let currentNote = notes.shift()
  queue.push(currentNote)
  while (notes.length > 0) {
    const nextNoteIndex = notes.findIndex((note) => {
      const fifth = currentNote + 5
      if (note === fifth || note > 12 && (note - 12) === fifth || note > 24 && (note - 24) === fifth) {
        return true
      }
      const seventh = currentNote + 7
      if (note === seventh || note > 12 && (note - 12) === seventh || note > 24 && (note - 24) === seventh) {
        return true
      }
    })
    if (nextNoteIndex) {
      queue.push(notes.splice(nextNoteIndex, 1)[0])
    } else {
      break
    }
  }
  playQueue()
}

const readImageData = () => {
  const input = document.querySelector('input')
  var img = new Image()
  var reader = new FileReader()
  reader.onload = (e) => {
    img.onload = () => {
      setTimeout(() => {
        analyseImage(img)
      }, 50)
    }
    img.src = e.target.result
  },
  reader.readAsDataURL(input.files[0])
}

const rgbToNote = (r, g, b) => {
  const rgb = (r << 16) + (g << 8) + (b)
  const percentage = rgb / maxRgb

  return lowestNote + Math.round(percentage * tonalRange)
}

const analyseImage = (img) => {
  const canvas = document.querySelector('canvas')
  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const colorData = ctx.getImageData(x, y, 1, 1).data
      notes.push(rgbToNote(...colorData))
    }
  }
  sortNotes()
}

const startSample = () => {
  const sample = new Image()
  sample.onload = () => {
    setTimeout(() => {
      analyseImage(sample)
    }, 50)
  }
  sample.src = 'sample.jpg?d=' + +new Date()
}
