import React, {Component} from 'react'
import {
  CameraRoll,
  Image,
  Platform,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ListView,
  ActivityIndicator,
} from 'react-native'

class CameraRollPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      images: [],
      selected: this.props.selected,
      lastCursor: null,
      loadingMore: false,
      noMore: false,
      dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
    };
  }

  componentWillMount() {
    var {width} = Dimensions.get('window');
    var {imageMargin, imagesPerRow, containerWidth} = this.props;

    if(typeof containerWidth != "undefined") {
      width = containerWidth;
    }
    this._imageSize = (width - (imagesPerRow + 1) * imageMargin) / imagesPerRow;

    this.fetch();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selected: nextProps.selected,
    });
  }

  fetch() {
    if (!this.state.loadingMore) {
      this.setState({loadingMore: true}, () => { this._fetch(); });
    }
  }

  _fetch() {
    var {groupTypes, assetType} = this.props;

    var fetchParams = {
      first: 1000,
      groupTypes: groupTypes,
      assetType: assetType,
    };

    if (Platform.OS === "android") {
      // not supported in android
      delete fetchParams.groupTypes;
    }

    if (this.state.lastCursor) {
      fetchParams.after = this.state.lastCursor;
    }

    CameraRoll.getPhotos(fetchParams)
      .then((data) => this._appendImages(data), (e) => console.log(e));
  }

  _appendImages(data) {
    var assets = data.edges;
    var newState = {
      loadingMore: false,
    };

    if (!data.page_info.has_next_page) {
      newState.noMore = true;
    }

    if (assets.length > 0) {
      newState.lastCursor = data.page_info.end_cursor;
      newState.images = this.state.images.concat(assets);
      newState.dataSource = this.state.dataSource.cloneWithRows(
        this._nEveryRow(newState.images, this.props.imagesPerRow)
      );
    }

    this.setState(newState);
  }

  render() {
    var {imageMargin, backgroundColor} = this.props;
    return (
      <View
        style={[styles.wrapper, {padding: imageMargin, paddingRight: 0, backgroundColor: backgroundColor},]}>
        <ListView
          style={{flex: 1,}}
          renderFooter={this._renderFooterSpinner.bind(this)}
          onEndReached={this._onEndReached.bind(this)}
          dataSource={this.state.dataSource}
          renderRow={rowData => this._renderRow(rowData)} />
      </View>
    );
  }

  _renderImage(item) {
    var {selectedMarker, imageMargin, selectedVideoMarker} = this.props;
    var imageUri = item.node.image.uri
    var isVideo = !!imageUri.match(/&ext=MOV/)
    var videoMarkerBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABdUlEQVRIS2NkoDFgpLH5DMPLggQGBgZ5EoLsFwMDw2MGBoYlOPRIMTAwPAMFEbO+vv5+Nzc3XS4uLgFiLWBjY2N49+7dh40bN665c+dOKpo+fw4OjtU/fvxoA1kQ6+XlNWPr1q1cxBqOrM7IyOjr+fPnAxkYGHaDxHl5ebvNzc1Tra2t+RobG5tAFtTX1dXVNzY2khXhGRkZ/2fOnJnFwMAwQ1xc/FRmZqZufX09R0NDw39qWpAvICBQu2LFClF3d3ewB6ltwcrk5OTwOXPmwEOB6hZkZWWFT506ddQCzIQMTUUraR5EaWlp4TNnzqRZHBTy8vLWb9y4UdDR0ZEmyRSc0URERM4VFBRoVldXo2S0WG9v7xlbtmwhq6gwNjb+eu7cOXhRISkpOV1XVzfS0tISXlSACrsDbm5uOtzc3CQXdhs2bMBW2AVycHCs+PHjRzty+QMqrhVIKPBAxfUjPMW1NAMDw1OyCjgSHDHMqkxSfE60WgBWiOsZnfkevAAAAABJRU5ErkJggg=='
    var videoMarker = selectedVideoMarker
                        ? selectedVideoMarker
                        : <Image
                            style={[styles.videoMarker, {width: 25, height: 25, right: imageMargin + 5},]}
                            source={{uri: videoMarkerBase64, scale: 3}}
                          />;
    var marker = selectedMarker ? selectedMarker :
      <Image
        style={[styles.marker, {width: 25, height: 25, right: imageMargin + 5},]}
        source={require('./circle-check.png')}
      />;

    return (
      <TouchableOpacity
        key={item.node.image.uri}
        style={{marginBottom: imageMargin, marginRight: imageMargin}}
        onPress={event => this._selectImage(item.node)}>
        <Image
          source={{uri: item.node.image.uri}}
          style={{height: this._imageSize, width: this._imageSize}} >
          { isVideo ? videoMarker : null }
          { (this._arrayObjectIndexOf(this.state.selected, 'uri', item.node.image.uri) >= 0) ? marker : null }
        </Image>
      </TouchableOpacity>
    );
  }

  _renderRow(rowData) {
    var items = rowData.map((item) => {
      if (item === null) {
        return null;
      }
      return this._renderImage(item);
    });

    return (
      <View style={styles.row}>
        {items}
      </View>
    );
  }

  _renderFooterSpinner() {
    if (!this.state.noMore) {
      return <ActivityIndicator style={styles.spinner} />;
    }
    return null;
  }

  _onEndReached() {
    if (!this.state.noMore) {
      this.fetch();
    }
  }

  _selectImage(node) {
    var {maximum, imagesPerRow, callback} = this.props;

    var selected = this.state.selected,
        index = this._arrayObjectIndexOf(selected, 'uri', node.image.uri);

    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      if (selected.length < maximum) {
        selected.push(node);
      }
    }

    this.setState({
      selected: selected,
      dataSource: this.state.dataSource.cloneWithRows(
        this._nEveryRow(this.state.images, imagesPerRow)
      ),
    });

    callback(this.state.selected, node);
  }

  _nEveryRow(data, n) {
    var result = [],
        temp = [];

    for (var i = 0; i < data.length; ++i) {
      if (i > 0 && i % n === 0) {
        result.push(temp);
        temp = [];
      }
      temp.push(data[i]);
    }

    if (temp.length > 0) {
      while (temp.length !== n) {
        temp.push(null);
      }
      result.push(temp);
    }

    return result;
  }

  _arrayObjectIndexOf(array, property, value) {
    return array.map((o) => { return o.image[property]; }).indexOf(value);
  }
}

