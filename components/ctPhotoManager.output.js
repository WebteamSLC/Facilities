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
   * @attribute {string} [captureCategory] - Optional category identifier to assign to photos when captured.
   * @attribute {string} [displayCategory] - Optional category on which to filter display of photos
   * @attribute {number} [maxPhotos] - Maximum number of photos that can be captured in this category (default is 3)
   * @event captureComplete - Fired when a photo has been captured
   * @event editPhoto - Fired when user selects edit option
   * @event maxPhotosTaken - Fired when we have taken the maximum number of photos in this category
   */
  var ctPhotoManager = function (_HTMLElement) {
    _inherits(ctPhotoManager, _HTMLElement);

    function ctPhotoManager(self) {
      var _this, _ret;

      _classCallCheck(this, ctPhotoManager);

      self = (_this = _possibleConstructorReturn(this, (ctPhotoManager.__proto__ || Object.getPrototypeOf(ctPhotoManager)).call(this, self)), _this);
      self._initialized = false;
      return _ret = self, _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ctPhotoManager, [{
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
       * @param {string} [filename] - A filename to allocate to the capture photo
       */

    }, {
      key: "takePhoto",
      value: function takePhoto(filename) {
        if (cti.store.photos === undefined) {
          cti.store.photos = [];
        }

        var instance = this;
        if (instance._maxPhotosTaken()) {
          return false;
        }

        var d = new Date();
        var n = d.getTime();
        var id = "photo-" + n;
        var thisPhoto = {
          "id": id,
          "src": id + ".jpg",
          "category": instance.getAttribute("captureCategory") || "(none)",
          "date": d,
          "internalName": id + ".jpg",
          "uploaded": false,
          "modified": false
        };

        function addPhoto() {
          cti.store.photos.push(thisPhoto);
          // Display the photo in the UI
          instance._renderPhoto(thisPhoto);
          instance._fireEvent("captureComplete");
          // Run the check to see if we've taken max number of photos
          instance._maxPhotosTaken();
        }

        if (!window.cordova) {
          thisPhoto.src = "data:image/gif;base64,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";
          addPhoto();
        } else {
          (function () {
            var onCameraSuccess = function onCameraSuccess(img) {
              console.log('debug:: Camera got photo: %s', img);
              movePhoto(img);
            };

            var onCameraError = function onCameraError(r) {
              console.log('error:: Camera error: %s', r);
            };

            var movePhoto = function movePhoto(file) {
              window.resolveLocalFileSystemURI(file, gotImage, resOnError);
            };

            var resOnError = function resOnError(error) {
              console.log('error:: %s', JSON.stringify(error));
            };

            var gotImage = function gotImage(entry) {
              window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (filesys) {
                entry.moveTo(filesys.root, thisPhoto.internalName, function (new_entry) {
                  thisPhoto.src = new_entry.toURL();
                  addPhoto();
                }, function (e2) {
                  console.log('debug:: File system error: %s', JSON.stringify(e2));
                });
              }, function (e1) {
                console.log('error:: File system error: %s', JSON.stringify(e1));
              });
            };

            // We're on device 

            // TODO Use the proper attributes
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
          })();
        }
      }

      /**
       * Delete a photo
       * @param {string} id - The internal id of the photo to remove
       */

    }, {
      key: "deletePhoto",
      value: function deletePhoto(id) {
        this._doDeletePhoto(id);
      }

      /**
       * Clear photos
       */

    }, {
      key: "clearPhotos",
      value: function clearPhotos() {
        alert('Clear photos - not yet implemented');
      }
    }, {
      key: "deletePhotoHandler",
      value: function deletePhotoHandler(e) {
        e = e || window.event;
        var targ = e.target || e.srcElement;
        var id = targ.getAttribute("data-photo-id");
        var that = document.getElementsByTagName('photo-manager')[0];
        that._doDeletePhoto(id);
      }
    }, {
      key: "editPhotoHandler",
      value: function editPhotoHandler(e) {
        e = e || window.event;
        var targ = e.target || e.srcElement;
        var id = targ.getAttribute("data-photo-id");
        var that = document.getElementsByTagName('photo-manager')[0];
        var detail = { "id": id, "photosContainer": cti.store.photos };
        if (cti.fnNavigatePhotoDetail !== undefined) {
          cti.fnNavigatePhotoDetail(detail);
        } else {
          that._fireEvent("editPhoto", detail);
        }
      }
    }, {
      key: "_doDeletePhoto",
      value: function _doDeletePhoto(id) {
        var index = undefined;
        for (var k in cti.store.photos) {
          if (cti.store.photos[k].id == id) {
            index = k;
            break;
          }
        }

        if (index === undefined) {
          console.log("debug:: Photo id " + id + " not found for deletion");
          return false;
        }

        var elem = document.getElementById(id);
        if (!window.cordova) {
          cti.store.photos.splice(index, 1);
          if (cti.store.photos.length === 0) {
            delete cti.store.photos;
            cti.utils.updatePage();
          }
          elem.remove();
          return false;
        }

        // TODO Remove from the file system
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
          window.resolveLocalFileSystemURI(cti.store.photos[index].src, function (entry) {
            entry.remove(function () {
              cti.store.photos.splice(index, 1);
              elem.remove();
            }, function (e1) {
              console.log("error:: Problem removing file - " + JSON.stringify(e1));
            }, function () {
              console.log("error:: Problem removing file - probably does not exist");
            });
          }, function (e2) {
            console.log("error:: Problem resolving file URL - " + JSON.stringify(e2));
          });
        }, function (e3) {
          console.log("error:: Problem getting file system - " + JSON.stringify(e3));
        });
      }
    }, {
      key: "_maxPhotosTaken",
      value: function _maxPhotosTaken() {
        // Check that we're able to take more photos
        var category = this.getAttribute("captureCategory");
        var maxPhotos = this.getAttribute("maxPhotos") || 3;
        var photosTaken = 0;
        for (var k in cti.store.photos) {
          if (category === undefined || category == null || category.toLowerCase() == cti.store.photos[k].category.toLowerCase()) {
            photosTaken++;
          }
        }
        var result = maxPhotos === 0 || photosTaken >= maxPhotos;
        if (result) {
          this._fireEvent("maxPhotosTaken", { "maxPhotos": maxPhotos });
        }
        return result;
      }
    }, {
      key: "_buildElements",
      value: function _buildElements() {
        var html = '<div id="photoArea"></div>';
        this.innerHTML = html;
      }
    }, {
      key: "_render",
      value: function _render() {
        if (!this._initialized) return;

        var displayCategory = this.getAttribute("displayCategory");

        if (cti.store.photos !== undefined) {
          for (var k in cti.store.photos) {
            // Display all photos if we've not specified a display category
            if (displayCategory === undefined || displayCategory === null || displayCategory.toLowerCase() == cti.store.photos[k].category.toLowerCase()) {
              this._renderPhoto(cti.store.photos[k]);
            }
          }
        }
      }
    }, {
      key: "_renderPhoto",
      value: function _renderPhoto(photoObject) {
        if (photoObject.category === undefined) {
          photoObject.category = "(not set)";
        }
        if (photoObject.date === undefined) {
          photoObject.date = new Date();
        }

        var photoRow = document.createElement('div');
        photoRow.setAttribute("data-photo-id", photoObject.id);
        photoRow.className = 'photo-row';
        photoRow.id = photoObject.id;

        var photoContainer = document.createElement('div');
        photoContainer.className = 'photo-container';

        var photoInfoContainer = document.createElement('div');
        photoInfoContainer.className = 'photo-info-container';

        var photoInfoBanner = document.createElement("div");
        photoInfoBanner.className = 'photo-info-banner';

        var descriptionOption = document.createElement("span");
        descriptionOption.className = 'description-option';
        descriptionOption.innerHTML = 'Edit...';
        descriptionOption.setAttribute("data-photo-id", photoObject.id);
        descriptionOption.onclick = this.editPhotoHandler;

        // Add the info elements
        var categoryInfo = document.createElement("div");
        categoryInfo.className = 'photo-info';
        categoryInfo.innerHTML = '<span>Category</span>' + photoObject.category;

        var dateInfo = document.createElement("div");
        dateInfo.className = 'photo-info';
        dateInfo.innerHTML = '<span>Date</span>' + photoObject.date;

        var img = document.createElement('img');
        img.src = photoObject.src;
        photoContainer.appendChild(img);
        photoInfoBanner.appendChild(descriptionOption);
        //photoInfoBanner.appendChild(deleteOption);
        photoInfoContainer.appendChild(photoInfoBanner);
        photoInfoContainer.appendChild(categoryInfo);
        photoInfoContainer.appendChild(dateInfo);
        photoRow.appendChild(photoContainer);
        photoRow.appendChild(photoInfoContainer);

        // Add to page
        var container = this.childNodes[0];
        container.appendChild(photoRow);
      }
    }, {
      key: "_fireEvent",
      value: function _fireEvent(eventName, detail) {
        if (!this._initialized) return;
        this.dispatchEvent(new CustomEvent(eventName, { 'detail': detail }));
      }
    }], [{
      key: "observedAttributes",
      get: function get() {
        return ["captureWidth", "captureHeight", "captureQuality", "captureCategory", "displayCategory", "captureComplete"];
      }
    }]);

    return ctPhotoManager;
  }(HTMLElement);

  customElements.define('ct-photo-manager', ctPhotoManager);
})();