import React, { Component } from 'react';
import { EditorState, convertToRaw ,ContentState} from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';



function uploadImageCallBack(file) {
    console.log(file)
    return new Promise(
        /*(resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://api.imgur.com/3/image');
            xhr.setRequestHeader('Authorization', 'Client-ID XXXXX');
            const data = new FormData();
            data.append('image', file);
            xhr.send(data);
            xhr.addEventListener('load', () => {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
            });
            xhr.addEventListener('error', () => {
                const error = JSON.parse(xhr.responseText);
                reject(error);
            });
        }*/
        (resolve, reject) => {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            let img = new Image();
            // let url = ''
            reader.onload = function (e) {
                img.src = this.result
                resolve({
                    data: {
                        link: img.src
                    }
                })
            }
        }
    );
}

export default class EditorConvertToHTML extends Component {
    state = {
        editorState: EditorState.createEmpty(),
    };

    onEditorStateChange=(editorState)=> {
        this.setState({
            editorState,
        },()=>{
            //将富文本转换为html
            const htmlDom = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
            this.props.content(htmlDom);
            /*const contentBlock = htmlToDraft(nextProps.getSysResult.data.roomnotes);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                const editorState = EditorState.createWithContent(contentState);
                this.setState({ editorState })
            }*/
        });
    };

    render() {
        const { editorState } = this.state;
        return (
            <div>
                <Editor
                    editorState={editorState}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                    onEditorStateChange={this.onEditorStateChange}
                    localization={{ locale: 'zh'}}
                    onChange={this.onChange}
                    toolbar={{
                        list: { inDropdown: true },
                        link: { inDropdown: true },
                        history: { inDropdown: true },
                        image: { uploadCallback: uploadImageCallBack, alt: { present: false, mandatory: false } },
                    }}
                />
            </div>
        );
    }
}

