"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {

    /**
     * Manage and list photos
     * @attribute {number} [captureWidth] - Width restriction on captured photos
     * @attribute {number} [captureHeight] - Height restriction on captured photos
     * @attribute {number=50|75|90|100} [captureQuality] - QUality setting for captured photos
     * @event captureComplete - Fired when a photo has been captured
     */
    var slcAuditPhoto = function (_HTMLElement) {
        _inherits(slcAuditPhoto, _HTMLElement);

        function slcAuditPhoto(self) {
            var _this, _ret;

            _classCallCheck(this, slcAuditPhoto);

            self = (_this = _possibleConstructorReturn(this, (slcAuditPhoto.__proto__ || Object.getPrototypeOf(slcAuditPhoto)).call(this, self)), _this);
            self._initialized = false;
            return _ret = self, _possibleConstructorReturn(_this, _ret);
        }

        _createClass(slcAuditPhoto, [{
            key: "connectedCallback",
            value: function connectedCallback() {
                this._initialized = true;
                this._buildElements();
                this._render();
            }
        }, {
            key: "attributeChangedCallback",
            value: function attributeChangedCallback(attrName) {}

            /**
             * Take a photo
             */

        }, {
            key: "takePhoto",
            value: function takePhoto() {
                var instance = this;
                var auditKey = instance._auditPhotosKey();
                var thisPhoto = instance._photoObject();
                if (!window.cordova) {
                    return addPhoto();
                }

                function addPhoto(content) {
                    thisPhoto.src = content; // undefined if on desktop so we dont store the dummy photo
                    var photos = instance._getAuditPhotos(auditKey);

                    photos.push(thisPhoto);
                    instance._setAuditPhotos(auditKey, photos);
                    // Display the photo in the UI
                    instance._renderPhoto(thisPhoto);
                    instance._enableButtons(false, true);
                    instance._fireEvent("captureComplete");
                    return true;
                }
                function onCameraSuccess(img) {
                    movePhoto(img);
                }
                function onCameraError(r) {
                    console.log('error:: Camera error: %s', r);
                }
                function movePhoto(file) {
                    window.resolveLocalFileSystemURI(file, gotImage, resOnError);
                }
                function gotImage(entry) {
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (filesys) {
                        entry.moveTo(filesys.root, thisPhoto.internalName, function (new_entry) {
                            addPhoto(new_entry.toURL());
                        }, function (e2) {
                            console.log('debug:: File system error: %s', JSON.stringify(e2));
                        });
                    }, function (e1) {
                        console.log('error:: File system error: %s', JSON.stringify(e1));
                    });
                }
                function resOnError(err) {
                    console.log('error:: %s', JSON.stringify(err));
                }

                // We're on device 
                window.navigator.camera.getPicture(onCameraSuccess, onCameraError, {
                    quality: instance.getAttribute("captureQuality") || 75,
                    destinationType: 1,
                    sourceType: 1,
                    allowEdit: false,
                    encodingType: 0,
                    saveToPhotoAlbum: false,
                    correctOrientation: true,
                    targetWidth: instance.getAttribute("captureWidth") || 1024,
                    targetHeight: instance.getAttribute("captureHeight") || 768,
                    cameraDirection: 0
                });
            }

            /*
            =======================================================================
            Button click event handlers
            =======================================================================
            */

        }, {
            key: "deletePhotoHandler",
            value: function deletePhotoHandler(e) {
                e = e || window.event;
                var targ = e.target || e.srcElement;
                var container = targ.parentElement;
                while (container.tagName.toLowerCase() != "slc-audit-photo" && container.parentElement) {
                    container = container.parentElement;
                }
                container._clearPhotos();
            }
        }, {
            key: "takePhotoHandler",
            value: function takePhotoHandler(e) {
                e = e || window.event;
                var targ = e.target || e.srcElement;
                var container = targ.parentElement;
                while (container.tagName.toLowerCase() != "slc-audit-photo" && container.parentElement) {
                    container = container.parentElement;
                }
                container.takePhoto();
            }

            /*
            =======================================================================
            Deletion of the stored photo
            =======================================================================
            */

        }, {
            key: "_clearPhotos",
            value: function _clearPhotos() {
                var instance = this;
                var auditKey = instance._auditPhotosKey();
                var photos = instance._getAuditPhotos(auditKey);

                if (photos.length === 0) {
                    return;
                }
                // If we are on desktop, just clear the object content
                if (!window.cordova) {
                    photos.splice(0, photos.length);
                    instance._setAuditPhotos(auditKey, photos);
                    instance._buildElements();
                    instance._render();
                    return true;
                }

                var photoIndex = photos.length;

                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
                    function error(msg, err) {
                        console.log("error:: " + msg + " - " + err ? JSON.stringify(err) : "");
                        deleteNextFile();
                    }
                    function deleteNextFile() {
                        if (--photoIndex < 0) {
                            instance._buildElements();
                            instance._render();
                            return true;
                        }

                        window.resolveLocalFileSystemURI(photos[photoIndex].src, function (entry) {
                            entry.remove(function () {
                                photos.splice(photoIndex, 1);
                                instance._setAuditPhotos(auditKey, photos);
                                deleteNextFile();
                            }, function (e1) {
                                error("Problem removing file", e1);
                            }, function () {
                                error("Problem removing file, probably does not exist");
                            });
                        }, function (err) {
                            error("Failed to access file", err);
                        });
                    }
                    deleteNextFile();
                }, function (e3) {
                    console.log("error:: Problem getting file system - " + JSON.stringify(e3));
                });
            }

            /*
            =======================================================================
            Photo storage management
            =======================================================================
            */

        }, {
            key: "_photoObject",
            value: function _photoObject() {
                var d = new Date();
                var n = d.getTime();
                var id = "photo-" + n;
                var photo = {
                    "id": id,
                    "src": id + ".jpg",
                    "date": d,
                    "internalName": id + ".jpg",
                    "uploaded": false,
                    "modified": false
                };
                return photo;
            }

            // Get the reference to the audit photos store for the audit entry we're associated with

        }, {
            key: "_getAuditPhotos",
            value: function _getAuditPhotos(key) {
                var data = localStorage.getItem("photos__" + key);
                return data ? JSON.parse(data) : [];
            }
            // Save the audit photos for the audit entry we're associated with

        }, {
            key: "_setAuditPhotos",
            value: function _setAuditPhotos(key, photos) {
                if (photos && photos.length > 0) {
                    localStorage.setItem("photos__" + key, JSON.stringify(photos));
                } else {
                    localStorage.removeItem("photos__" + key);
                }
            }
        }, {
            key: "_auditPhotosKey",
            value: function _auditPhotosKey() {
                var container = this.parentElement;
                while (container.tagName.toLowerCase() != "li" && container.parentElement) {
                    container = container.parentElement;
                }

                // See if we have an item with a photo key reference, we'll use that as the storage key
                // in the photos store
                var item = container.querySelector('[data-photo-key]');
                return item ? item.getAttribute("data-photo-key") : undefined;
            }

            /*
            =======================================================================
            Rendering the control
            =======================================================================
            */

        }, {
            key: "_buildElements",
            value: function _buildElements() {
                var html = '<div id="photoArea" class="photo-area"><button class="take-photo-button">Take photo</button><button class="delete-photo-button">Delete photo</button></div>';
                this.innerHTML = html;
            }
        }, {
            key: "_render",
            value: function _render() {
                if (!this._initialized) return;

                this.querySelector('.take-photo-button').onclick = this.takePhotoHandler;
                this.querySelector('.delete-photo-button').onclick = this.deletePhotoHandler;
                var instance = this;
                setTimeout(function () {
                    instance._renderPhotos();
                }, 200);
            }
        }, {
            key: "_renderPhotos",
            value: function _renderPhotos() {
                var auditKey = this._auditPhotosKey();
                var photos = this._getAuditPhotos(auditKey);
                this._enableButtons(photos.length < 1, photos.length > 0);
                for (var k in photos) {
                    this._renderPhoto(photos[k]);
                }
            }
        }, {
            key: "_enableButtons",
            value: function _enableButtons(canTake, canDelete) {
                this.querySelector('.take-photo-button').style.display = canTake ? '' : 'none';
                this.querySelector('.delete-photo-button').style.display = canDelete ? '' : 'none';
            }
        }, {
            key: "_renderPhoto",
            value: function _renderPhoto(photoObject) {
                if (photoObject.date === undefined) {
                    photoObject.date = new Date();
                }

                var photoRow = document.createElement('div');
                photoRow.setAttribute("data-photo-id", photoObject.id);
                photoRow.className = 'photo-row';
                photoRow.id = photoObject.id;

                var photoContainer = document.createElement('div');
                photoContainer.className = 'photo-container';

                var deleteOption = document.createElement("button");
                deleteOption.setAttribute("data-photo-id", photoObject.id);
                deleteOption.className = 'delete-photo-button';
                deleteOption.innerHTML = 'Delete';
                deleteOption.onclick = this.deletePhotoHandler;

                var img = document.createElement('img');
                img.src = photoObject.src || this._dummyPhoto();
                photoContainer.appendChild(img);
                photoRow.appendChild(photoContainer);
                //photoRow.appendChild(deleteOption);

                // Add to page
                var container = this.querySelector('.photo-area');
                container.appendChild(photoRow);
            }
        }, {
            key: "_fireEvent",
            value: function _fireEvent(eventName, detail) {
                if (!this._initialized) return;
                this.dispatchEvent(new CustomEvent(eventName, { 'detail': detail }));
            }
        }, {
            key: "_dummyPhoto",
            value: function _dummyPhoto() {
                return "data:image/gif;base64,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";
            }
        }], [{
            key: "observedAttributes",
            get: function get() {
                return ["captureWidth", "captureHeight", "captureQuality", "captureComplete"];
            }
        }]);

        return slcAuditPhoto;
    }(HTMLElement);

    customElements.define('slc-audit-photo', slcAuditPhoto);
})();