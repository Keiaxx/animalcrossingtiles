import ACPalette from '@/actiler/palette'

const Buffer = require('buffer/').Buffer

class DataManager {
  constructor () {
    this.preparedData = Buffer.alloc(620)
    this.rawTitle = Buffer.alloc(40)

    this.unknown1 = Buffer.alloc(4)
    this.unknown1[2] = 0xb6
    this.unknown1[3] = 0xec

    this.rawAuthor = Buffer.alloc(16)
    this.unknown2 = Buffer.alloc(6)
    this.unknown2[4] = 0x44
    this.unknown2[5] = 0xc5

    this.rawTown = Buffer.alloc(16)
    this.rawUID = Buffer.alloc(6)
    this.rawUID[4] = 0x19
    this.rawUID[5] = 0x31

    this.rawColors = Buffer.alloc(15)
    this.rawColors[0] = 0x0f
    this.rawColors[1] = 0x1f
    this.rawColors[2] = 0x2f
    this.rawColors[3] = 0x3f
    this.rawColors[4] = 0x4f
    this.rawColors[5] = 0x5f
    this.rawColors[6] = 0x6f
    this.rawColors[7] = 0x7f
    this.rawColors[8] = 0x8f
    this.rawColors[9] = 0x9f
    this.rawColors[10] = 0xaf
    this.rawColors[11] = 0xbf
    this.rawColors[12] = 0xcf
    this.rawColors[13] = 0xdf
    this.rawColors[14] = 0xef

    this.unknown3 = Buffer.alloc(1)
    this.unknown3[0] = 0xcc

    this.unknown4 = Buffer.alloc(1)
    this.unknown4[0] = 0x0A

    this.patternType = Buffer.alloc(1)
    this.patternType[0] = 0x09

    this.unknown5 = Buffer.alloc(2)
    this.pixels = Buffer.alloc(512)
    this.colorMap = {}
  }

  // convert a string to a specific size array in reverse low to high word notation salads
  // aka if a ascii code is 0x00AA
  // it will reverse it to  0xAA00
  hexEncodeReverse (input, size) {
    let hex, i
    let result = Buffer.alloc(size)

    for (i = 0; i < input.length; i++) {
      let idoubled = i * 2
      hex = input.charCodeAt(i).toString(16)
      let encodedchar = ('000' + hex).slice(-4)
      let highword = parseInt(encodedchar.substring(0, 2), 16)
      let lowword = parseInt(encodedchar.substring(2, 4), 16)

      console.log(highword + ' ' + lowword)

      result[idoubled] = lowword
      result[idoubled + 1] = highword
    }

    console.log(result.toString('hex'))

    return result
  }

  setTitle (title) {
    let truncated = title.substring(0, 20)
    this.rawTitle = this.hexEncodeReverse(truncated, 40)
  }

  setAuthor (author) {
    let truncated = author.substring(0, 8)
    this.rawAuthor = this.hexEncodeReverse(truncated, 16)
  }

  setTown (town) {
    let truncated = town.substring(0, 8)
    this.rawTown = this.hexEncodeReverse(truncated, 16)
  }

  getPreparedData () {
    this.preparedData = Buffer.concat([
      this.rawTitle,
      this.unknown1,
      this.rawAuthor,
      this.unknown2,
      this.rawTown,
      this.rawUID,
      this.rawColors,
      this.unknown3,
      this.unknown4,
      this.patternType,
      this.unknown5,
      this.pixels
    ])

    return new Uint8ClampedArray(this.preparedData)
  }

  setPalette (colorobj) {
    let colorMap = ACPalette.getHexMap()

    let keys = Object.keys(colorobj) // keys of uint32's

    if (keys.length <= 15 && keys.length > 0) {
      let map = {}
      let values = []

      console.log(colorMap)

      for (let i in keys) {
        let hexkey = keys[i]
        let paletteHexValue = colorMap[hexkey]

        console.log('hex: ')
        console.log(paletteHexValue)

        map[hexkey] = i
        values.push(paletteHexValue)
      }

      this.colorMap = map

      console.log(this.colorMap)
      console.log(values)

      for (let p in values) {
        this.rawColors[p] = values[p]
      }

      return true
    } else {
      return false
    }

  }

  injectPhotoData (pcontainer) {
    let pointArray = pcontainer.getPointArray()

    console.log('Injecting photo data')

    let count = 0
    for (let i = 0; i < 512; i++) {
      let pointhigh = pointArray[i * 2]
      let pointlow = pointArray[(i * 2) + 1]

      let rhex = ACPalette.dec2hex(pointhigh.r)
      let ghex = ACPalette.dec2hex(pointhigh.g)
      let bhex = ACPalette.dec2hex(pointhigh.b)
      let hexhigh = String(rhex + ghex + bhex).toLowerCase()

      let rhex1 = ACPalette.dec2hex(pointlow.r)
      let ghex1 = ACPalette.dec2hex(pointlow.g)
      let bhex1 = ACPalette.dec2hex(pointlow.b)
      let hexlow = String(rhex1 + ghex1 + bhex1).toLowerCase()

      let highmap = this.colorMap[hexhigh]
      let lowmap = this.colorMap[hexlow]

      let nibble1 = lowmap
      let nibble2 = highmap

      // Support transparency
      // TODO: Add thresholds for when something is transparent
      //       as of now only values exactly alpha 0 are converted to 0xFF
      if(pointlow.a === 0){
        nibble1 = 0xFF
      }

      if(pointhigh.a === 0){
        nibble2 = 0xFF
      }

      let result = (nibble1 << 4) | nibble2

      this.pixels[i] = result

      count++
    }

    console.log('Injected ' + count + ' pixels')
  }

  printData () {
    console.log(this.preparedData)
  }
}

export default DataManager
