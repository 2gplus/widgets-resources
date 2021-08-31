# Changelog
All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0] - 2021-08-26
### Notifications widget
#### Added
- handle local notification "On open" actions. Note: local notification's do not handle "On receive" actions, despite being able to configure these in Studio Pro.
#### Fixed
- a configured "Actions" property will receive the correct value; a concatenation of matching action names.

## [3.0.0] - 2021-07-14

### Changed
- TakePicture and TakePictureAdvanced actions support Android 11.
- TakePicture and TakePictureAdvanced actions no longer support 'either' as a value for the parameter "pictureSource". You can model an action sheet using the Bottom sheet widget in the case where you want to offer to users "take picture" or "choose picture from image library" functionality.