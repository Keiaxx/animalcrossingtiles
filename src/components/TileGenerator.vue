<template>
  <div>
    <fish-card color="green" fluid>
      <div slot="header">Create Pattern</div>
      <fish-row>
        <fish-col class="demo-col" spam="6">
          <fish-card color="gray" fluid>
            <div slot="header">Pattern Details</div>
            <fish-row>
              <fish-col class="demo-col" span="24">
                <fish-input hint="" label-left="Title" v-model="title"></fish-input>
              </fish-col>
            </fish-row>
            <fish-row>
              <fish-col class="demo-col" span="24">
                <fish-input hint="" label-left="Author" v-model="author"></fish-input>
              </fish-col>
            </fish-row>
            <fish-row>
              <fish-col class="demo-col" span="24">
                <fish-input hint="" label-left="Town Name" v-model="town"></fish-input>
              </fish-col>
            </fish-row>

            <fish-message v-if="notFilledOut" type="error">
              All fields must be filled out!
            </fish-message>
          </fish-card>
        </fish-col>

        <fish-col class="demo-col" span="9">

          <fish-card color="gray" fluid>
            <div slot="header">Input Image</div>

            <input @change="onFileChange" type="file">
            {{photoStatus}}

            <fish-field label="Tiles Width">
              <fish-select v-model="gridw">
                <template v-for="size in gridwidths">
                  <fish-option :content="String(size)" :index="size"></fish-option>
                </template>
              </fish-select>
            </fish-field>

            <fish-field label="Tiles Height">
              <fish-select v-model="gridh">
                <template v-for="size in gridheights">
                  <fish-option :content="String(size)" :index="size"></fish-option>
                </template>
              </fish-select>
            </fish-field>

            Smoother
            <fish-switch v-model="chosenInterpolation" :yesOrNo="interpolationTypes"></fish-switch>
            Sharper

            <cropper
              :minHeight="1"
              :minWidth="1"
              :src="img"
              :stencil-props="{
              aspectRatio: this.gridw/this.gridh
              }"
              @change="change"
              classname="cropper"
            ></cropper>

            <fish-loader :active="loadingphoto"></fish-loader>

          </fish-card>
        </fish-col>

        <fish-col class="demo-col" span="9">
          <fish-card color="gray" fluid>
            <div slot="header">Output Image</div>
            <canvas ref="imagecanvas"></canvas>
            <fish-loader :active="redrawingoutput"></fish-loader>
          </fish-card>
        </fish-col>
      </fish-row>


      <div slot="footer">
        <fish-button v-on:click="clearData">Clear Photo</fish-button>
        <fish-button :loading="qrStatus===1" v-on:click="generateCodes">Generate QR Code(s)</fish-button>
      </div>
    </fish-card>


    <fish-card color="blue" fluid>
      <div slot="header">Generated Code(s) <fish-button v-if="toGenerate.length > 0" v-on:click="generatePNG">Download PNG</fish-button></div>


      <template v-for="tile in toGenerate">
        <fish-col class="demo-col" span="24">
          <QRComponent :author="author"
                       :palette="rawPaletteColors"
                       :pdata="tile.pdata"
                       :tile="String(tile.tile)"
                       :title="title"
                       :town="town"
                       v-on:generated="qrGenerated"></QRComponent>
        </fish-col>
      </template>

    </fish-card>

    <canvas ref="processcanvas" style="display: none;"></canvas>
    <canvas ref="exportcanvas" style="display: none;"></canvas>
  </div>