const styles = StyleSheet.create({
  wrapper:{
    flex: 1,
  },
  row:{
    flexDirection: 'row',
    flex: 1,
  },
  marker: {
    position: 'absolute',
    top: 5,
    backgroundColor: 'transparent',
  },
  videoMarker: {
    position: 'absolute',
    bottom: 5,
    backgroundColor: 'transparent',
  },
})

CameraRollPicker.propTypes = {
  groupTypes: React.PropTypes.oneOf([
    'Album',
    'All',
    'Event',
    'Faces',
    'Library',
    'PhotoStream',
    'SavedPhotos',
  ]),
  maximum: React.PropTypes.number,
  assetType: React.PropTypes.oneOf([
    'Photos',
    'Videos',
    'All',
  ]),
  imagesPerRow: React.PropTypes.number,
  imageMargin: React.PropTypes.number,
  containerWidth: React.PropTypes.number,
  callback: React.PropTypes.func,
  selected: React.PropTypes.array,
  selectedMarker: React.PropTypes.element,
  backgroundColor: React.PropTypes.string,
}

CameraRollPicker.defaultProps = {
  groupTypes: 'SavedPhotos',
  maximum: 15,
  imagesPerRow: 3,
  imageMargin: 5,
  assetType: 'Photos',
  backgroundColor: 'white',
  selected: [],
  callback: function(selectedImages, currentImage) {
    console.log(currentImage);
    console.log(selectedImages);
  },
}

export default CameraRollPicker;
