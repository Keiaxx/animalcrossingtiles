<template>
  <div>
    <fish-card fluid color="green">
      <div slot="header">Create Pattern</div>
      <fish-row>
        <fish-col spam="6" class="demo-col">
          <fish-card fluid color="gray">
            <div slot="header">Pattern Details</div>
            <fish-row>
              <fish-col span="24" class="demo-col">
                <fish-input label-left="Title" hint="" v-model="title"></fish-input>
              </fish-col>
            </fish-row>
            <fish-row>
              <fish-col span="24" class="demo-col">
                <fish-input label-left="Author" hint="" v-model="author"></fish-input>
              </fish-col>
            </fish-row>
            <fish-row>
              <fish-col span="24" class="demo-col">
                <fish-input label-left="Town Name" hint="" v-model="town"></fish-input>
              </fish-col>
            </fish-row>
          </fish-card>
        </fish-col>

        <fish-col span="9" class="demo-col">

          <fish-card fluid color="gray">
            <div slot="header">Input Image</div>

            <input type="file" @change="onFileChange">
            {{photoStatus}}

            <fish-field label="Tiles Width">
              <fish-select v-model="gridw">
                <template v-for="size in gridwidths">
                  <fish-option :index="size" :content="String(size)"></fish-option>
                </template>
              </fish-select>
            </fish-field>

            <fish-field label="Tiles Height">
              <fish-select v-model="gridh">
                <template v-for="size in gridheights">
                  <fish-option :index="size" :content="String(size)"></fish-option>
                </template>
              </fish-select>
            </fish-field>

            <cropper
              classname="cropper"
              :src="img"
              :stencil-props="{
              aspectRatio: this.gridw/this.gridh
              }"
              :minHeight="1"
              :minWidth="1"
              @change="change"
            ></cropper>

            <fish-loader :active="loadingphoto"></fish-loader>

          </fish-card>
        </fish-col>

        <fish-col span="9" class="demo-col">
          <fish-card fluid color="gray">
            <div slot="header">Output Image</div>
            <canvas id="imagecanvas"></canvas>
            <fish-loader :active="redrawingoutput"></fish-loader>
          </fish-card>
        </fish-col>
      </fish-row>


      <div slot="footer">
        <fish-button v-on:click="clearData">Clear Photo</fish-button>
        <fish-button v-on:click="generateCodes" :loading="qrStatus===1">Generate QR Code(s)</fish-button>
      </div>
    </fish-card>


    <fish-card fluid color="blue">
      <div slot="header">Generated Code(s)</div>

      <canvas id="qrcanvas"></canvas>
      <div slot="footer">
        <fish-button>Download PNG</fish-button>
      </div>

    </fish-card>
    2

    <canvas id="processcanvas" style="display: none;"></canvas>
  </div>
