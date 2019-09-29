import React from 'react';

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "",
            placename: "",
            location: "",
        };
        this.show = this.show.bind(this);
    }
    show() {
        $(this.modalForm).modal('show');
    }
    componentDidMount() {
        this.state.isedit = this.props.isedit;
    }
    render() {
        return (
        <div id={this.props.id} ref={el => this.modalForm = el}
            className="modal fade" role="dialog">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{this.props.title}</h4>
                        <button type="button" className="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div className="modal-body">
                        <form id="blog-form">
                            <div className="form-group">
                                <label htmlFor="places-date">Date:</label>
                                <input type="text" className="form-control" id="places-date" placeholder="yyyymmdd" pattern="^\d{4}\d{2}\d{2}$" required={!this.props.isedit} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="placename">Place Name:</label>
                                <input type="text" className="form-control" id="placename" value={this.props.placename} readOnly />
                                <input type="hidden" className="form-control" id="location" value={this.props.location} readOnly />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fileToUpload_places">Upload Photo:</label>
                                <input type="file" className="imgInput" name="fileToUpload_places" id="fileToUpload_places" accept="image/*" required={!this.props.isedit} />
                                <div className="upload-msg" id="uploadMsg_places">
                                    Upload the image
                                </div>
                                <div className="upload-wrap" id="uploadWrap_places">
                                <div className="cropContainer" id="cropContainer_places"></div>
                                <button type="button" className="btn btn-outline-dark crop-rotate_places" data-deg="-90">Rotate Left</button>
                                <button type="button" className="btn btn-outline-dark crop-rotate_places" data-deg="90">Rotate Right</button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="places-notes">Post:</label>
                                <textarea className="form-control" id="places-notes" rows="2" maxLength="128" placeholder="notes"/>
                            </div>
                            <button type="submit" className="btn btn-outline-dark" id="placessubbtn">Submit</button>
                        </form>
                        <div id="progressbar-places" style={{visibility: 'hidden'}}>
                            <p>Updating timeline ... Please wait ...</p>
                            <progress></progress>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-dark" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        )
    }
}

export default Form;
