# Animal Crossing Photo Tile Generator

> idk what to name this thing 

> Anyways, there are already existing things out there to do more advanced things such as
> create clothes and stuff but I couldn't find anything to make like
> tiled patterns to make images on your island easily
>
> If there is something out there, my googling skills probably just suck
> and I just ended up wasting my time making this app
> 
> just kidding it was pretty fun and a learning experience making this
> and I hope you enjoy yes

## Technologies Used

* vuejs https://github.com/vuejs/vue
* fish-ui https://github.com/myliang/fish-ui
* image-quantization https://github.com/ibezkrovnyi/image-quantization
* resize-image-data https://github.com/LinusU/resize-image-data
* node-qrcode https://github.com/soldair/node-qrcode
* vue-advanced-cropper https://github.com/Norserium/vue-advanced-cropper

Thanks to @DamSenViet for the animal crossing color palette object https://github.com/DamSenViet/react-acnl-pattern-tool/blob/master/src/acnl.js#L348 

## Known Issues

* QR Generation is slow due to super unoptimized method of generating them. I will fix this soon
* The UI looks like poop and not that phone friendly
  * Need to properly resize canvas in the card elements
* PNG downloading does not work yet
* Transparency support for PNG not yet implemented

App performance is probably subpar and there are many places it could be improved. I am still learning and feel free to send suggestions ty

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