</template>
<script>
  import QRCode from 'qrcode'
  import DataManager from '../actiler/datamanager'
  import ACPalette from '../actiler/palette'
  import { Cropper } from 'vue-advanced-cropper'
  import resizeImageData from 'resize-image-data'

  import * as iq from 'image-q'

  export default {
    data () {
      return {
        title: '',
        author: '',
        town: '',
        photoStatus: 'Upload a Photo',
        files: [],
        photoUploaded: false,
        loadingphoto: false,
        redrawingoutput: false,
        qrStatus: 0, // 0 idle 1 generating 2 generated 3 error
        img: '',
        gridw: 1,
        gridh: 1,
        convertedTiles: [],
        rawPaletteColors: {}
      }
    },
    components: {
      Cropper
    },
    watch: {
      gridw: function (val) {
        console.log('CHANGED GRIDW ' + val)
        this.gridh = 1
      }
    },
    computed: {
      gridwidths () {
        let arr = []
        for (let i = 1; i <= 50; i++) {
          arr.push(i)
        }
        return arr
      },
      gridheights () {
        let arr = []
        let _this = this
        for (let i = 1; i <= 50; i++) {
          if ((_this.gridw * i) <= 50) {
            arr.push(i)
          }
        }
        return arr
      }
    },
    // watch: {
    //   files: function(val) {
    //     console.log(val)
    //   }
    // },
    methods: {
      clearData () {
        this.photoStatus = 'Upload a Photo'
        this.files = []
        this.photoUploaded = false
        this.qrStatus = 0
        this.img = ''
        let canvas2 = document.getElementById('imagecanvas')
        let ctx2 = canvas2.getContext('2d')
        ctx2.clearRect(0, 0, 0, 0)
      },
      onFileChange (e) {
        var files = e.target.files || e.dataTransfer.files
        if (!files.length)
          return
        this.createImage(files[0])
      },
      createImage (file) {
        let reader = new FileReader()

        reader.onerror = (e) => {
          this.photoStatus = 'Error Loading Photo'
        }
        reader.onprogress = (e) => {
          this.photoStatus = 'Loading Photo'
          this.loadingphoto = true
        }
        reader.onload = (e) => {
          this.photoStatus = 'Photo Loaded'
          this.photoUploaded = true

          this.img = e.target.result
          this.convertedTiles = []
        }
        reader.readAsDataURL(file)
      },
      change ({ coordinates, canvas }) {
        this.redrawingoutput = true
        this.convertedTiles = []

        console.log(coordinates, canvas)

        if (canvas) {

          let ctx = canvas.getContext('2d')

          let imageData = ctx.getImageData(0, 0, coordinates.width, coordinates.height)
          const imageData2 = resizeImageData(imageData, 32 * this.gridw, 32 * this.gridh, 'nearest-neighbor') //biliniear-interpolation

          const inPointContainer = iq.utils.PointContainer.fromUint8Array(imageData2.data, 32 * this.gridw, 32 * this.gridh)


          // desired colors number
          var targetColors = 15
          var distanceCalculator = new iq.distance.EuclideanBT709NoAlpha()
          var paletteQuantizer = new iq.palette.RGBQuant(distanceCalculator, targetColors)
          paletteQuantizer.sample(inPointContainer)
          var palette = paletteQuantizer.quantizeSync()
          var imageQuantizer = new iq.image.NearestColor(distanceCalculator)
          var outPointContainer = imageQuantizer.quantizeSync(inPointContainer, palette)

          // working
          // const loadedPalette = new utils.Palette()
          //
          // const acp = ACPalette.toRGBArray()
          //
          // for (let p in acp) {
          //   let color = acp[p]
          //   loadedPalette.add(utils.Point.createByRGBA(color.r, color.g, color.b, 255))
          // }
          //
          // const dist = new distance.EuclideanBT709()
          // const img = new image.ErrorDiffusionArray(dist, image.ErrorDiffusionArrayKernel.SierraLite)
          // const outPointContainer = img.quantizeSync(inPointContainer, loadedPalette)
          // working end

          // const palette = buildPaletteSync([inPointContainer], {
          //   colorDistanceFormula: 'euclidean', // optional
          //   paletteQuantization: 'neuquant', // optional
          //   colors: 4, // optional
          // });
          // const outPointContainer = applyPaletteSync(inPointContainer, loadedPalette);

          const output = outPointContainer.toUint8Array()

          //split iData into grid pieces
          let gridpx_w = 32
          let gridpx_h = 32

          const iData = new ImageData(Uint8ClampedArray.from(output), 32 * this.gridw, 32 * this.gridh)

          const resizedInpointContainer = iq.utils.PointContainer.fromUint8Array(iData.data, 32 * this.gridw, 32 * this.gridh)
          const loadedPalette = new iq.utils.Palette()
          const acp = ACPalette.toRGBArray()
          for (let p in acp) {
            let color = acp[p]
            loadedPalette.add(iq.utils.Point.createByRGBA(color.r, color.g, color.b, 255))
          }

          let inpointArray = resizedInpointContainer.getPointArray()
          let colors = {}
          let uint32array = []
          for(let p in inpointArray){
            let point = inpointArray[p]
            let pointColor = loadedPalette.getNearestColor(distanceCalculator, point)

            let rhex = ACPalette.dec2hex(pointColor.r)
            let ghex = ACPalette.dec2hex(pointColor.g)
            let bhex = ACPalette.dec2hex(pointColor.b)
            let hexcolor = String(rhex + ghex + bhex).toLowerCase()

            if(colors.hasOwnProperty(hexcolor)){
              colors[hexcolor] = colors[hexcolor]+1
            }else{
              colors[hexcolor] = 1
            }

            uint32array.push(pointColor.uint32)
          }

          let inpointACPalette = iq.utils.PointContainer.fromUint32Array(Uint32Array.from(uint32array), 32 * this.gridw, 32 * this.gridh)
          let acPalettizedImage =  new ImageData(Uint8ClampedArray.from(inpointACPalette.toUint8Array()), 32 * this.gridw, 32 * this.gridh)
          console.log(colors)
          console.log(Object.keys(colors).length)
          this.rawPaletteColors = colors

          // put quantized onto a invisible canvas for processing and separation into tiles
          let processCanvas = document.getElementById('processcanvas')
          let processContext = processCanvas.getContext('2d')

          processCanvas.width = 32 * this.gridw
          processCanvas.height = 32 * this.gridh

          processContext.putImageData(acPalettizedImage, 0, 0)

          let displaypx = 128
          let canvas2 = document.getElementById('imagecanvas')
          let ctx2 = canvas2.getContext('2d')

          canvas2.width = displaypx * this.gridw
          canvas2.height = displaypx * this.gridh

          for (var w = 0; w < this.gridw; w++) {
            for (var h = 0; h < this.gridh; h++) {
              let tl = (w * gridpx_w)
              let top = (h * gridpx_h)
              let tile32 = processContext.getImageData(tl, top, gridpx_w, gridpx_h)
              let tileContainer = iq.utils.PointContainer.fromUint8Array(tile32.data, gridpx_w, gridpx_h)

              this.convertedTiles.push(tileContainer)

              let toshow = resizeImageData(tile32, displaypx, displaypx, 'nearest-neighbor')

              ctx2.putImageData(toshow, (w * displaypx), (h * displaypx))

              ctx2.lineWidth = 1
              ctx2.beginPath()
              ctx2.globalAlpha = 0.3
              ctx2.moveTo((w * displaypx), (h * displaypx))
              ctx2.lineTo((w * displaypx), (h * displaypx) + displaypx)
              ctx2.lineTo((w * displaypx) + displaypx, (h * displaypx) + displaypx)
              ctx2.lineTo((w * displaypx) + displaypx, (h * displaypx))
              ctx2.lineTo((w * displaypx), (h * displaypx))
              ctx2.stroke()
            }
          }
        }

        console.log(this.convertedTiles)

        this.redrawingoutput = false
        this.loadingphoto = false

      },
      generateCodes () {
        this.qrStatus = 1
        let dm = new DataManager()

        dm.setTitle(this.title)
        dm.setAuthor(this.author)
        dm.setTown(this.town)

        let succ = dm.setPalette(this.rawPaletteColors)

        if(succ){
          dm.injectPhotoData(this.convertedTiles[0])
        }

        QRCode.toCanvas(document.getElementById('qrcanvas'),
          [{ data: dm.getPreparedData(), mode: 'byte' }],
          {
            errorCorrectionLevel: 'M' // Nintendo app seems to want medium error correction
          },
          (error) => {
            if (error) {
              console.error(error)
              this.$message.error('An error occurred when generating QR Code(s)!', 5000)
              this.qrStatus = 3
              return
            }

            this.qrStatus = 2

            this.$message.success('Generated QR Code(s)!', 5000)
          })
      }
    },

    mounted () {

    }
  }
</script>

<style>
  .demo-col {

    padding: 10px 0;
    text-align: center;
    margin-bottom: 5px;
  }

  /*
  Maybe you need to set the limits for the cropper sizes or its container sizes
  otherwise a cropping image will try to fill all available space
*/
  .cropper {
    height: 400px;
    background: #DDD;
  }
</style>
