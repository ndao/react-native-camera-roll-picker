# react-native-camera-roll-picker
CameraRoll Picker component for React native

<a href="https://raw.githubusercontent.com/jeanpan/react-native-camera-roll-picker/master/demo/demo.gif"><img src="https://raw.githubusercontent.com/jeanpan/react-native-camera-roll-picker/master/demo/demo.gif" width="350"></a>

##Add to Project
* Make sure node_modules/react-native/Libraries/CameraRoll/RCTCameraRoll.xcodeproj has been imported to project libraries by following the [libraries linking instructions](https://facebook.github.io/react-native/docs/linking-libraries-ios.html).

* Install component through npm
```
$ npm install react-native-camera-roll-picker --save
```

* Require component
```
var CameraRollPicker = require('react-native-camera-roll-picker');
```

##Basic Usage
```js
<CameraRollPicker
  callback={this.getSelectedImages} />
```

##Props
- `callback` : Callback function when images was selected. (is required!). Return a selected image array and current selected image. 
- `groupTypes` : The group where the photos will be fetched, one of 'Album', 'All', 'Event', 'Faces', 'Library', 'PhotoStream' and 'SavedPhotos'. (Default: SavedPhotos)
- `assetType` : The asset type, one of 'Photos', 'Videos' or 'All'. (Default: Photos)
- `selected` : Already be selected images array. (Default: [])
- `maximum` : Maximum number of selected images. (Default: 15)
- `imagesPerRow` : Number of images per row. (Default: 3)
- `imageMargin` : Margin size of one image. (Default: 5)
- `containerWidth` : Width of camer roll picker container. (Default: device width)
- `selectedMarker` : Custom selected image marker component. (Default: checkmark).
- `backgroundColor` : Set background color. (Default: white).

##Run Example
```
$ git clone https://github.com/jeanpan/react-native-camera-roll-picker.git
$ cd react-native-camera-roll-picker
$ cd Example
$ npm install
$ react-native run-ios
```
