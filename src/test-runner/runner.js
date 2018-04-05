import ReactDOM from 'react-dom';
import Iframe from './iframe';

export default class TestRunner {

  constructor(domNode, eventReceiver) {
    this._onStats = null;
    this._domNode = domNode;
    (eventReceiver || window).addEventListener('message', this.handleDataReceived.bind(this), false);
  }

  render(iframeSrc) {
    const iframe = ReactDOM.render(<Iframe iframeSrc={iframeSrc}/>, this._domNode);
    this._iframeRef = iframe.getIframeRef();
  }

  send(sourceCode) {
    iframe.postMessage(sourceCode, '*');
    const iframe = this._iframeRef.contentWindow;
  }

  setTranspileToEs5() {console.log('set');}
  unsetTranspileToEs5() {console.log('unset');}

  onStats(fn) {
    this._onStats = fn;
  }

  handleDataReceived(data) {
    if (this._onStats) {
      const stats = data.data;
      this._onStats(stats);
    }
  }

}
