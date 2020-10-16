import React, { ChangeEvent, Component } from 'react';
import { encode } from 'blurhash';
import { Blurhash } from 'react-blurhash';

type PreviewerState = {
  files: FileList | null,
  imageSources: string[],
  blurHashes: string[]
};

type Props = {}

class Previewer extends Component<Props, PreviewerState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      files: null,
      imageSources: [],
      blurHashes: []
    }
    this.onFilesSelected = this.onFilesSelected.bind(this);
    this.renderPreviews = this.renderPreviews.bind(this);
    this.readAndPreview = this.readAndPreview.bind(this);
    this.onFileReaderLoad = this.onFileReaderLoad.bind(this);
  }

  onFilesSelected(event : ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files) {
      return;
    }
    [].map.call(files, this.readAndPreview);
  }

  onFileReaderLoad(event: ProgressEvent<FileReader>) {
    let newImageSource = event.target?.result;
    if (!newImageSource) {
      return;
    }

    const img = new Image();
    img.src = newImageSource.toString();
    const canvas = new OffscreenCanvas(img.width, img.height);
    const context = canvas.getContext('2d');
    context?.drawImage(img, 0, 0);
    const data = context?.getImageData(0, 0, img.width, img.height);

    if (!data) {
      return;
    }
    const blurHash = encode(data.data, data.width, data.height, 4, 6);

    let newHashes = this.state.blurHashes;
    newHashes.push(blurHash.toString());

    this.setState({
      blurHashes: newHashes
    });
  }

  readAndPreview(file: File) {
    // Make sure `file.name` matches our extensions criteria
    if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
      var reader = new FileReader();
  
      reader.addEventListener("load", this.onFileReaderLoad);
  
      reader.readAsDataURL(file);
    }
  }

  renderPreviews() {
    return (
      <div>
        {this.state.blurHashes.map((hash: string) => <Blurhash hash={hash} key={hash}/>)}
      </div>
    );
  }

  render() {
    return (
      <div className="Previews">
        <input type="file" multiple onChange={this.onFilesSelected}></input>
        {this.renderPreviews()}
      </div>
    );
  }
}

export default Previewer;