</template>
<script>
  import ACPalette from '../actiler/palette'
  import {Cropper} from 'vue-advanced-cropper'
  import resizeImageData from 'resize-image-data'
  import canvasToImage from 'canvas-to-image';
  import QRComponent from './QRComponent'

  import * as iq from 'image-q'

  export default {
    data() {
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
        toGenerate: [],
        rawPaletteColors: {},
        chosenInterpolation: 'biliniear-interpolation',
        interpolationTypes: [
          'nearest-neighbor',
          'biliniear-interpolation'
        ],
        lastCoordinates: false,
        lastCanvas: false,
        generatedQRS: {}
      }
    },
    components: {
      Cropper,
      QRComponent
    },
    computed: {
      gridwidths() {
        let arr = []
        for (let i = 1; i <= 50; i++) {
          arr.push(i)
        }
        return arr
      },
      gridheights() {
        let arr = []
        let _this = this
        for (let i = 1; i <= 50; i++) {
          if ((_this.gridw * i) <= 50) {
            arr.push(i)
          }
        }
        return arr
      },
      notFilledOut() {
        return this.title.length === 0 || this.author.length === 0 || this.town.length === 0
      }
    },
    watch: {
      title: function (val) {
        this.toGenerate = []
        localStorage.setItem('title', val)
      },
      author: function (val) {
        this.toGenerate = []
        localStorage.setItem('author', val)
      },
      town: function (val) {
        this.toGenerate = []
        localStorage.setItem('town', val)
      },
      gridw: function (val) {
        console.log('CHANGED GRIDW ' + val)
        this.gridh = 1
      },
      chosenInterpolation: function (val) {
        if (this.lastCanvas && this.lastCoordinates) {
          this.invokeChange(this.lastCoordinates, this.lastCanvas)
        }
      }
    },
    methods: {
      generatePNG() {
        let num = 0

        const canvas = this.$refs.exportcanvas
        const context = canvas.getContext('2d')
        context.imageSmoothingEnabled = false
        const pixsize = 400
        canvas.width = (this.gridw * pixsize) * 2
        canvas.height = (this.gridh * pixsize) + 20


        context.clearRect(0, 0, canvas.width, canvas.height)

        context.beginPath();
        context.rect(0, 0, canvas.width , canvas.height);
        context.fillStyle = "black";
        context.fill();

        let promiseArray = []

        for (let h = 0; h < this.gridh; h++) {
          for (let w = 0; w < this.gridw; w++) {
            promiseArray.push(new Promise(resolve => {
              let img = new Image()
              img.src = this.generatedQRS[num]
              img.onload = () => {
                context.drawImage(img, w * pixsize, h * pixsize, pixsize, pixsize)
                resolve()
              }
            }))
            num++
          }
        }

        const outputCanvas = this.$refs.imagecanvas

        let copyPromise = new Promise(resolve => {
          let destinationImage = new Image;
          destinationImage.onload = () => {
            context.drawImage(destinationImage, (this.gridw * pixsize),0, (this.gridw * pixsize), (this.gridh * pixsize) );
            resolve()
          };
          destinationImage.src = outputCanvas.toDataURL("image/png");
        })

        Promise.all(promiseArray).then(() => {
          copyPromise.then(() => {
            context.font = '16px Arial';
            context.textAlign = 'center';
            context.fillStyle = 'red';  // a color name or by using rgb/rgba/hex values
            context.fillText('Made with https://actiles.burni.sh/ - Animal Crossing photo tile generator', (this.gridw * pixsize), canvas.height- 2); // text and position

            canvasToImage(canvas, {
              name: this.title+"_"+this.author+"_"+this.town,
              type: 'png',
              quality: 1
            });
          })
        })

      },
      qrGenerated({num, image}) {
        console.log("QR GENERATED FOR " + num)
        this.generatedQRS[num] = image
      },
      clearData() {
        this.photoStatus = 'Upload a Photo'
        this.toGenerate = []
        this.files = []
        this.photoUploaded = false
        this.qrStatus = 0
        this.img = ''
        let imgc = this.$refs.imagecanvas
        imgc.getContext('2d').clearRect(0, 0, imgc.width, imgc.height)

        let pcanv = this.$refs.processcanvas
        pcanv.getContext('2d').clearRect(0, 0, pcanv.width, pcanv.height)
      },
      onFileChange(e) {
        var files = e.target.files || e.dataTransfer.files
        if (!files.length)
          return
        this.createImage(files[0])
      },
      createImage(file) {
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
      change({coordinates, canvas}) {
        this.lastCoordinates = coordinates
        this.lastCanvas = canvas
        this.invokeChange(coordinates, canvas)
      },
      invokeChange(coordinates, canvas) {
        this.redrawingoutput = true
        this.convertedTiles = []
        this.generatedQRS = {}

        if (canvas) {

          let ctx = canvas.getContext('2d')

          let imageData = ctx.getImageData(0, 0, coordinates.width, coordinates.height)
          const imageData2 = resizeImageData(imageData, 32 * this.gridw, 32 * this.gridh, this.chosenInterpolation) //biliniear-interpolation

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
          var nearestColorACDistance = new iq.distance.Manhattan()
          for (let p in inpointArray) {
            let point = inpointArray[p]
            let pointColor = loadedPalette.getNearestColor(nearestColorACDistance, point)

            let rhex = ACPalette.dec2hex(pointColor.r)
            let ghex = ACPalette.dec2hex(pointColor.g)
            let bhex = ACPalette.dec2hex(pointColor.b)
            let hexcolor = String(rhex + ghex + bhex).toLowerCase()

            if (colors.hasOwnProperty(hexcolor)) {
              colors[hexcolor] = colors[hexcolor] + 1
            } else {
              colors[hexcolor] = 1
            }

            uint32array.push(pointColor.uint32)
          }

          let inpointACPalette = iq.utils.PointContainer.fromUint32Array(Uint32Array.from(uint32array), 32 * this.gridw, 32 * this.gridh)
          let acPalettizedImage = new ImageData(Uint8ClampedArray.from(inpointACPalette.toUint8Array()), 32 * this.gridw, 32 * this.gridh)

          this.rawPaletteColors = colors

          // put quantized onto a invisible canvas for processing and separation into tiles
          let processCanvas = this.$refs.processcanvas
          let processContext = processCanvas.getContext('2d')

          processCanvas.width = 32 * this.gridw
          processCanvas.height = 32 * this.gridh

          processContext.putImageData(acPalettizedImage, 0, 0)

          let displaypx = 128
          let canvas2 = this.$refs.imagecanvas
          let ctx2 = canvas2.getContext('2d')

          canvas2.width = displaypx * this.gridw
          canvas2.height = displaypx * this.gridh

          let num = 0

          for (var h = 0; h < this.gridh; h++) {
            for (var w = 0; w < this.gridw; w++) {
              let tl = (w * gridpx_w)
              let top = (h * gridpx_h)
              let tile32 = processContext.getImageData(tl, top, gridpx_w, gridpx_h)
              let tileContainer = iq.utils.PointContainer.fromUint8Array(tile32.data, gridpx_w, gridpx_h)

              this.convertedTiles.push({
                tile: num,
                pdata: tileContainer
              })

              let toshow = resizeImageData(tile32, displaypx, displaypx, this.chosenInterpolation)

              ctx2.putImageData(toshow, (w * displaypx), (h * displaypx))

              ctx2.lineWidth = 1
              ctx2.beginPath()

              ctx2.globalAlpha = 0.3
              ctx2.font = '40px Arial'
              ctx2.fillStyle = 'red'
              ctx2.fillText(String(num), (w * displaypx) + 10, (h * displaypx) + 40)

              ctx2.globalAlpha = 0.3
              ctx2.moveTo((w * displaypx), (h * displaypx))

              ctx2.lineTo((w * displaypx), (h * displaypx) + displaypx)
              ctx2.lineTo((w * displaypx) + displaypx, (h * displaypx) + displaypx)
              ctx2.lineTo((w * displaypx) + displaypx, (h * displaypx))
              ctx2.lineTo((w * displaypx), (h * displaypx))
              ctx2.stroke()

              num++
            }
          }
        }

        this.redrawingoutput = false
        this.loadingphoto = false

        this.toGenerate = []
      },
      generateCodes: function () {
        let hasError = false
        if (this.title.length === 0) {
          this.$message.error('error: Title cannot be blank!', 2000)
          hasError = true
        }

        if (this.author.length === 0) {
          this.$message.error('error: Author cannot be blank!', 2000)
          hasError = true
        }

        if (this.town.length === 0) {
          this.$message.error('error: Town name cannot be blank!', 2000)
          hasError = true
        }

        if (!hasError) {
          this.toGenerate = []
          this.toGenerate = this.convertedTiles
        }
      }
    },

    mounted() {
      this.title = localStorage.getItem('title') || ''
      this.author = localStorage.getItem('author') || ''
      this.town = localStorage.getItem('town') || ''
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

  canvas {
    width: 100%;
    height: 100%;
    margin: 0px;
    border: 0;
    overflow: hidden; /*  Disable scrollbars */
    display: block;  /* No floating content on sides */
    image-rendering: optimizeSpeed;             /* Older versions of FF          */
    image-rendering: -moz-crisp-edges;          /* FF 6.0+                       */
    image-rendering: -webkit-optimize-contrast; /* Safari                        */
    image-rendering: -o-crisp-edges;            /* OS X & Windows Opera (12.02+) */
    image-rendering: pixelated;                 /* Awesome future-browsers       */
    -ms-interpolation-mode: nearest-neighbor;   /* IE                            */
  }
</style>
