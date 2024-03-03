
# OFSC plugin-boilerplate [Type Script]

Oracle's codes are somewhat complex, but I have tried to make them easier to use, build and upload.

### Install
```
npm install
```

### build

```
just dev-pack
```
### zip
```
just dev-zip

// It will generate a plugin.zip file in the dist folder. 
//You can upload the plugin.zip file in the OFSC Plugin.
```

### Upload

Update plugin.xml and credentials.json  before upload

```
justfile upload
```