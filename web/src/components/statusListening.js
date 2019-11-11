import ReactDOM from 'react-dom'
import React, { Component } from 'react';

class PopupMask extends Component {
    constructor(props) {
        super(props)
    }
    retContainer () {
        if (!this.popupNode) {
            const popupNode = document.createElement('div')
            popupNode.setAttribute('id', 'popup_mask')
            popupNode.innerHTML = "123456789988"
            this.popupNode = popupNode;
            document.body.appendChild(popupNode)
        }
        return this.popupNode
    }
    retContent () {
        return (
            <div className="popup_content">
                aaaaaa
            </div>
        )
    }
    componentDidUpdate () {
        ReactDOM.unstable_renderSubtreeIntoContainer(
            this,
            this.retContent(),
            this.retContainer(),
        )
    }
    render() {
        return null //此处需返回null 避免报错
    }
}

export default PopupMask